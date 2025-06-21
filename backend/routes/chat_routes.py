from fastapi import APIRouter, Depends, UploadFile, File, Form, Query # type: ignore
from typing import Dict, Any

from controllers.chatbot_controller import chatbot_controller
from models.chat import (
    SendMessageRequest, NewSessionRequest, TextToSpeechRequest
)
from middlewares.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message")
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Send message to AI and get response"""
    return await chatbot_controller.send_message(request, current_user)


@router.get("/history")
async def get_chat_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get user's chat history"""
    return await chatbot_controller.get_chat_history(page, limit, current_user)


@router.get("/session/{session_id}")
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get messages from a specific chat session"""
    return await chatbot_controller.get_session_messages(session_id, current_user)


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Delete a chat session"""
    return await chatbot_controller.delete_session(session_id, current_user)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Upload document for chat"""
    return await chatbot_controller.upload_document(file, current_user)


@router.delete("/document/{file_id}")
async def delete_document(
    file_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Delete uploaded document"""
    return await chatbot_controller.delete_document(file_id, current_user)


@router.post("/voice-to-text")
async def voice_to_text(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Convert voice recording to text"""
    return await chatbot_controller.voice_to_text(audio, language, current_user)


@router.post("/text-to-speech")
async def text_to_speech(
    request: TextToSpeechRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Convert text to speech audio"""
    return await chatbot_controller.text_to_speech(request, current_user)


@router.post("/session/new")
async def start_new_session(
    request: NewSessionRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Start a new chat session"""
    return await chatbot_controller.start_new_session(request, current_user)


@router.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    session_id: str = Form(None),
    query: str = Form(None),
    language: str = Form(default="en"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Upload and analyze document with AI"""
    return await chatbot_controller.upload_and_analyze_document(
        file, session_id, query, language, current_user
    )


@router.post("/analyze-health-document")
async def analyze_health_document(
    file: UploadFile = File(...),
    session_id: str = Form(None),
    language: str = Form(default="en"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Upload and analyze health/medical document"""
    return await chatbot_controller.analyze_health_document(
        file, session_id, language, current_user
    )
