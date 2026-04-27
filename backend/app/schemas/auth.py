"""Pydantic models for authentication endpoints."""

from pydantic import BaseModel, EmailStr, Field


class GoogleSignInRequest(BaseModel):
    """Body of POST /api/auth/google."""
    credential: str = Field(..., description="Google OAuth2 ID token")


class UserProfile(BaseModel):
    """Public user profile returned by the API."""
    id: str
    name: str
    email: str
    avatar: str | None = None


class AuthResponse(BaseModel):
    """Response from POST /api/auth/google."""
    user: UserProfile
    token: str
