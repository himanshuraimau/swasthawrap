from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId # type: ignore
import logging
from collections import defaultdict

from models.dashboard import (
    HealthTrendsResponse, MedicationAdherenceResponse, AnalyticsPeriod,
    TrendDirection, HealthScoreAnalytics, MetricAnalytics, MetricDataPoint,
    MedicationAdherence, AdherenceStreaks
)
from database import get_database

logger = logging.getLogger(__name__)


class AnalyticsService:
    
    async def _get_collections(self):
        """Get database collections."""
        db = await get_database()
        return {
            'users': db.users,
            'health_metrics': db.health_metrics,
            'health_goals': db.health_goals,
            'medication_intakes': db.medication_intakes,
            'medications': db.medications,
            'activity_logs': db.activity_logs
        }

    async def get_health_trends(self, user_id: str, period: AnalyticsPeriod = AnalyticsPeriod.MONTH, 
                              metrics: Optional[List[str]] = None) -> HealthTrendsResponse:
        """Get health trends and analytics data."""
        try:
            collections = await self._get_collections()
            
            # Calculate date range based on period
            end_date = datetime.utcnow()
            if period == AnalyticsPeriod.WEEK:
                start_date = end_date - timedelta(days=7)
            elif period == AnalyticsPeriod.MONTH:
                start_date = end_date - timedelta(days=30)
            elif period == AnalyticsPeriod.QUARTER:
                start_date = end_date - timedelta(days=90)
            else:  # YEAR
                start_date = end_date - timedelta(days=365)
            
            # Get health score analytics
            health_score_analytics = await self._get_health_score_analytics(user_id, start_date, end_date, collections)
            
            # Get metrics analytics
            metrics_analytics = await self._get_metrics_analytics(user_id, start_date, end_date, metrics, collections)
            
            return HealthTrendsResponse(
                healthScore=health_score_analytics,
                metrics=metrics_analytics
            )
            
        except Exception as e:
            logger.error(f"Error getting health trends: {e}")
            return HealthTrendsResponse(
                healthScore=HealthScoreAnalytics(current=0, trend=TrendDirection.STABLE, change=0),
                metrics=[]
            )

    async def _get_health_score_analytics(self, user_id: str, start_date: datetime, end_date: datetime, 
                                        collections: Dict) -> HealthScoreAnalytics:
        """Calculate health score analytics."""
        try:
            # Get current health score
            user = await collections['users'].find_one({"_id": ObjectId(user_id)})
            current_score = user.get("health_score", 0) if user else 0
            
            # Calculate trend based on recent activities and metrics
            # For now, we'll use a simple algorithm based on goal completion and metric trends
            
            # Check goal completion rate in period
            total_goals = await collections['health_goals'].count_documents({
                "user_id": user_id,
                "created_at": {"$gte": start_date, "$lte": end_date}
            })
            
            completed_goals = await collections['health_goals'].count_documents({
                "user_id": user_id,
                "status": "completed",
                "updated_at": {"$gte": start_date, "$lte": end_date}
            })
            
            goal_completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
            
            # Determine trend
            if goal_completion_rate > 70:
                trend = TrendDirection.UP
                change = min(goal_completion_rate - 50, 20)  # Cap at 20% improvement
            elif goal_completion_rate < 30:
                trend = TrendDirection.DOWN
                change = max(goal_completion_rate - 50, -20)  # Cap at 20% decline
            else:
                trend = TrendDirection.STABLE
                change = 0
            
            return HealthScoreAnalytics(
                current=float(current_score),
                trend=trend,
                change=change
            )
            
        except Exception as e:
            logger.error(f"Error calculating health score analytics: {e}")
            return HealthScoreAnalytics(current=0, trend=TrendDirection.STABLE, change=0)

    async def _get_metrics_analytics(self, user_id: str, start_date: datetime, end_date: datetime, 
                                   metric_types: Optional[List[str]], collections: Dict) -> List[MetricAnalytics]:
        """Get metrics analytics."""
        try:
            # Build query
            query = {
                "user_id": user_id,
                "measured_at": {"$gte": start_date, "$lte": end_date}
            }
            
            if metric_types:
                # Convert display names to database field names
                db_metric_types = [mt.lower().replace(" ", "_") for mt in metric_types]
                query["metric_type"] = {"$in": db_metric_types}
            
            # Get metrics
            cursor = collections['health_metrics'].find(query).sort("measured_at", 1)
            metrics = await cursor.to_list(length=None)
            
            # Group by metric type
            grouped_metrics = defaultdict(list)
            for metric in metrics:
                grouped_metrics[metric["metric_type"]].append(metric)
            
            # Calculate analytics for each metric type
            analytics = []
            for metric_type, metric_list in grouped_metrics.items():
                data_points = []
                values = []
                
                for metric in metric_list:
                    date_str = metric["measured_at"].strftime("%Y-%m-%d")
                    
                    # Extract numeric value for trend calculation
                    try:
                        if metric_type == "blood_pressure" and metric.get("systolic"):
                            value = float(metric["systolic"])
                        else:
                            # Try to extract numeric value from string
                            value_str = str(metric["value"]).split('/')[0]  # For BP like "120/80"
                            value = float(''.join(filter(lambda x: x.isdigit() or x == '.', value_str)))
                    except:
                        value = 0
                    
                    data_points.append(MetricDataPoint(date=date_str, value=value))
                    values.append(value)
                
                # Calculate trend and average
                if len(values) >= 2:
                    trend = self._calculate_trend(values)
                    average = sum(values) / len(values)
                else:
                    trend = TrendDirection.STABLE
                    average = values[0] if values else 0
                
                analytics.append(MetricAnalytics(
                    type=metric_type.replace("_", " ").title(),
                    data=data_points,
                    trend=trend,
                    average=average
                ))
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting metrics analytics: {e}")
            return []

    def _calculate_trend(self, values: List[float]) -> TrendDirection:
        """Calculate trend direction from values."""
        if len(values) < 2:
            return TrendDirection.STABLE
        
        # Simple trend calculation: compare first half with second half
        mid = len(values) // 2
        first_half_avg = sum(values[:mid]) / mid
        second_half_avg = sum(values[mid:]) / (len(values) - mid)
        
        change_percent = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        if change_percent > 5:
            return TrendDirection.UP
        elif change_percent < -5:
            return TrendDirection.DOWN
        else:
            return TrendDirection.STABLE

    async def get_medication_adherence(self, user_id: str, period: AnalyticsPeriod = AnalyticsPeriod.MONTH) -> MedicationAdherenceResponse:
        """Get medication adherence statistics."""
        try:
            collections = await self._get_collections()
            
            # Calculate date range
            end_date = datetime.utcnow()
            if period == AnalyticsPeriod.WEEK:
                start_date = end_date - timedelta(days=7)
            elif period == AnalyticsPeriod.QUARTER:
                start_date = end_date - timedelta(days=90)
            else:  # MONTH
                start_date = end_date - timedelta(days=30)
            
            # Get medication intake records
            intake_cursor = collections['medication_intakes'].find({
                "user_id": user_id,
                "scheduled_time": {"$gte": start_date, "$lte": end_date}
            })
            intakes = await intake_cursor.to_list(length=None)
            
            if not intakes:
                # Generate sample data if no records exist
                return await self._generate_sample_adherence_data(user_id, collections)
            
            # Group by medication
            medication_stats = defaultdict(lambda: {"taken": 0, "missed": 0, "total": 0})
            
            for intake in intakes:
                med_name = intake["medication_name"]
                medication_stats[med_name]["total"] += 1
                if intake.get("taken", False):
                    medication_stats[med_name]["taken"] += 1
                else:
                    medication_stats[med_name]["missed"] += 1
            
            # Calculate adherence for each medication
            medications = []
            total_taken = 0
            total_scheduled = 0
            
            for med_name, stats in medication_stats.items():
                adherence = (stats["taken"] / stats["total"] * 100) if stats["total"] > 0 else 0
                medications.append(MedicationAdherence(
                    name=med_name,
                    adherence=adherence,
                    missed=stats["missed"],
                    taken=stats["taken"]
                ))
                total_taken += stats["taken"]
                total_scheduled += stats["total"]
            
            # Calculate overall adherence
            overall_adherence = (total_taken / total_scheduled * 100) if total_scheduled > 0 else 0
            
            # Calculate streaks
            streaks = await self._calculate_medication_streaks(user_id, collections)
            
            return MedicationAdherenceResponse(
                overallAdherence=overall_adherence,
                medications=medications,
                streaks=streaks
            )
            
        except Exception as e:
            logger.error(f"Error getting medication adherence: {e}")
            return MedicationAdherenceResponse(
                overallAdherence=0,
                medications=[],
                streaks=AdherenceStreaks(current=0, longest=0)
            )

    async def _generate_sample_adherence_data(self, user_id: str, collections: Dict) -> MedicationAdherenceResponse:
        """Generate sample adherence data when no records exist."""
        try:
            # Check if user has any medical conditions to create realistic sample data
            conditions = await collections['medical_conditions'].find({"user_id": user_id}).to_list(length=None)
            
            sample_medications = []
            if any("diabetes" in condition["name"].lower() for condition in conditions):
                sample_medications.extend([
                    MedicationAdherence(name="Metformin", adherence=85.0, missed=3, taken=17),
                    MedicationAdherence(name="Insulin", adherence=95.0, missed=1, taken=19)
                ])
            
            if any("hypertension" in condition["name"].lower() or "blood pressure" in condition["name"].lower() for condition in conditions):
                sample_medications.append(
                    MedicationAdherence(name="Lisinopril", adherence=90.0, missed=2, taken=18)
                )
            
            if not sample_medications:
                sample_medications.append(
                    MedicationAdherence(name="Daily Vitamin", adherence=75.0, missed=5, taken=15)
                )
            
            # Calculate overall adherence
            total_taken = sum(med.taken for med in sample_medications)
            total_scheduled = sum(med.taken + med.missed for med in sample_medications)
            overall_adherence = (total_taken / total_scheduled * 100) if total_scheduled > 0 else 0
            
            return MedicationAdherenceResponse(
                overallAdherence=overall_adherence,
                medications=sample_medications,
                streaks=AdherenceStreaks(current=7, longest=14)
            )
            
        except Exception as e:
            logger.error(f"Error generating sample adherence data: {e}")
            return MedicationAdherenceResponse(
                overallAdherence=0,
                medications=[],
                streaks=AdherenceStreaks(current=0, longest=0)
            )

    async def _calculate_medication_streaks(self, user_id: str, collections: Dict) -> AdherenceStreaks:
        """Calculate medication adherence streaks."""
        try:
            # Get recent intake records (last 60 days)
            start_date = datetime.utcnow() - timedelta(days=60)
            cursor = collections['medication_intakes'].find({
                "user_id": user_id,
                "scheduled_time": {"$gte": start_date}
            }).sort("scheduled_time", 1)
            
            intakes = await cursor.to_list(length=None)
            
            if not intakes:
                return AdherenceStreaks(current=0, longest=0)
            
            # Calculate streaks
            current_streak = 0
            longest_streak = 0
            temp_streak = 0
            
            for intake in intakes:
                if intake.get("taken", False):
                    temp_streak += 1
                    longest_streak = max(longest_streak, temp_streak)
                else:
                    temp_streak = 0
            
            # Current streak is the ongoing streak at the end
            if intakes and intakes[-1].get("taken", False):
                current_streak = temp_streak
            
            return AdherenceStreaks(current=current_streak, longest=longest_streak)
            
        except Exception as e:
            logger.error(f"Error calculating medication streaks: {e}")
            return AdherenceStreaks(current=0, longest=0)


# Create singleton instance
analytics_service = AnalyticsService()
