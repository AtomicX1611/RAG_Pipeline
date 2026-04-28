"""
ChromaDB vector store wrapper with per-user collection isolation.

Each authenticated user gets their own Chroma collection (``user_{id}``)
so documents are never mixed across accounts.
"""

from __future__ import annotations

from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

from ..config import Settings
from ..utils.logging_config import get_logger

logger = get_logger(__name__)

# Embedding model shared across all collections
_EMBEDDING_MODEL_NAME = "text-embedding-3-small"


class VectorRepository:
    """Thin wrapper around ChromaDB for per-user document storage."""

    def __init__(self, settings: Settings) -> None:
        self._persist_dir = settings.CHROMA_PERSIST_DIR
        self._embeddings = OpenAIEmbeddings(
            model=_EMBEDDING_MODEL_NAME,
            openai_api_key=settings.OPENAI_API_KEY,
        )
        # Ensure the persist directory exists
        Path(self._persist_dir).mkdir(parents=True, exist_ok=True)
        logger.info("VectorRepository initialised (persist=%s)", self._persist_dir)

    # ── helpers ───────────────────────────────────────────────────────────

    def _collection_name(self, user_id: str) -> str:
        """Deterministic collection name scoped to a user."""
        # Chroma collection names: 3-63 chars, alphanumeric + underscores
        safe = user_id.replace("-", "_").replace(".", "_")[:50]
        return f"user_{safe}"

    def _get_store(self, user_id: str) -> Chroma:
        return Chroma(
            collection_name=self._collection_name(user_id),
            embedding_function=self._embeddings,
            persist_directory=self._persist_dir,
            collection_metadata={"hnsw:space": "cosine"},
        )

    # ── public API ────────────────────────────────────────────────────────

    def store_documents(self, user_id: str, chunks: list[Document]) -> int:
        """Embed and store document chunks.  Returns the number stored."""
        if not chunks:
            return 0

        store = self._get_store(user_id)
        store.add_documents(chunks)
        count = len(chunks)
        logger.info("Stored %d chunks for user %s", count, user_id)
        return count

    def get_retriever(self, user_id: str, *, k: int = 5, **kwargs):
        """Return a LangChain retriever scoped to the user's collection."""
        store = self._get_store(user_id)
        search_kwargs = {"k": k, **kwargs}
        return store.as_retriever(search_kwargs=search_kwargs)

    def similarity_search_with_score(
        self, user_id: str, query: str, *, k: int = 5,
    ) -> list[tuple[Document, float]]:
        """Return (Document, score) pairs for ranking/RRF."""
        store = self._get_store(user_id)
        return store.similarity_search_with_relevance_scores(query, k=k)

    def collection_count(self, user_id: str) -> int:
        """Return the number of documents in the user's collection."""
        store = self._get_store(user_id)
        try:
            count = store._collection.count()
            logger.info("Found %d items in collection for user %s", count, user_id)
            return count
        except Exception as e:
            logger.error("Error getting collection count for user %s: %s", user_id, str(e), exc_info=True)
            return 0

    def delete_collection(self, user_id: str) -> None:
        """Remove a user's entire collection."""
        store = self._get_store(user_id)
        try:
            store.delete_collection()
            logger.info("Deleted collection for user %s", user_id)
        except Exception as exc:
            logger.warning("Could not delete collection for user %s: %s", user_id, exc)
