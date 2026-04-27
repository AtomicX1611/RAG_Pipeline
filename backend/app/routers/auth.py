"""
Auth router — Google Sign-In and session management.

Endpoints:
  POST /api/auth/google   — exchange Google credential for JWT
  GET  /api/auth/me       — return current user profile from JWT
"""

from fastapi import APIRouter, Depends

from ..dependencies import get_auth_service, get_current_user
from ..schemas.auth import AuthResponse, GoogleSignInRequest, UserProfile
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/google", response_model=AuthResponse)
async def google_sign_in(
    body: GoogleSignInRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate with a Google OAuth2 ID token."""
    return await auth_service.google_sign_in(body.credential)


@router.get("/me", response_model=UserProfile)
async def get_me(
    user: UserProfile = Depends(get_current_user),
):
    """Return the profile of the currently authenticated user."""
    return user
