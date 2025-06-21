from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, date
from bson import ObjectId
from enum import Enum


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema


# Dashboard Models
class DashboardStats(BaseModel):
    totalReports: int = 0
    chatSessions: int = 0
    healthGoalsAchieved: int = 0
    medicationsTracked: int = 0
    healthScore: int = 0
    streak: int = 0
    upcomingAppointments: int = 0
    medicationsDue: int = 0


class ActivityType(str, Enum):
    CHAT = "chat"
    UPLOAD = "upload"
    MEDICATION = "medication"
    GOAL = "goal"
    APPOINTMENT = "appointment"
    METRIC = "metric"
    CONDITION = "condition"


class ActivityItem(BaseModel):
    type: ActivityType
    content: str
    time: str  # relative time string like "2 hours ago"
    icon: str
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ReminderType(str, Enum):
    APPOINTMENT = "appointment"
    MEDICATION = "medication"
    CHECKUP = "checkup"
    GOAL = "goal"


class Reminder(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    type: ReminderType
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    urgent: bool = False
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ReminderResponse(BaseModel):
    type: str
    title: str
    time: str  # formatted time string
    urgent: bool
    timestamp: str  # ISO date string


class HealthTipCategory(str, Enum):
    NUTRITION = "nutrition"
    EXERCISE = "exercise"
    MEDICATION = "medication"
    LIFESTYLE = "lifestyle"
    MENTAL_HEALTH = "mental_health"
    PREVENTION = "prevention"


class HealthTip(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    en: str  # English content
    hi: str  # Hindi content
    ta: str  # Tamil content
    category: HealthTipCategory
    priority: int = 1  # 1-5, higher is more important
    conditions: List[str] = Field(default_factory=list)  # applicable medical conditions
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class HealthTipResponse(BaseModel):
    id: str
    en: str
    hi: str
    ta: str
    category: str
    priority: int


# Analytics Models
class TrendDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class HealthScoreAnalytics(BaseModel):
    current: float
    trend: TrendDirection
    change: float  # percentage change


class MetricDataPoint(BaseModel):
    date: str  # YYYY-MM-DD format
    value: float


class MetricAnalytics(BaseModel):
    type: str
    data: List[MetricDataPoint]
    trend: TrendDirection
    average: float


class HealthTrendsResponse(BaseModel):
    healthScore: HealthScoreAnalytics
    metrics: List[MetricAnalytics]


class MedicationAdherence(BaseModel):
    name: str
    adherence: float  # percentage
    missed: int
    taken: int


class AdherenceStreaks(BaseModel):
    current: int
    longest: int


class MedicationAdherenceResponse(BaseModel):
    overallAdherence: float  # percentage
    medications: List[MedicationAdherence]
    streaks: AdherenceStreaks


# Activity Log Model (for tracking user activities)
class ActivityLog(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    activity_type: ActivityType
    activity_content: str
    activity_data: Dict[str, Any] = Field(default_factory=dict)  # Additional metadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Medication Intake Log (for adherence tracking)
class MedicationIntake(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    medication_name: str
    scheduled_time: datetime
    taken_time: Optional[datetime] = None
    taken: bool = False
    missed: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Query Parameters
class AnalyticsPeriod(str, Enum):
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class Language(str, Enum):
    EN = "en"
    HI = "hi"
    TA = "ta"
