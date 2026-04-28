"""Pydantic models for document management endpoints."""

from pydantic import BaseModel


class DocumentStats(BaseModel):
    """Stats about the user's document collection."""
    totalChunks: int
    hasDocuments: bool
    message: str
