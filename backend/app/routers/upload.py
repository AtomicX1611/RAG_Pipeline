"""
Upload router — PDF / TXT file upload with chunking strategy selection.

Endpoint:
  POST /api/upload   — upload files + chunking_strategy form field
"""

from fastapi import APIRouter, Depends, File, Form, UploadFile

from ..dependencies import get_current_user, get_upload_service
from ..schemas.auth import UserProfile
from ..schemas.upload import UploadResponse
from ..services.upload_service import UploadService

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: list[UploadFile] = File(..., description="PDF or TXT files"),
    chunking_strategy: str = Form(default="recursive"),
    user: UserProfile = Depends(get_current_user),
    upload_service: UploadService = Depends(get_upload_service),
):
    """
    Upload one or more documents.

    The files are parsed, split using the chosen chunking strategy,
    embedded, and stored in the user's personal vector collection.
    """
    result = await upload_service.process_upload(
        user_id=user.id,
        files=files,
        chunking_strategy=chunking_strategy,
    )
    return UploadResponse(**result)
