"""
Analytics service — aggregates usage statistics per user.

Tracks conversation counts, message counts, document counts,
chunking strategy usage, and retrieval method usage.
Data is aggregated from the conversation & vector repositories.
"""

from __future__ import annotations

import asyncio
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from ..repositories.conversation_repository import ConversationRepository
from ..repositories.vector_repository import VectorRepository
from ..schemas.analytics import (
    AnalyticsResponse,
    ChunkingUsage,
    DailyActivity,
    RetrievalUsage,
)
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class AnalyticsService:
    """Aggregate user usage analytics from conversation and vector repositories."""

    def __init__(
        self,
        conv_repo: ConversationRepository,
        vector_repo: VectorRepository,
    ) -> None:
        self._conv_repo = conv_repo
        self._vector_repo = vector_repo
        # Track per-user upload/strategy/retrieval counts in-memory
        self._upload_counts: dict[str, int] = defaultdict(int)
        self._chunking_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._retrieval_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._source_files: dict[str, list[str]] = defaultdict(list)

    def record_upload(self, user_id: str, strategy: str, filenames: list[str]) -> None:
        """Record an upload event (called by upload service)."""
        self._upload_counts[user_id] += 1
        self._chunking_counts[user_id][strategy] += 1
        for fn in filenames:
            if fn not in self._source_files[user_id]:
                self._source_files[user_id].append(fn)

    def record_query(self, user_id: str, retrieval_method: str) -> None:
        """Record a RAG query event (called by rag service)."""
        self._retrieval_counts[user_id][retrieval_method] += 1

    async def get_user_analytics(self, user_id: str) -> AnalyticsResponse:
        """Compute and return analytics for the given user."""
        conversations = await self._conv_repo.get_all(user_id)
        total_conversations = len(conversations)
        total_messages = sum(c.message_count for c in conversations)

        avg_messages = (
            round(total_messages / total_conversations, 1)
            if total_conversations > 0
            else 0.0
        )

        # Document chunk count from vector store
        total_chunks = self._vector_repo.collection_count(user_id)

        # Daily activity for last 7 days
        daily = self._build_daily_activity(conversations)

        # Chunking usage
        chunking = self._build_chunking_usage(user_id)

        # Retrieval usage
        retrieval = self._build_retrieval_usage(user_id)

        # Top sources (uploaded filenames)
        top_sources = self._source_files[user_id][:10]

        return AnalyticsResponse(
            totalConversations=total_conversations,
            totalMessages=total_messages,
            totalDocumentChunks=total_chunks,
            totalUploads=self._upload_counts[user_id],
            avgMessagesPerConversation=avg_messages,
            dailyActivity=daily,
            chunkingUsage=chunking,
            retrievalUsage=retrieval,
            topSources=top_sources,
        )

    # ── private helpers ────────────────────────────────────────────────────

    def _build_daily_activity(self, conversations) -> list[DailyActivity]:
        """Build last-7-days activity from conversation created_at timestamps."""
        today = datetime.now(timezone.utc).date()
        counts: dict[str, int] = {}

        for i in range(7):
            day = (today - timedelta(days=6 - i)).isoformat()
            counts[day] = 0

        for conv in conversations:
            try:
                day = conv.created_at[:10]
                if day in counts:
                    counts[day] += conv.message_count
            except Exception:
                pass

        return [
            DailyActivity(date=day, messages=msgs, queries=max(0, msgs // 2))
            for day, msgs in counts.items()
        ]

    def _build_chunking_usage(self, user_id: str) -> list[ChunkingUsage]:
        raw = dict(self._chunking_counts[user_id])
        total = sum(raw.values()) or 1
        strategies = ["fixed", "recursive", "semantic", "agentic"]
        result = []
        for s in strategies:
            count = raw.get(s, 0)
            result.append(ChunkingUsage(
                strategy=s,
                count=count,
                percentage=round(count / total * 100, 1),
            ))
        return result

    def _build_retrieval_usage(self, user_id: str) -> list[RetrievalUsage]:
        raw = dict(self._retrieval_counts[user_id])
        total = sum(raw.values()) or 1
        methods = ["similarity", "multi_query", "rrf"]
        result = []
        labels = {
            "similarity": "Similarity Search",
            "multi_query": "Multi-Query",
            "rrf": "RRF",
        }
        for m in methods:
            count = raw.get(m, 0)
            result.append(RetrievalUsage(
                method=labels.get(m, m),
                count=count,
                percentage=round(count / total * 100, 1),
            ))
        return result
