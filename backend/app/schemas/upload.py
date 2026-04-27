"""Pydantic models for file upload endpoints."""

from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response from POST /api/upload."""
    success: bool
    filesProcessed: int
    message: str = ""
