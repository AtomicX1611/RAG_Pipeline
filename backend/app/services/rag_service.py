"""
RAG service — retrieval + answer generation with streaming support.

Retrieval methods (from existing pipeline):
  • similarity   — basic k-nearest (retrieval.py)
  • multi_query  — LLM query variations (multi_query_retrieval.py)
  • rrf          — multi-query + RRF (reciprocal_rank_fusion.py)

Context-aware rewriting mirrors context_RAG.py.
Answer generation mirrors answer_generation.py.
"""

from __future__ import annotations

import uuid
from collections import defaultdict
from typing import AsyncGenerator

from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from ..config import Settings
from ..repositories.conversation_repository import ConversationRepository, Message
from ..repositories.vector_repository import VectorRepository
from ..schemas.chat import ChatResponse, Source
from ..utils.exceptions import RAGPipelineError
from ..utils.logging_config import get_logger

logger = get_logger(__name__)

VALID_RETRIEVAL_METHODS = {"similarity", "multi_query", "rrf"}


class _QueryVariations(BaseModel):
    queries: list[str]


class RAGService:
    """End-to-end retrieval-augmented generation pipeline."""

    def __init__(
        self, settings: Settings,
        vector_repo: VectorRepository,
        conversation_repo: ConversationRepository,
        analytics_service=None,
    ) -> None:
        self._settings = settings
        self._vector_repo = vector_repo
        self._conv_repo = conversation_repo
        self._analytics = analytics_service
        self._llm = ChatOpenAI(model="gpt-4o", openai_api_key=settings.OPENAI_API_KEY)
        self._query_llm = ChatOpenAI(
            model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY,
        )

    async def answer(
        self, user_id: str, conversation_id: str,
        message: str, retrieval_method: str = "similarity",
    ) -> ChatResponse:
        if retrieval_method not in VALID_RETRIEVAL_METHODS:
            retrieval_method = "similarity"

        history = await self._conv_repo.get_messages(user_id, conversation_id)
        search_query = self._rewrite_query(message, history)

        doc_score_pairs = self._retrieve(user_id, search_query, retrieval_method)

        if not doc_score_pairs:
            text = (
                "I don't have any documents to search through yet. "
                "Please upload some documents first."
            )
            await self._persist(user_id, conversation_id, message, text)
            return ChatResponse(answer=text, sources=[])

        docs = [d for d, _ in doc_score_pairs]
        answer_text = self._generate_answer(message, docs, history)
        sources = self._build_sources(doc_score_pairs)

        await self._persist(user_id, conversation_id, message, answer_text)

        # Record analytics
        if self._analytics:
            self._analytics.record_query(user_id, retrieval_method)

        return ChatResponse(answer=answer_text, sources=sources)

    async def answer_stream(
        self, user_id: str, conversation_id: str,
        message: str, retrieval_method: str = "similarity",
    ) -> AsyncGenerator[str, None]:
        """Stream answer tokens as Server-Sent Events."""
        import json as _json

        if retrieval_method not in VALID_RETRIEVAL_METHODS:
            retrieval_method = "similarity"

        try:
            history = await self._conv_repo.get_messages(user_id, conversation_id)
            search_query = self._rewrite_query(message, history)
            doc_score_pairs = self._retrieve(user_id, search_query, retrieval_method)
        except RAGPipelineError as exc:
            err_msg = str(exc)
            if "401" in err_msg or "invalid_api_key" in err_msg or "Incorrect API key" in err_msg:
                error_text = "OpenAI API key is invalid or expired. Please update OPENAI_API_KEY in backend/.env and restart the server."
            else:
                error_text = f"Retrieval failed: {err_msg}"
            yield f"event: error\ndata: {_json.dumps({'detail': error_text})}\n\n"
            yield "data: [DONE]\n\n"
            return
        except Exception as exc:
            yield f"event: error\ndata: {_json.dumps({'detail': str(exc)})}\n\n"
            yield "data: [DONE]\n\n"
            return

        if not doc_score_pairs:
            no_doc_msg = (
                "I don't have any documents to search through yet. "
                "Please upload some documents first."
            )
            await self._persist(user_id, conversation_id, message, no_doc_msg)
            yield f"data: {no_doc_msg}\n\n"
            yield "data: [DONE]\n\n"
            return

        docs = [d for d, _ in doc_score_pairs]
        sources = self._build_sources(doc_score_pairs)

        # Send sources metadata first as a special event
        sources_data = [s.model_dump() for s in sources]
        yield f"event: sources\ndata: {_json.dumps(sources_data)}\n\n"

        # Stream answer tokens
        msgs = self._build_answer_messages(message, docs, history)
        full_answer = ""
        try:
            for chunk in self._llm.stream(msgs):
                token = chunk.content
                if token:
                    full_answer += token
                    # Escape newlines for SSE
                    escaped = token.replace("\n", "\\n")
                    yield f"data: {escaped}\n\n"
        except Exception as exc:
            err_msg = str(exc)
            if "401" in err_msg or "invalid_api_key" in err_msg:
                error_text = "OpenAI API key is invalid or expired. Please update OPENAI_API_KEY in backend/.env and restart the server."
            else:
                error_text = f"Generation failed: {err_msg}"
            # Yield error event if we have partial content, complete what we have
            if not full_answer:
                yield f"event: error\ndata: {_json.dumps({'detail': error_text})}\n\n"

        yield "data: [DONE]\n\n"

        # Persist after streaming completes (even partial answers)
        if full_answer:
            await self._persist(user_id, conversation_id, message, full_answer)
        if self._analytics:
            self._analytics.record_query(user_id, retrieval_method)

    # ── contextual rewriting (context_RAG.py) ─────────────────────────────

    def _rewrite_query(self, question: str, history: list[Message]) -> str:
        if not history:
            return question
        msgs: list = [SystemMessage(content=(
            "Given the chat history, rewrite the new question to be "
            "standalone and searchable. Just return the rewritten question."
        ))]
        for m in history[-10:]:
            cls = HumanMessage if m.role == "user" else AIMessage
            msgs.append(cls(content=m.content))
        msgs.append(HumanMessage(content=f"New question: {question}"))
        try:
            return self._llm.invoke(msgs).content.strip()
        except Exception as exc:
            logger.warning("Query rewriting failed: %s", exc)
            return question

    # ── retrieval dispatch ────────────────────────────────────────────────

    def _retrieve(self, uid: str, q: str, method: str):
        try:
            if method == "similarity":
                return self._vector_repo.similarity_search_with_score(uid, q, k=5)
            if method == "multi_query":
                return self._multi_query(uid, q)
            if method == "rrf":
                return self._rrf(uid, q)
        except Exception as exc:
            logger.error("Retrieval (%s) failed: %s", method, exc)
            raise RAGPipelineError(f"Retrieval failed: {exc}") from exc
        return []

    def _multi_query(self, uid: str, q: str, k: int = 5):
        variations = self._query_variations(q)
        seen: dict[str, tuple[Document, float]] = {}
        for v in variations:
            for doc, score in self._vector_repo.similarity_search_with_score(uid, v, k=k):
                key = doc.page_content
                if key not in seen or score > seen[key][1]:
                    seen[key] = (doc, score)
        return sorted(seen.values(), key=lambda x: x[1], reverse=True)[:k]

    def _rrf(self, uid: str, q: str, k: int = 5, rrf_k: int = 60):
        variations = self._query_variations(q)
        retriever = self._vector_repo.get_retriever(uid, k=k)
        all_results = [retriever.invoke(v) for v in variations]

        scores: dict[str, float] = defaultdict(float)
        doc_map: dict[str, Document] = {}
        for ranked in all_results:
            for pos, doc in enumerate(ranked, 1):
                key = doc.page_content
                doc_map[key] = doc
                scores[key] += 1.0 / (rrf_k + pos)

        return sorted(
            [(doc_map[k], s) for k, s in scores.items()],
            key=lambda x: x[1], reverse=True,
        )[:k]

    def _query_variations(self, query: str, n: int = 3) -> list[str]:
        try:
            structured = self._query_llm.with_structured_output(_QueryVariations)
            prompt = (
                f"Generate {n} different variations of this query that would "
                f"help retrieve relevant documents:\n\nOriginal query: {query}\n\n"
                f"Return {n} alternative queries from different angles."
            )
            return structured.invoke(prompt).queries[:n]
        except Exception as exc:
            logger.warning("Query variation failed: %s", exc)
            return [query]

    # ── answer generation (answer_generation.py) ──────────────────────────

    def _build_answer_messages(self, question: str, docs: list[Document], history: list[Message]) -> list:
        context = "\n".join(f"- {d.page_content}" for d in docs)
        combined = (
            f"Based on the following documents, answer this question: {question}\n\n"
            f"Documents:\n{context}\n\n"
            "Provide a clear answer using only these documents. If you can't find "
            'the answer, say "I don\'t have enough information."'
        )
        msgs: list = [SystemMessage(content=(
            "You are a helpful assistant that answers questions based on "
            "provided documents and conversation history."
        ))]
        for m in history[-10:]:
            cls = HumanMessage if m.role == "user" else AIMessage
            msgs.append(cls(content=m.content))
        msgs.append(HumanMessage(content=combined))
        return msgs

    def _generate_answer(self, question: str, docs: list[Document], history: list[Message]) -> str:
        msgs = self._build_answer_messages(question, docs, history)
        try:
            return self._llm.invoke(msgs).content
        except Exception as exc:
            raise RAGPipelineError(f"Answer generation failed: {exc}") from exc

    # ── helpers ───────────────────────────────────────────────────────────

    def _build_sources(self, pairs: list[tuple[Document, float]]) -> list[Source]:
        return [
            Source(
                id=f"src-{uuid.uuid4().hex[:8]}",
                filename=d.metadata.get("source", "unknown"),
                content=d.page_content[:300],
                relevanceScore=round(float(s), 4),
            )
            for d, s in pairs[:5]
        ]

    async def _persist(self, uid: str, cid: str, q: str, a: str) -> None:
        await self._conv_repo.add_message(uid, cid, "user", q)
        await self._conv_repo.add_message(uid, cid, "assistant", a)
