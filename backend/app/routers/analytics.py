"""
Analytics router — usage metrics for the current user.

Endpoints:
  GET /api/analytics  — return usage stats
"""

from fastapi import APIRouter, Depends

from ..dependencies import get_analytics_service, get_current_user
from ..schemas.auth import UserProfile
from ..schemas.analytics import AnalyticsResponse
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    user: UserProfile = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
):
    """Return usage analytics for the current user."""
    return await analytics_service.get_user_analytics(user.id)
