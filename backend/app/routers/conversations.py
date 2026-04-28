"""
Conversations router — CRUD for chat conversations.

Endpoints:
  GET    /api/conversations                    — list conversations (optionally filtered by workspace)
  POST   /api/conversations                    — create a new conversation
  DELETE /api/conversations/{id}               — delete a conversation
"""

from fastapi import APIRouter, Depends, Query, Response, status

from ..dependencies import get_conversation_service, get_current_user
from ..schemas.auth import UserProfile
from ..schemas.conversations import ConversationCreate, ConversationResponse
from ..services.conversation_service import ConversationService

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    workspace_id: str | None = Query(default=None, alias="workspace_id"),
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Return all conversations for the authenticated user (newest first).
    Pass ?workspace_id=<id> to filter to a specific workspace.
    """
    return await conv_service.list_all(user.id, workspace_id=workspace_id)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate,
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Create a new empty conversation, optionally scoped to a workspace."""
    return await conv_service.create(user.id, body.title, workspace_id=body.workspace_id)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    user: UserProfile = Depends(get_current_user),
    conv_service: ConversationService = Depends(get_conversation_service),
):
    """Delete a conversation by ID."""
    await conv_service.delete(user.id, conversation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
