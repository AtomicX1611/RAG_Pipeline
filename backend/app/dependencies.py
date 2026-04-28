"""
FastAPI dependency injection — wiring services, repos, and auth.

All services are created once at startup and shared via ``app.state``,
then injected into route handlers through ``Depends()``.
"""

from __future__ import annotations

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings
from .repositories.conversation_repository import ConversationRepository
from .repositories.vector_repository import VectorRepository
from .schemas.auth import UserProfile
from .services.analytics_service import AnalyticsService
from .services.auth_service import AuthService
from .services.chunking_service import ChunkingService
from .services.conversation_service import ConversationService
from .services.rag_service import RAGService
from .services.upload_service import UploadService
from .utils.exceptions import AuthenticationError

_bearer_scheme = HTTPBearer(auto_error=False)


# ── Singleton factories (called once during lifespan startup) ─────────────

def create_services(settings: Settings) -> dict:
    """Instantiate all services and return them as a dict for app.state."""
    vector_repo = VectorRepository(settings)
    conv_repo = ConversationRepository()
    chunking_svc = ChunkingService(settings)
    analytics_svc = AnalyticsService(conv_repo, vector_repo)

    return {
        "auth_service": AuthService(settings),
        "upload_service": UploadService(settings, chunking_svc, vector_repo, analytics_svc),
        "rag_service": RAGService(settings, vector_repo, conv_repo, analytics_svc),
        "conversation_service": ConversationService(conv_repo),
        "analytics_service": analytics_svc,
        "vector_repo": vector_repo,
    }


# ── Request-scoped dependencies ──────────────────────────────────────────

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> UserProfile:
    """Extract and validate the JWT from the Authorization header."""
    if credentials is None:
        raise AuthenticationError("Missing authorization header")

    auth_service: AuthService = request.app.state.auth_service
    return auth_service.get_current_user(credentials.credentials)


def get_auth_service(request: Request) -> AuthService:
    return request.app.state.auth_service


def get_upload_service(request: Request) -> UploadService:
    return request.app.state.upload_service


def get_rag_service(request: Request) -> RAGService:
    return request.app.state.rag_service


def get_conversation_service(request: Request) -> ConversationService:
    return request.app.state.conversation_service


def get_analytics_service(request: Request) -> AnalyticsService:
    return request.app.state.analytics_service


def get_vector_repository(request: Request) -> VectorRepository:
    return request.app.state.vector_repo
