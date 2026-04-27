"""
Upload service — handles file saving, text extraction, chunking, and embedding.
"""

from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from ..config import Settings
from ..repositories.vector_repository import VectorRepository
from ..utils.exceptions import FileValidationError, RAGPipelineError
from ..utils.logging_config import get_logger
from .chunking_service import ChunkingService

logger = get_logger(__name__)

_ALLOWED_EXTENSIONS = {".pdf", ".txt"}


class UploadService:
    """Orchestrates file upload → text extraction → chunking → embedding."""

    def __init__(
        self,
        settings: Settings,
        chunking_service: ChunkingService,
        vector_repo: VectorRepository,
    ) -> None:
        self._settings = settings
        self._chunking = chunking_service
        self._vector_repo = vector_repo
        self._upload_dir = Path(settings.UPLOAD_DIR)
        self._upload_dir.mkdir(parents=True, exist_ok=True)

    async def process_upload(
        self,
        user_id: str,
        files: list[UploadFile],
        chunking_strategy: str = "recursive",
    ) -> dict:
        """
        Save, extract text, chunk, and embed uploaded files.

        Returns ``{ success: bool, filesProcessed: int, message: str }``.
        """
        processed = 0
        total_chunks = 0

        for file in files:
            self._validate_file(file)

        for file in files:
            try:
                text = await self._extract_text(file)
                if not text.strip():
                    logger.warning("File %s produced empty text, skipping", file.filename)
                    continue

                chunks = self._chunking.chunk_text(
                    text,
                    strategy=chunking_strategy,
                    source=file.filename or "upload",
                )

                stored = self._vector_repo.store_documents(user_id, chunks)
                total_chunks += stored
                processed += 1
                logger.info(
                    "Processed %s → %d chunks (strategy=%s)",
                    file.filename, stored, chunking_strategy,
                )
            except FileValidationError:
                raise
            except Exception as exc:
                logger.error("Failed processing %s: %s", file.filename, exc)
                raise RAGPipelineError(
                    f"Failed to process {file.filename}: {exc}"
                ) from exc

        return {
            "success": True,
            "filesProcessed": processed,
            "message": f"Processed {processed} file(s), created {total_chunks} chunks.",
        }

    # ── validation ────────────────────────────────────────────────────────

    def _validate_file(self, file: UploadFile) -> None:
        filename = file.filename or ""
        ext = Path(filename).suffix.lower()
        if ext not in _ALLOWED_EXTENSIONS:
            raise FileValidationError(
                f"Unsupported file type '{ext}'. Allowed: {', '.join(_ALLOWED_EXTENSIONS)}"
            )

    # ── text extraction ───────────────────────────────────────────────────

    async def _extract_text(self, file: UploadFile) -> str:
        filename = file.filename or "unknown"
        ext = Path(filename).suffix.lower()

        if ext == ".txt":
            content = await file.read()
            return content.decode("utf-8", errors="replace")

        if ext == ".pdf":
            return await self._extract_pdf_text(file)

        raise FileValidationError(f"Cannot extract text from {ext}")

    async def _extract_pdf_text(self, file: UploadFile) -> str:
        """Extract text from PDF using pypdf."""
        # Save to a temp file so pypdf can read it
        temp_path = self._upload_dir / f"{uuid.uuid4().hex}_{file.filename}"
        try:
            content = await file.read()
            temp_path.write_bytes(content)

            from pypdf import PdfReader

            reader = PdfReader(str(temp_path))
            pages: list[str] = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)

            return "\n\n".join(pages)
        finally:
            # Clean up temp file
            if temp_path.exists():
                temp_path.unlink()
