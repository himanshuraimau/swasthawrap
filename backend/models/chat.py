from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union
from datetime import datetime
from bson import ObjectId # type: ignore
from enum import Enum


class LanguageEnum(str, Enum):
    EN = "en"
    HI = "hi"  
    TA = "ta"


class MessageTypeEnum(str, Enum):
    USER = "user"
    AI = "ai"


class ChatFile(BaseModel):
    name: str
    size: int
    type: str
    data: str  # base64 encoded


class ChatMessage(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    session_id: str
    user_id: str
    type: MessageTypeEnum
    content: str
    language: LanguageEnum
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: Optional[float] = None
    has_file: Optional[bool] = False
    file_id: Optional[str] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatSession(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    language: LanguageEnum
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0
    is_active: bool = True
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatDocument(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    session_id: Optional[str] = None
    file_name: str
    file_size: int
    file_type: str
    file_url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Request/Response Models
class SendMessageRequest(BaseModel):
    message: str
    language: LanguageEnum = LanguageEnum.EN
    session_id: Optional[str] = None
    files: Optional[List[ChatFile]] = None


class SendMessageResponse(BaseModel):
    content: str
    confidence: float
    session_id: str


class ChatHistoryResponse(BaseModel):
    id: str
    date: str
    title: str
    language: str
    message_count: int


class ChatSessionMessagesResponse(BaseModel):
    id: str
    type: str
    content: str
    timestamp: str
    language: str
    has_file: Optional[bool] = False


class VoiceToTextRequest(BaseModel):
    language: LanguageEnum = LanguageEnum.EN


class VoiceToTextResponse(BaseModel):
    text: str
    confidence: float
    language: str


class TextToSpeechRequest(BaseModel):
    text: str
    language: LanguageEnum = LanguageEnum.EN
    voice: Optional[str] = None
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)


class TextToSpeechResponse(BaseModel):
    audio_url: str
    duration: float


class NewSessionRequest(BaseModel):
    language: LanguageEnum = LanguageEnum.EN


class GreetingMessage(BaseModel):
    content: str
    language: str
    message_id: str


class NewSessionResponse(BaseModel):
    session_id: str
    greeting: GreetingMessage


class UploadDocumentResponse(BaseModel):
    file_id: str
    file_name: str
    file_size: int
    file_type: str
    file_url: str
