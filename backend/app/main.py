"""
FastAPI application factory.

Run with:
    cd backend
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .dependencies import create_services
from .middleware.logging_middleware import LoggingMiddleware
from .routers import analytics, auth, chat, conversations, documents, upload, workspaces
from .utils.exceptions import register_exception_handlers
from .utils.logging_config import setup_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    settings = get_settings()
    setup_logging(level=logging.DEBUG if settings.DEBUG else logging.INFO)
    logger.info("Starting NeuralSearch backend …")

    # Instantiate all services and attach to app.state
    services = create_services(settings)
    for name, svc in services.items():
        setattr(app.state, name, svc)
    logger.info("Services initialised: %s", ", ".join(services.keys()))

    yield  # ← app is running

    logger.info("Shutting down NeuralSearch backend …")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="NeuralSearch API",
        description="RAG-powered document intelligence backend",
        version="2.0.0",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Custom middleware ─────────────────────────────────────────────────
    app.add_middleware(LoggingMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(auth.router)
    app.include_router(workspaces.router)
    app.include_router(upload.router)
    app.include_router(chat.router)
    app.include_router(conversations.router)
    app.include_router(documents.router)
    app.include_router(analytics.router)

    # ── Health check ──────────────────────────────────────────────────────
    @app.get("/api/health", tags=["health"])
    async def health():
        return {"status": "ok", "service": "NeuralSearch API", "version": "2.0.0"}

    return app


# Module-level app instance used by uvicorn
app = create_app()
