"""
Chat router — send a message and get a RAG-powered response.

Endpoint:
  POST /api/chat   — query the RAG pipeline
"""

from fastapi import APIRouter, Depends

from ..dependencies import get_current_user, get_rag_service
from ..schemas.auth import UserProfile
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.rag_service import RAGService

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user: UserProfile = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Send a user message and receive an AI-generated answer
    grounded in the user's uploaded documents.
    """
    conversation_id = body.conversation_id or f"conv-{user.id}-default"

    return await rag_service.answer(
        user_id=user.id,
        conversation_id=conversation_id,
        message=body.message,
        retrieval_method=body.retrieval_method,
    )
