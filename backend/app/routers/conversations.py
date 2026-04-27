"""
Conversations router — CRUD for chat conversations.

Endpoints:
  GET    /api/conversations       — list all conversations
  POST   /api/conversations       — create a new conversation
  DELETE /api/conversations/{id}  — delete a conversation
"""

from fastapi import APIRouter, Depends, Response, status

from ..dependencies import get_conversation_service, get_current_user
from ..schemas.auth import UserProfile
from ..schemas.conversations import ConversationCreate, ConversationResponse
from ..services.conversation_service import ConversationService

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Return all conversations for the authenticated user (newest first)."""
    return await conv_service.list_all(user.id)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate,
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Create a new empty conversation."""
    return await conv_service.create(user.id, body.title)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Delete a conversation by ID."""
    await conv_service.delete(user.id, conversation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
