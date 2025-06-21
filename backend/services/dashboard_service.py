from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from bson import ObjectId
import logging
from collections import defaultdict

from models.dashboard import (
    DashboardStats, ActivityItem, ActivityType, ReminderResponse, 
    HealthTipResponse, HealthTrendsResponse, MedicationAdherenceResponse,
    AnalyticsPeriod, Language, TrendDirection, HealthScoreAnalytics,
    MetricAnalytics, MetricDataPoint, MedicationAdherence, AdherenceStreaks,
    ActivityLog, Reminder, HealthTip, MedicationIntake
)
from database import get_database

logger = logging.getLogger(__name__)


class DashboardService:
    
    async def _get_collections(self):
        """Get database collections."""
        db = get_database()
        return {
            'users': db.users,
            'medical_conditions': db.medical_conditions,
            'health_metrics': db.health_metrics,
            'health_goals': db.health_goals,
            'medical_documents': db.medical_documents,
            'chat_sessions': db.chat_sessions,
            'activity_logs': db.activity_logs,
            'reminders': db.reminders,
            'health_tips': db.health_tips,
            'medication_intakes': db.medication_intakes,
            'chat_messages': db.chat_messages,
            'appointments': db.appointments,
            'medications': db.medications
        }

    async def get_dashboard_stats(self, user_id: str) -> DashboardStats:
        """Get dashboard statistics for a user."""
        try:
            collections = await self._get_collections()
            
            # Count total reports (medical documents)
            total_reports = await collections['medical_documents'].count_documents({"user_id": user_id})
            
            # Count chat sessions
            chat_sessions = await collections['chat_sessions'].count_documents({"user_id": user_id})
            
            # Count achieved health goals
            health_goals_achieved = await collections['health_goals'].count_documents({
                "user_id": user_id,
                "status": "completed"
            })
            
            # Count tracked medications
            medications_tracked = await collections['medications'].count_documents({
                "user_id": user_id,
                "is_active": True
            }) if 'medications' in collections else 0
            
            # Get user's health score and streak
            user = await collections['users'].find_one({"_id": ObjectId(user_id)})
            health_score = user.get("health_score", 0) if user else 0
            streak = user.get("streak", 0) if user else 0
            
            # Count upcoming appointments (next 7 days)
            next_week = datetime.utcnow() + timedelta(days=7)
            upcoming_appointments = await collections['appointments'].count_documents({
                "user_id": user_id,
                "appointment_date": {"$gte": datetime.utcnow(), "$lte": next_week}
            }) if 'appointments' in collections else 0
            
            # Count medications due today
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            medications_due = await collections['medication_intakes'].count_documents({
                "user_id": user_id,
                "scheduled_time": {"$gte": today_start, "$lt": today_end},
                "taken": False
            })
            
            return DashboardStats(
                totalReports=total_reports,
                chatSessions=chat_sessions,
                healthGoalsAchieved=health_goals_achieved,
                medicationsTracked=medications_tracked,
                healthScore=health_score,
                streak=streak,
                upcomingAppointments=upcoming_appointments,
                medicationsDue=medications_due
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")
            return DashboardStats()

    async def get_recent_activity(self, user_id: str, limit: int = 10) -> List[ActivityItem]:
        """Get recent activity for a user."""
        try:
            activities = []
            collections = await self._get_collections()
            
            # Get activity logs
            cursor = collections['activity_logs'].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
            activity_logs = await cursor.to_list(length=limit)
            
            for log in activity_logs:
                relative_time = self._get_relative_time(log["timestamp"])
                icon = self._get_activity_icon(log["activity_type"])
                
                activities.append(ActivityItem(
                    type=ActivityType(log["activity_type"]),
                    content=log["activity_content"],
                    time=relative_time,
                    icon=icon,
                    timestamp=log["timestamp"]
                ))
            
            # If no activity logs, generate from other collections
            if not activities:
                activities = await self._generate_activity_from_data(user_id, limit, collections)
            
            return activities[:limit]
            
        except Exception as e:
            logger.error(f"Error getting recent activity: {e}")
            return []

    async def _generate_activity_from_data(self, user_id: str, limit: int, collections: Dict) -> List[ActivityItem]:
        """Generate activity items from existing data when no activity logs exist."""
        activities = []
        
        try:
            # Recent health metrics
            cursor = collections['health_metrics'].find({"user_id": user_id}).sort("created_at", -1).limit(3)
            metrics = await cursor.to_list(length=3)
            for metric in metrics:
                activities.append(ActivityItem(
                    type=ActivityType.METRIC,
                    content=f"Recorded {metric['metric_type'].replace('_', ' ').title()}: {metric['value']} {metric['unit']}",
                    time=self._get_relative_time(metric["created_at"]),
                    icon="📊",
                    timestamp=metric["created_at"]
                ))
            
            # Recent goals
            cursor = collections['health_goals'].find({"user_id": user_id}).sort("created_at", -1).limit(2)
            goals = await cursor.to_list(length=2)
            for goal in goals:
                activities.append(ActivityItem(
                    type=ActivityType.GOAL,
                    content=f"Set goal: {goal['goal_title']}",
                    time=self._get_relative_time(goal["created_at"]),
                    icon="🎯",
                    timestamp=goal["created_at"]
                ))
            
            # Recent documents
            cursor = collections['medical_documents'].find({"user_id": user_id}).sort("created_at", -1).limit(2)
            documents = await cursor.to_list(length=2)
            for doc in documents:
                activities.append(ActivityItem(
                    type=ActivityType.UPLOAD,
                    content=f"Uploaded document: {doc['document_name']}",
                    time=self._get_relative_time(doc["created_at"]),
                    icon="📄",
                    timestamp=doc["created_at"]
                ))
            
            # Sort by timestamp
            activities.sort(key=lambda x: x.timestamp, reverse=True)
            
            return activities
            
        except Exception as e:
            logger.error(f"Error generating activity from data: {e}")
            return []

    async def get_upcoming_reminders(self, user_id: str) -> List[ReminderResponse]:
        """Get upcoming reminders for a user."""
        try:
            collections = await self._get_collections()
            
            # Get reminders for next 7 days
            next_week = datetime.utcnow() + timedelta(days=7)
            cursor = collections['reminders'].find({
                "user_id": user_id,
                "scheduled_time": {"$gte": datetime.utcnow(), "$lte": next_week},
                "completed": False
            }).sort("scheduled_time", 1)
            
            reminders = await cursor.to_list(length=20)
            
            response = []
            for reminder in reminders:
                formatted_time = self._format_reminder_time(reminder["scheduled_time"])
                
                response.append(ReminderResponse(
                    type=reminder["type"],
                    title=reminder["title"],
                    time=formatted_time,
                    urgent=reminder.get("urgent", False),
                    timestamp=reminder["scheduled_time"].isoformat()
                ))
            
            # If no reminders in DB, generate some sample ones
            if not response:
                response = await self._generate_sample_reminders(user_id, collections)
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting upcoming reminders: {e}")
            return []

    async def _generate_sample_reminders(self, user_id: str, collections: Dict) -> List[ReminderResponse]:
        """Generate sample reminders based on user data."""
        reminders = []
        
        try:
            # Check for active goals
            goals = await collections['health_goals'].find({"user_id": user_id, "status": "active"}).to_list(length=3)
            for goal in goals:
                if goal.get("deadline"):
                    deadline = goal["deadline"]
                    if isinstance(deadline, str):
                        deadline = datetime.fromisoformat(deadline)
                    elif isinstance(deadline, date):
                        deadline = datetime.combine(deadline, datetime.min.time())
                    
                    if deadline > datetime.utcnow():
                        reminders.append(ReminderResponse(
                            type="goal",
                            title=f"Check progress: {goal['goal_title']}",
                            time=self._format_reminder_time(deadline),
                            urgent=False,
                            timestamp=deadline.isoformat()
                        ))
            
            return reminders
            
        except Exception as e:
            logger.error(f"Error generating sample reminders: {e}")
            return []

    async def get_health_tips(self, user_id: str, language: str = "en", category: Optional[str] = None) -> List[HealthTipResponse]:
        """Get personalized health tips for a user."""
        try:
            collections = await self._get_collections()
            
            # Get user's medical conditions for personalization
            user_conditions = await collections['medical_conditions'].find({"user_id": user_id}).to_list(length=None)
            condition_names = [condition["name"].lower() for condition in user_conditions]
            
            # Build query
            query: Dict[str, Any] = {"is_active": True}
            if category:
                query["category"] = category
            
            # Get tips
            cursor = collections['health_tips'].find(query).sort("priority", -1).limit(10)
            tips = await cursor.to_list(length=10)
            
            # If no tips in DB, create default ones
            if not tips:
                tips = await self._create_default_health_tips(collections)
            
            # Filter tips based on user conditions and convert to response format
            response = []
            for tip in tips:
                # Check if tip is relevant to user's conditions
                tip_conditions = tip.get("conditions", [])
                is_relevant = not tip_conditions or any(cond.lower() in condition_names for cond in tip_conditions)
                
                if is_relevant:
                    response.append(HealthTipResponse(
                        id=str(tip["_id"]),
                        en=tip["en"],
                        hi=tip["hi"],
                        ta=tip["ta"],
                        category=tip["category"],
                        priority=tip["priority"]
                    ))
            
            return response[:5]  # Return top 5 relevant tips
            
        except Exception as e:
            logger.error(f"Error getting health tips: {e}")
            return []

    async def _create_default_health_tips(self, collections: Dict) -> List[Dict]:
        """Create and insert default health tips."""
        default_tips = [
            {
                "en": "Drink at least 8 glasses of water daily to stay hydrated and support overall health.",
                "hi": "स्वस्थ रहने और समग्र स्वास्थ्य का समर्थन करने के लिए दैनिक कम से कम 8 गिलास पानी पिएं।",
                "ta": "நீரேற்றமாக இருக்கவும் ஒட்டுமொத்த ஆரோக்கியத்தை ஆதரிக்கவும் தினமும் குறைந்தது 8 கிளாஸ் தண்ணீர் குடிக்கவும்।",
                "category": "nutrition",
                "priority": 5,
                "conditions": [],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "en": "Take a 30-minute walk daily to improve cardiovascular health and boost mood.",
                "hi": "हृदय स्वास्थ्य में सुधार और मूड बढ़ाने के लिए दैनिक 30 मिनट टहलें।",
                "ta": "இருதய ஆரோக்கியத்தை மேம்படுத்தவும் மனநிலையை அதிகரிக்கவும் தினமும் 30 நிமிட நடைப்பயிற்சி செய்யுங்கள்।",
                "category": "exercise",
                "priority": 4,
                "conditions": [],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "en": "Take medications at the same time each day to maintain consistent levels in your body.",
                "hi": "अपने शरीर में निरंतर स्तर बनाए रखने के लिए हर दिन एक ही समय पर दवाएं लें।",
                "ta": "உங்கள் உடலில் தொடர்ச்சியான அளவை பராமரிக்க ஒவ்வொரு நாளும் ஒரே நேரத்தில் மருந்துகளை எடுத்துக் கொள்ளுங்கள்।",
                "category": "medication",
                "priority": 5,
                "conditions": ["diabetes", "hypertension"],
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        # Insert default tips
        for tip in default_tips:
            await collections['health_tips'].insert_one(tip)
        
        return default_tips

    async def mark_reminder_completed(self, user_id: str, reminder_id: str) -> bool:
        """Mark a reminder as completed."""
        try:
            collections = await self._get_collections()
            
            result = await collections['reminders'].update_one(
                {"_id": ObjectId(reminder_id), "user_id": user_id},
                {"$set": {"completed": True}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error marking reminder as completed: {e}")
            return False

    def _get_relative_time(self, timestamp: datetime) -> str:
        """Get relative time string."""
        now = datetime.utcnow()
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

    def _get_activity_icon(self, activity_type: str) -> str:
        """Get icon for activity type."""
        icons = {
            "chat": "💬",
            "upload": "📄",
            "medication": "💊",
            "goal": "🎯",
            "appointment": "📅",
            "metric": "📊",
            "condition": "🏥"
        }
        return icons.get(activity_type, "📝")

    def _format_reminder_time(self, timestamp: datetime) -> str:
        """Format reminder time."""
        now = datetime.utcnow()
        diff = timestamp - now
        
        if diff.days > 0:
            if diff.days == 1:
                return "Tomorrow"
            else:
                return f"In {diff.days} days"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"In {hours} hour{'s' if hours > 1 else ''}"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"In {minutes} minute{'s' if minutes > 1 else ''}"
        else:
            return "Now"

    # Log activity for tracking
    async def log_activity(self, user_id: str, activity_type: ActivityType, content: str, data: Optional[Dict[str, Any]] = None):
        """Log user activity."""
        try:
            collections = await self._get_collections()
            
            activity_log = ActivityLog(
                user_id=user_id,
                activity_type=activity_type,
                activity_content=content,
                activity_data=data or {}
            )
            
            await collections['activity_logs'].insert_one(activity_log.dict(by_alias=True))
            
        except Exception as e:
            logger.error(f"Error logging activity: {e}")


# Create singleton instance
dashboard_service = DashboardService()
