from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId


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


class ChatMessage(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    type: Literal["user", "ai"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    language: str = "en"
    has_file: bool = False
    confidence: Optional[float] = None
    sources: Optional[List[str]] = None
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatSession(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    title: str
    summary: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    language: str = "en"
    tags: List[str] = []
    bookmark: bool = False
    message_count: int = 0
    duration: Optional[str] = None
    
    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class FileUpload(BaseModel):
    name: str
    size: int
    type: str
    data: str  # base64 encoded


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None
    files: Optional[List[FileUpload]] = None


class ChatResponse(BaseModel):
    content: str
    confidence: float
    sources: List[str]
    suggestions: List[str]
    session_id: str


class ApiResponse(BaseModel):
    data: Optional[dict] = None
    success: bool = True
    message: Optional[str] = None
