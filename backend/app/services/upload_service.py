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
        analytics_service=None,
    ) -> None:
        self._settings = settings
        self._chunking = chunking_service
        self._vector_repo = vector_repo
        self._analytics = analytics_service
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
        processed_filenames = []

        for file in files:
            self._validate_file(file)

        for file in files:
            try:
                await file.seek(0)
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
                if file.filename:
                    processed_filenames.append(file.filename)
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

        # Record analytics event
        if self._analytics and processed > 0:
            self._analytics.record_upload(user_id, chunking_strategy, processed_filenames)

        if processed == 0:
            raise FileValidationError("Could not extract text from any of the uploaded files (they might be image-only).")

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
        """Extract text from PDF using PyMuPDF (fitz), with an OCR fallback to GPT-4o."""
        temp_path = self._upload_dir / f"{uuid.uuid4().hex}_{file.filename}"
        try:
            await file.seek(0)
            content = await file.read()
            logger.info("Read %d bytes from %s", len(content), file.filename)
            temp_path.write_bytes(content)

            import fitz  # PyMuPDF
            import base64
            from langchain_core.messages import HumanMessage
            from langchain_openai import ChatOpenAI

            doc = fitz.open(str(temp_path))
            pages: list[str] = []
            
            vision_llm = None

            for page in doc:
                text = page.get_text()
                
                # If PyMuPDF couldn't extract text (e.g. Scanned PDF/Images), use GPT-4o OCR
                if not text.strip():
                    logger.info("No text layer found on page, falling back to Vision OCR")
                    pix = page.get_pixmap()
                    img_bytes = pix.tobytes("png")
                    b64_image = base64.b64encode(img_bytes).decode("utf-8")
                    
                    if not vision_llm:
                        vision_llm = ChatOpenAI(
                            model="gpt-4o", 
                            openai_api_key=self._settings.OPENAI_API_KEY
                        )

                    msg = HumanMessage(
                        content=[
                            {"type": "text", "text": "Extract all text from this image exactly as written. Do not add any additional conversational text. If there is no text, return an empty string."},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_image}", "detail": "high"}}
                        ]
                    )
                    res = await vision_llm.ainvoke([msg])
                    text = res.content

                if text and text.strip():
                    pages.append(text)
            
            doc.close()

            return "\n\n".join(pages)
        finally:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception as e:
                    logger.warning("Could not delete temp file %s: %s", temp_path, e)
