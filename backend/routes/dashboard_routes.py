from fastapi import APIRouter, Depends, Query
from typing import Optional
from controllers.dashboard_controller import DashboardController
from middlewares.auth import get_current_user
from models.user import User

router = APIRouter()
dashboard_controller = DashboardController()


@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get main dashboard statistics and overview"""
    return await dashboard_controller.get_dashboard_stats(str(current_user.id))


@router.get("/activity")
async def get_recent_activity(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get user's recent activity feed"""
    return await dashboard_controller.get_recent_activity(str(current_user.id), limit)


@router.get("/reminders")
async def get_upcoming_reminders(current_user: User = Depends(get_current_user)):
    """Get upcoming reminders and notifications"""
    return await dashboard_controller.get_upcoming_reminders(str(current_user.id))


@router.get("/health-tips")
async def get_health_tips(
    language: str = Query(default="en", regex="^(en|hi|ta)$"),
    category: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user)
):
    """Get personalized health tips"""
    return await dashboard_controller.get_health_tips(str(current_user.id), language, category)


@router.put("/reminders/{reminder_id}/complete")
async def mark_reminder_complete(
    reminder_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a reminder as completed"""
    return await dashboard_controller.mark_reminder_complete(str(current_user.id), reminder_id)
