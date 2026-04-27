"""Pydantic models for conversation endpoints."""

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    """Body of POST /api/conversations."""
    title: str = Field(default="New Conversation", max_length=200)


class ConversationResponse(BaseModel):
    """A single conversation returned by the API."""
    id: str
    title: str
    preview: str = ""
    createdAt: str                  # ISO-8601, camelCase to match frontend
    messageCount: int = 0
