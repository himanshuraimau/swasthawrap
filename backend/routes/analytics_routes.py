from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from controllers.analytics_controller import AnalyticsController
from middlewares.auth import get_current_user
from models.user import User

router = APIRouter()
analytics_controller = AnalyticsController()


@router.get("/health-trends")
async def get_health_trends(
    period: str = Query(default="month", regex="^(week|month|quarter|year)$"),
    metrics: Optional[List[str]] = Query(default=None),
    current_user: User = Depends(get_current_user)
):
    """Get health trends and analytics data"""
    return await analytics_controller.get_health_trends(str(current_user.id), period, metrics)


@router.get("/medication-adherence")
async def get_medication_adherence(
    period: str = Query(default="month", regex="^(week|month|quarter)$"),
    current_user: User = Depends(get_current_user)
):
    """Get medication adherence statistics"""
    return await analytics_controller.get_medication_adherence(str(current_user.id), period)
