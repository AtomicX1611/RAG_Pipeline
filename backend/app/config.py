"""
Centralised application settings loaded from the root .env file.

Uses pydantic-settings so every value is validated at startup.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Root of the project (…/RAG)
_PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application configuration — reads from .env at project root."""

    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── OpenAI ────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str

    # ── Google OAuth2 ─────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = "your_google_client_id_here.apps.googleusercontent.com"

    # ── JWT ────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change_me_to_a_long_random_secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # ── ChromaDB ──────────────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = str(_PROJECT_ROOT / "db" / "chroma_db")

    # ── File uploads ──────────────────────────────────────────────────────
    UPLOAD_DIR: str = str(_PROJECT_ROOT / "uploads")
    MAX_FILE_SIZE_MB: int = 20

    # ── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # ── Misc ──────────────────────────────────────────────────────────────
    DEBUG: bool = False

    # ── Derived helpers (not env vars) ────────────────────────────────────
    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
