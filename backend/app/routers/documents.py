"""
Documents router — manage user's vector store documents.

Endpoints:
  GET    /api/documents        — document count & stats for the user
  DELETE /api/documents        — purge all documents for the user
"""

from fastapi import APIRouter, Depends

from ..dependencies import get_current_user, get_vector_repository
from ..repositories.vector_repository import VectorRepository
from ..schemas.auth import UserProfile
from ..schemas.documents import DocumentStats

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=DocumentStats)
async def get_document_stats(
    user: UserProfile = Depends(get_current_user),
    vector_repo: VectorRepository = Depends(get_vector_repository),
):
    """Return stats about the authenticated user's document collection."""
    count = vector_repo.collection_count(user.id)
    return DocumentStats(
        totalChunks=count,
        hasDocuments=count > 0,
        message=f"Your collection contains {count} indexed chunk(s).",
    )


@router.delete("")
async def delete_all_documents(
    user: UserProfile = Depends(get_current_user),
    vector_repo: VectorRepository = Depends(get_vector_repository),
):
    """Delete all documents in the user's vector collection."""
    vector_repo.delete_collection(user.id)
    return {"success": True, "message": "All documents deleted successfully."}
