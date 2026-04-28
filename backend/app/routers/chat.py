"""
Chat router — send a message and get a RAG-powered response.

Endpoints:
  POST /api/chat         — query the RAG pipeline (standard JSON)
  POST /api/chat/stream  — query the RAG pipeline (Server-Sent Events streaming)
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

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


@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest,
    user: UserProfile = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Send a user message and receive a streaming SSE response.
    The stream yields text tokens prefixed with 'data: '.
    A special 'event: sources' event is sent first with source metadata.
    The stream ends with 'data: [DONE]'.
    """
    conversation_id = body.conversation_id or f"conv-{user.id}-default"

    return StreamingResponse(
        rag_service.answer_stream(
            user_id=user.id,
            conversation_id=conversation_id,
            message=body.message,
            retrieval_method=body.retrieval_method,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
