from pydantic import BaseModel, Field, EmailStr, validator
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


class LanguageEnum(str, Enum):
    EN = "en"
    HI = "hi"
    TA = "ta"


class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str


class UserRegistration(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    language: LanguageEnum = LanguageEnum.EN
    interests: List[str] = Field(default_factory=list)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: EmailStr
    password_hash: str
    language: LanguageEnum = LanguageEnum.EN
    interests: List[str] = Field(default_factory=list)
    health_score: int = 0
    streak: int = 0
    upcoming_appointments: int = 0
    medications_due: int = 0
    avatar: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None
    email_verified: bool = False
    is_active: bool = True
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


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    language: str
    interests: List[str]
    health_score: int
    streak: int
    upcoming_appointments: int
    medications_due: int
    avatar: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None


class UserResponseWithToken(UserResponse):
    token: str


class PasswordReset(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserSession(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    session_token: str
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    last_active: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    is_current: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class TokenData(BaseModel):
    user_id: str
    email: str
    exp: datetime
