from fastapi import HTTPException, status
from typing import Optional, List
from services.dashboard_service import DashboardService
from services.analytics_service import AnalyticsService
from models.dashboard import ActivityType


class DashboardController:
    def __init__(self):
        self.dashboard_service = DashboardService()
        self.analytics_service = AnalyticsService()

    async def get_dashboard_stats(self, user_id: str):
        """Get main dashboard statistics and overview"""
        try:
            stats = await self.dashboard_service.get_dashboard_stats(user_id)
            return {
                "data": stats,
                "success": True
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get dashboard stats: {str(e)}"
            )

    async def get_recent_activity(self, user_id: str, limit: int = 10):
        """Get user's recent activity feed"""
        try:
            activity = await self.dashboard_service.get_recent_activity(user_id, limit)
            return {
                "data": activity,
                "success": True
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get recent activity: {str(e)}"
            )

    async def get_upcoming_reminders(self, user_id: str):
        """Get upcoming reminders and notifications"""
        try:
            reminders = await self.dashboard_service.get_upcoming_reminders(user_id)
            return {
                "data": reminders,
                "success": True
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get upcoming reminders: {str(e)}"
            )

    async def get_health_tips(self, user_id: str, language: str = "en", category: Optional[str] = None):
        """Get personalized health tips"""
        try:
            tips = await self.dashboard_service.get_health_tips(user_id, language, category)
            return {
                "data": tips,
                "success": True
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get health tips: {str(e)}"
            )

    async def mark_reminder_complete(self, user_id: str, reminder_id: str):
        """Mark a reminder as completed"""
        try:
            success = await self.dashboard_service.mark_reminder_completed(user_id, reminder_id)
            if success:
                return {
                    "success": True,
                    "message": "Reminder marked as completed"
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Reminder not found"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to mark reminder as complete: {str(e)}"
            )

    async def log_activity(self, user_id: str, activity_type: ActivityType, content: str, metadata: Optional[dict] = None):
        """Log user activity"""
        try:
            await self.dashboard_service.log_activity(user_id, activity_type, content, metadata)
            return {
                "success": True,
                "message": "Activity logged successfully"
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to log activity: {str(e)}"
            )
