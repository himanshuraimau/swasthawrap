from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
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


# Medical Conditions Models
class ConditionStatus(str, Enum):
    MANAGED = "managed"
    CONTROLLED = "controlled"
    ACTIVE = "active"
    RESOLVED = "resolved"


class ConditionSeverity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class MedicalConditionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    diagnosed_date: date
    status: ConditionStatus
    severity: ConditionSeverity
    medications: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    diagnosed_by: Optional[str] = None
    icd_code: Optional[str] = None


class MedicalConditionUpdate(BaseModel):
    status: Optional[ConditionStatus] = None
    severity: Optional[ConditionSeverity] = None
    medications: Optional[List[str]] = None
    notes: Optional[str] = None


class MedicalCondition(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    name: str
    icd_code: Optional[str] = None
    diagnosed_date: date
    status: ConditionStatus
    severity: ConditionSeverity
    notes: Optional[str] = None
    diagnosed_by: Optional[str] = None
    medications: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }


class MedicalConditionResponse(BaseModel):
    id: str
    name: str
    diagnosed: str  # ISO date string
    status: str
    severity: str
    medications: List[str]
    lastUpdate: str  # ISO date string
    notes: Optional[str] = None


# Health Metrics Models
class MetricType(str, Enum):
    BLOOD_PRESSURE = "blood_pressure"
    BLOOD_GLUCOSE = "blood_glucose"
    WEIGHT = "weight"
    HEIGHT = "height"
    BMI = "bmi"
    HEART_RATE = "heart_rate"
    TEMPERATURE = "temperature"
    OXYGEN_SATURATION = "oxygen_saturation"
    HBA1C = "hba1c"
    CHOLESTEROL = "cholesterol"


class MetricStatus(str, Enum):
    NORMAL = "normal"
    ELEVATED = "elevated"
    LOW = "low"
    HIGH = "high"
    FAIR = "fair"
    STABLE = "stable"


class HealthMetricCreate(BaseModel):
    metric_type: MetricType
    value: str
    unit: str
    measured_at: date
    systolic: Optional[int] = None  # For blood pressure
    diastolic: Optional[int] = None  # For blood pressure
    notes: Optional[str] = None
    device_used: Optional[str] = None
    location: Optional[str] = None


class HealthMetric(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    metric_type: MetricType
    value: str
    unit: str
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    status: Optional[MetricStatus] = None
    notes: Optional[str] = None
    measured_at: datetime
    device_used: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if v else None
        }


class HealthMetricResponse(BaseModel):
    date: str  # ISO date string
    type: str
    value: str
    unit: str
    status: Optional[str] = None
    notes: Optional[str] = None


# Health Goals Models
class GoalCategory(str, Enum):
    WEIGHT = "weight"
    FITNESS = "fitness"
    NUTRITION = "nutrition"
    MEDICATION = "medication"
    LIFESTYLE = "lifestyle"
    MEDICAL = "medical"


class GoalPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class HealthGoalCreate(BaseModel):
    goal_title: str = Field(..., min_length=1, max_length=255)
    target_value: str
    unit: str
    deadline: Optional[date] = None
    category: Optional[GoalCategory] = None
    priority: GoalPriority = GoalPriority.MEDIUM
    notes: Optional[str] = None


class HealthGoalProgressUpdate(BaseModel):
    current_value: str


class HealthGoal(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    goal_title: str
    target_value: str
    current_value: str = "0"
    unit: str
    progress_percentage: float = 0.0
    deadline: Optional[date] = None
    category: Optional[GoalCategory] = None
    priority: GoalPriority = GoalPriority.MEDIUM
    status: GoalStatus = GoalStatus.ACTIVE
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }


class HealthGoalResponse(BaseModel):
    id: str
    goal: str
    target: str
    current: str
    unit: str
    progress: float  # 0-100
    deadline: Optional[str] = None  # ISO date string
    category: Optional[str] = None


# Medical Documents Models
class DocumentCategory(str, Enum):
    LABORATORY = "laboratory"
    RADIOLOGY = "radiology"
    PRESCRIPTION = "prescription"
    DISCHARGE_SUMMARY = "discharge_summary"
    INSURANCE = "insurance"
    VACCINATION = "vaccination"
    OTHER = "other"


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    REVIEWED = "reviewed"
    ARCHIVED = "archived"


class MedicalDocumentUpload(BaseModel):
    category: DocumentCategory
    tags: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    document_date: Optional[date] = None


class MedicalDocument(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    document_name: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: str
    mime_type: str
    category: DocumentCategory
    document_date: Optional[date] = None
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    status: DocumentStatus = DocumentStatus.UPLOADED
    is_sensitive: bool = False
    encryption_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }


class MedicalDocumentResponse(BaseModel):
    id: str
    name: str
    type: str
    date: Optional[str] = None  # ISO date string
    size: str
    category: str
    tags: List[str]
    status: str
    url: str  # download URL
