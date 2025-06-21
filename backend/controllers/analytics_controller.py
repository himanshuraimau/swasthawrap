from fastapi import HTTPException, status
from typing import Optional, List
from services.analytics_service import AnalyticsService
from models.dashboard import AnalyticsPeriod


class AnalyticsController:
    def __init__(self):
        self.analytics_service = AnalyticsService()

    async def get_health_trends(self, user_id: str, period: str = "month", metrics: Optional[List[str]] = None):
        """Get health trends and analytics data"""
        try:
            # Validate and convert period to enum
            valid_periods = ["week", "month", "quarter", "year"]
            if period not in valid_periods:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
                )

            # Convert string to enum
            period_enum = AnalyticsPeriod(period)
            trends = await self.analytics_service.get_health_trends(user_id, period_enum, metrics)
            return {
                "data": trends,
                "success": True
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get health trends: {str(e)}"
            )

    async def get_medication_adherence(self, user_id: str, period: str = "month"):
        """Get medication adherence statistics"""
        try:
            # Validate and convert period to enum
            valid_periods = ["week", "month", "quarter"]
            if period not in valid_periods:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
                )

            # Convert string to enum
            period_enum = AnalyticsPeriod(period)
            adherence = await self.analytics_service.get_medication_adherence(user_id, period_enum)
            return {
                "data": adherence,
                "success": True
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get medication adherence: {str(e)}"
            )
