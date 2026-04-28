"""Pydantic models for chat / RAG query endpoints."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Body of POST /api/chat."""
    workspace_id: str | None = None
    conversation_id: str | None = None
    message: str = Field(..., min_length=1, max_length=4000)
    chunking_strategy: str = "recursive"
    retrieval_method: str = "similarity"


class Source(BaseModel):
    """A single source document returned alongside an answer."""
    id: str
    filename: str
    content: str
    relevanceScore: float          # camelCase to match frontend expectations


class ChatResponse(BaseModel):
    """Response from POST /api/chat."""
    answer: str
    sources: list[Source] = []
