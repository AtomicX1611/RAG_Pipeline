"""
In-memory conversation & message storage.

Conversations are keyed per-user so each authenticated account sees only its
own history.  Data is lost on server restart (acceptable for dev/demo).

Thread-safe via asyncio.Lock.
"""

from __future__ import annotations

import asyncio
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from dataclasses import dataclass, field

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


@dataclass
class Message:
    id: str
    role: str           # "user" | "assistant"
    content: str
    timestamp: str      # ISO-8601


@dataclass
class Conversation:
    id: str
    title: str
    preview: str = ""
    created_at: str = ""
    message_count: int = 0
    messages: list[Message] = field(default_factory=list)

    def to_response_dict(self) -> dict:
        """Shape that matches the frontend ConversationResponse schema."""
        return {
            "id": self.id,
            "title": self.title,
            "preview": self.preview,
            "createdAt": self.created_at,
            "messageCount": self.message_count,
        }


class ConversationRepository:
    """Per-user in-memory conversation store."""

    def __init__(self) -> None:
        # { user_id: { conv_id: Conversation } }
        self._store: dict[str, dict[str, Conversation]] = defaultdict(dict)
        self._lock = asyncio.Lock()
        logger.info("ConversationRepository initialised (in-memory)")

    async def create(self, user_id: str, title: str = "New Conversation") -> Conversation:
        async with self._lock:
            conv = Conversation(
                id=str(uuid.uuid4()),
                title=title,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            self._store[user_id][conv.id] = conv
            logger.debug("Created conversation %s for user %s", conv.id, user_id)
            return conv

    async def get_all(self, user_id: str) -> list[Conversation]:
        async with self._lock:
            convs = list(self._store[user_id].values())
        # newest first
        convs.sort(key=lambda c: c.created_at, reverse=True)
        return convs

    async def get_by_id(self, user_id: str, conv_id: str) -> Conversation | None:
        async with self._lock:
            return self._store[user_id].get(conv_id)

    async def delete(self, user_id: str, conv_id: str) -> bool:
        async with self._lock:
            removed = self._store[user_id].pop(conv_id, None)
            if removed:
                logger.debug("Deleted conversation %s for user %s", conv_id, user_id)
            return removed is not None

    async def add_message(
        self, user_id: str, conv_id: str, role: str, content: str,
    ) -> Message:
        async with self._lock:
            conv = self._store[user_id].get(conv_id)
            if conv is None:
                # Auto-create conversation
                conv = Conversation(
                    id=conv_id,
                    title="New Conversation",
                    created_at=datetime.now(timezone.utc).isoformat(),
                )
                self._store[user_id][conv_id] = conv

            msg = Message(
                id=str(uuid.uuid4()),
                role=role,
                content=content,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
            conv.messages.append(msg)
            conv.message_count = len(conv.messages)

            # Keep preview updated with last user message
            if role == "user":
                conv.preview = content[:100]
                # Update title from first user message
                if conv.title == "New Conversation":
                    conv.title = content[:40].strip() or "New Conversation"

            return msg

    async def get_messages(self, user_id: str, conv_id: str) -> list[Message]:
        async with self._lock:
            conv = self._store[user_id].get(conv_id)
            if conv is None:
                return []
            return list(conv.messages)
