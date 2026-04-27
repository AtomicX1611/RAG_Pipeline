"""
Conversation service — thin orchestration layer over ConversationRepository.
"""

from __future__ import annotations

from ..repositories.conversation_repository import ConversationRepository
from ..schemas.conversations import ConversationResponse
from ..utils.exceptions import NotFoundError
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class ConversationService:
    """CRUD operations for conversations, scoped to a user."""

    def __init__(self, conversation_repo: ConversationRepository) -> None:
        self._repo = conversation_repo

    async def create(self, user_id: str, title: str = "New Conversation") -> ConversationResponse:
        conv = await self._repo.create(user_id, title)
        return ConversationResponse(**conv.to_response_dict())

    async def list_all(self, user_id: str) -> list[ConversationResponse]:
        convs = await self._repo.get_all(user_id)
        return [ConversationResponse(**c.to_response_dict()) for c in convs]

    async def delete(self, user_id: str, conv_id: str) -> None:
        removed = await self._repo.delete(user_id, conv_id)
        if not removed:
            raise NotFoundError(f"Conversation {conv_id} not found")
