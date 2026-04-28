"""Pydantic models for analytics endpoints."""

from pydantic import BaseModel
from typing import List


class DailyActivity(BaseModel):
    date: str
    messages: int
    queries: int


class ChunkingUsage(BaseModel):
    strategy: str
    count: int
    percentage: float


class RetrievalUsage(BaseModel):
    method: str
    count: int
    percentage: float


class AnalyticsResponse(BaseModel):
    """Aggregated analytics for a user."""
    totalConversations: int
    totalMessages: int
    totalDocumentChunks: int
    totalUploads: int
    avgMessagesPerConversation: float
    dailyActivity: List[DailyActivity]
    chunkingUsage: List[ChunkingUsage]
    retrievalUsage: List[RetrievalUsage]
    topSources: List[str]
