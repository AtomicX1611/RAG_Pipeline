"""
Authentication service — Google OAuth2 token verification & JWT management.

Supports a development bypass: when the configured GOOGLE_CLIENT_ID still
contains the placeholder value, *any* credential string is accepted and a
dev user is returned.  This lets the frontend work end-to-end before a real
Google Cloud project is set up.
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from ..config import Settings
from ..schemas.auth import AuthResponse, UserProfile
from ..utils.exceptions import AuthenticationError
from ..utils.logging_config import get_logger

logger = get_logger(__name__)

_PLACEHOLDER_CLIENT_ID = "your_google_client_id_here.apps.googleusercontent.com"


class AuthService:
    """Handles Google token verification and JWT issuance."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._dev_mode = settings.GOOGLE_CLIENT_ID == _PLACEHOLDER_CLIENT_ID
        if self._dev_mode:
            logger.warning(
                "Google Client ID is placeholder — running in DEV AUTH MODE. "
                "Any credential will be accepted."
            )

    # ── public API ────────────────────────────────────────────────────────

    async def google_sign_in(self, credential: str) -> AuthResponse:
        """Verify a Google ID token and return a JWT + user profile."""
        if self._dev_mode:
            user_info = self._dev_user_from_credential(credential)
        else:
            user_info = await self._verify_google_token(credential)

        token = self._create_jwt(user_info)
        user = UserProfile(**user_info)
        logger.info("User signed in: %s (%s)", user.email, user.id)
        return AuthResponse(user=user, token=token)

    def get_current_user(self, token: str) -> UserProfile:
        """Decode a JWT and return the embedded user profile."""
        payload = self._decode_jwt(token)
        return UserProfile(
            id=payload["sub"],
            name=payload.get("name", ""),
            email=payload.get("email", ""),
            avatar=payload.get("picture"),
        )

    # ── Google token verification ─────────────────────────────────────────

    async def _verify_google_token(self, credential: str) -> dict:
        """Verify token. If it's an ID token, uses id_token.verify_oauth2_token. If it's an access token from React, fetches userinfo directly."""
        try:
            import requests

            # If the credential looks like a large JWT, try to parse it as an ID token.
            if credential.count('.') >= 1 and len(credential) > 500 and not credential.startswith("ya29."):
                from google.oauth2 import id_token as google_id_token
                from google.auth.transport import requests as google_requests

                id_info = google_id_token.verify_oauth2_token(
                    credential,
                    google_requests.Request(),
                    self._settings.GOOGLE_CLIENT_ID,
                )
                return {
                    "id": id_info["sub"],
                    "name": id_info.get("name", ""),
                    "email": id_info.get("email", ""),
                    "avatar": id_info.get("picture"),
                }
            else:
                # It's likely an Access Token from useGoogleLogin (which is an opaque string like 'ya29.a0...')
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {credential}"},
                    timeout=10
                )
                resp.raise_for_status()
                user_data = resp.json()

                return {
                    "id": user_data["sub"],
                    "name": user_data.get("name", ""),
                    "email": user_data.get("email", ""),
                    "avatar": user_data.get("picture"),
                }
        except Exception as exc:
            logger.error("Google token verification failed: %s", exc)
            raise AuthenticationError("Invalid Google credential") from exc

    # ── JWT helpers ───────────────────────────────────────────────────────

    def _create_jwt(self, user_info: dict) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_info["id"],
            "name": user_info.get("name", ""),
            "email": user_info.get("email", ""),
            "picture": user_info.get("avatar"),
            "iat": now,
            "exp": now + timedelta(hours=self._settings.JWT_EXPIRATION_HOURS),
        }
        return jwt.encode(
            payload,
            self._settings.JWT_SECRET_KEY,
            algorithm=self._settings.JWT_ALGORITHM,
        )

    def _decode_jwt(self, token: str) -> dict:
        try:
            return jwt.decode(
                token,
                self._settings.JWT_SECRET_KEY,
                algorithms=[self._settings.JWT_ALGORITHM],
            )
        except JWTError as exc:
            raise AuthenticationError("Invalid or expired token") from exc

    # ── dev helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _dev_user_from_credential(credential: str) -> dict:
        """Generate a deterministic dev user from any credential string."""
        uid = hashlib.sha256(credential.encode()).hexdigest()[:16]
        return {
            "id": f"dev_{uid}",
            "name": "Dev User",
            "email": f"dev_{uid[:6]}@localhost",
            "avatar": None,
        }
