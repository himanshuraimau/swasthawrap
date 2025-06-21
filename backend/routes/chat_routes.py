from fastapi import APIRouter, Depends, Query, Path
from typing import Optional

from models.chat import ChatRequest, ApiResponse
from controllers.chat_controller import ChatController
from middlewares.auth import get_current_user
from utils.openai_service import OpenAIService
from config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])


def get_chat_controller() -> ChatController:
    """Get chat controller instance with initialized OpenAI service"""
    openai_service = OpenAIService(settings.openai_api_key)
    return ChatController(openai_service)


@router.post("/message", response_model=ApiResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Send a message to AI and get response"""
    result = await chat_controller.send_message(current_user, chat_request)
    return result


@router.get("/history", response_model=ApiResponse)
async def get_chat_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Get paginated chat history"""
    result = await chat_controller.get_chat_history(current_user, page, limit)
    return result


@router.get("/session/{session_id}", response_model=ApiResponse)
async def get_session_messages(
    session_id: str = Path(..., description="Session ID"),
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Get all messages from a specific session"""
    result = await chat_controller.get_session_messages(current_user, session_id)
    return result


@router.delete("/session/{session_id}", response_model=ApiResponse)
async def delete_session(
    session_id: str = Path(..., description="Session ID"),
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Delete a chat session"""
    result = await chat_controller.delete_session(current_user, session_id)
    return result


@router.put("/session/{session_id}/bookmark", response_model=ApiResponse)
async def bookmark_session(
    bookmark_request: dict,
    session_id: str = Path(..., description="Session ID"),
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Toggle bookmark status of a session"""
    bookmark = bookmark_request.get("bookmark", False)
    result = await chat_controller.bookmark_session(current_user, session_id, bookmark)
    return result


@router.get("/search", response_model=ApiResponse)
async def search_chat_history(
    query: str = Query(..., description="Search query"),
    language: Optional[str] = Query(None, description="Language filter"),
    dateFrom: Optional[str] = Query(None, alias="dateFrom", description="Start date (YYYY-MM-DD)"),
    dateTo: Optional[str] = Query(None, alias="dateTo", description="End date (YYYY-MM-DD)"),
    current_user: str = Depends(get_current_user),
    chat_controller: ChatController = Depends(get_chat_controller)
):
    """Search through chat history"""
    result = await chat_controller.search_chat_history(
        current_user, query, language, dateFrom, dateTo
    )
    return result
