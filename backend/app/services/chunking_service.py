"""
Chunking service — four strategies adapted from the existing pipeline scripts.

Strategies:
  • fixed      — CharacterTextSplitter  (from ingestion.py)
  • recursive  — RecursiveCharacterTextSplitter  (from character_text_splitter.py)
  • semantic   — SemanticChunker  (from semantic_chunking.py)
  • agentic    — LLM-driven <<<SPLIT>>> markers  (from agentic_chunking.py)
"""

from __future__ import annotations

from langchain_core.documents import Document
from langchain_text_splitters import CharacterTextSplitter, RecursiveCharacterTextSplitter

from ..config import Settings
from ..utils.exceptions import RAGPipelineError
from ..utils.logging_config import get_logger

logger = get_logger(__name__)

# Allowed strategy identifiers (must match frontend CHUNKING_STRATEGIES[].id)
VALID_STRATEGIES = {"fixed", "recursive", "semantic", "agentic"}


class ChunkingService:
    """Split raw text into document chunks using configurable strategies."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def chunk_text(
        self,
        text: str,
        strategy: str = "recursive",
        *,
        source: str = "upload",
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> list[Document]:
        """
        Split *text* into LangChain Documents using the requested strategy.

        Parameters
        ----------
        text : str
            The full text content to chunk.
        strategy : str
            One of ``fixed``, ``recursive``, ``semantic``, ``agentic``.
        source : str
            Value for the ``source`` metadata key on each chunk.
        chunk_size / chunk_overlap : int
            Tuning parameters for fixed and recursive strategies.
        """
        if strategy not in VALID_STRATEGIES:
            raise RAGPipelineError(f"Unknown chunking strategy: {strategy!r}")

        logger.info("Chunking %d chars with strategy=%s", len(text), strategy)

        if strategy == "fixed":
            return self._fixed(text, source, chunk_size, chunk_overlap)
        if strategy == "recursive":
            return self._recursive(text, source, chunk_size, chunk_overlap)
        if strategy == "semantic":
            return self._semantic(text, source)
        if strategy == "agentic":
            return self._agentic(text, source)

        # unreachable — guarded above
        raise RAGPipelineError(f"Unhandled strategy: {strategy}")  # pragma: no cover

    # ── strategy implementations ──────────────────────────────────────────

    def _fixed(
        self, text: str, source: str, chunk_size: int, chunk_overlap: int,
    ) -> list[Document]:
        """CharacterTextSplitter — mirrors ingestion.py."""
        splitter = CharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = splitter.split_text(text)
        return [
            Document(page_content=c, metadata={"source": source})
            for c in chunks
        ]

    def _recursive(
        self, text: str, source: str, chunk_size: int, chunk_overlap: int,
    ) -> list[Document]:
        """RecursiveCharacterTextSplitter — mirrors character_text_splitter.py."""
        splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ". ", " ", ""],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = splitter.split_text(text)
        return [
            Document(page_content=c, metadata={"source": source})
            for c in chunks
        ]

    def _semantic(self, text: str, source: str) -> list[Document]:
        """SemanticChunker — mirrors semantic_chunking.py."""
        try:
            from langchain_experimental.text_splitter import SemanticChunker
            from langchain_openai import OpenAIEmbeddings

            chunker = SemanticChunker(
                embeddings=OpenAIEmbeddings(
                    openai_api_key=self._settings.OPENAI_API_KEY,
                ),
                breakpoint_threshold_type="percentile",
                breakpoint_threshold_amount=70,
            )
            chunks = chunker.split_text(text)
            return [
                Document(page_content=c, metadata={"source": source})
                for c in chunks
            ]
        except Exception as exc:
            logger.error("Semantic chunking failed: %s", exc)
            raise RAGPipelineError(f"Semantic chunking failed: {exc}") from exc

    def _agentic(self, text: str, source: str) -> list[Document]:
        """LLM-powered chunking — mirrors agentic_chunking.py."""
        try:
            from langchain_openai import ChatOpenAI

            llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0,
                openai_api_key=self._settings.OPENAI_API_KEY,
            )

            prompt = f"""
You are a text chunking expert. Split this text into logical chunks.

Rules:
- Each chunk should be around 200 characters or less
- Split at natural topic boundaries
- Keep related information together
- Put "<<<SPLIT>>>" between chunks

Text:
{text}

Return the text with <<<SPLIT>>> markers where you want to split:
"""
            response = llm.invoke(prompt)
            raw_chunks = response.content.split("<<<SPLIT>>>")
            chunks = [c.strip() for c in raw_chunks if c.strip()]

            return [
                Document(page_content=c, metadata={"source": source})
                for c in chunks
            ]
        except Exception as exc:
            logger.error("Agentic chunking failed: %s", exc)
            raise RAGPipelineError(f"Agentic chunking failed: {exc}") from exc
