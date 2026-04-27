"""
Custom exception hierarchy and FastAPI exception handlers.

Register handlers via ``register_exception_handlers(app)`` in main.py.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .logging_config import get_logger

logger = get_logger(__name__)


# ── Base ──────────────────────────────────────────────────────────────────────

class AppError(Exception):
    """Base exception for all application-specific errors."""

    def __init__(self, message: str = "An unexpected error occurred", status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


# ── Concrete exceptions ──────────────────────────────────────────────────────

class AuthenticationError(AppError):
    """Raised when authentication fails (bad token, expired, etc.)."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message=message, status_code=401)


class ForbiddenError(AppError):
    """Raised when the user lacks permission for the requested action."""

    def __init__(self, message: str = "Access denied"):
        super().__init__(message=message, status_code=403)


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, status_code=404)


class FileValidationError(AppError):
    """Raised when an uploaded file fails validation."""

    def __init__(self, message: str = "Invalid file"):
        super().__init__(message=message, status_code=422)


class RAGPipelineError(AppError):
    """Raised when the RAG pipeline encounters an internal error."""

    def __init__(self, message: str = "RAG pipeline error"):
        super().__init__(message=message, status_code=500)


# ── Handler registration ─────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the FastAPI application."""

    @app.exception_handler(AppError)
    async def _app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        logger.warning("AppError [%s]: %s", exc.status_code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )

    @app.exception_handler(Exception)
    async def _unhandled_error_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
