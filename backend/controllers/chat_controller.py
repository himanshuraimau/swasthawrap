from fastapi import HTTPException, status
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import uuid
import logging

from models.chat import ChatMessage, ChatSession, ChatRequest, ChatResponse
from utils.openai_service import OpenAIService
from database import get_database

logger = logging.getLogger(__name__)


class ChatController:
    def __init__(self, openai_service: OpenAIService):
        self.openai_service = openai_service
    
    @property
    def db(self):
        """Get database instance"""
        return get_database()
    
    async def send_message(self, user_id: str, chat_request: ChatRequest) -> Dict:
        """Handle sending a message and getting AI response"""
        try:
            # Get or create session
            session_id = chat_request.session_id
            if not session_id:
                session_id = str(uuid.uuid4())
                await self._create_session(user_id, session_id, chat_request.message, chat_request.language)
            
            # Get conversation history for context
            history = await self._get_session_messages(session_id, limit=10)
            
            # Get AI response
            ai_response = await self.openai_service.get_chat_response(
                message=chat_request.message,
                language=chat_request.language,
                conversation_history=history
            )
            
            # Save user message
            await self._save_message(
                session_id=session_id,
                message_type="user",
                content=chat_request.message,
                language=chat_request.language,
                has_file=bool(chat_request.files)
            )
            
            # Save AI response
            await self._save_message(
                session_id=session_id,
                message_type="ai",
                content=ai_response["content"],
                language=chat_request.language,
                confidence=ai_response["confidence"],
                sources=ai_response["sources"]
            )
            
            # Update session message count
            await self._update_session_message_count(session_id)
            
            return {
                "data": {
                    "content": ai_response["content"],
                    "confidence": ai_response["confidence"],
                    "sources": ai_response["sources"],
                    "suggestions": ai_response["suggestions"],
                    "sessionId": session_id
                },
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in send_message: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing message: {str(e)}"
            )
    
    async def get_chat_history(self, user_id: str, page: int = 1, limit: int = 10) -> Dict:
        """Get paginated chat history for user"""
        try:
            skip = (page - 1) * limit
            
            sessions = await self.db.chat_sessions.find( # type: ignore
                {"user_id": user_id}
            ).sort("date", -1).skip(skip).limit(limit).to_list(length=limit)
            
            total = await self.db.chat_sessions.count_documents({"user_id": user_id})
            
            # Format sessions
            formatted_sessions = []
            for session in sessions:
                formatted_sessions.append({
                    "id": str(session["_id"]),
                    "date": session["date"].strftime("%Y-%m-%d"),
                    "title": session["title"],
                    "summary": session.get("summary", ""),
                    "messages": session.get("message_count", 0),
                    "language": session.get("language", "en"),
                    "tags": session.get("tags", []),
                    "bookmark": session.get("bookmark", False),
                    "duration": session.get("duration", "")
                })
            
            return {
                "data": formatted_sessions,
                "total": total,
                "page": page,
                "limit": limit,
                "hasMore": (skip + limit) < total
            }
            
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving chat history"
            )
    
    async def get_session_messages(self, user_id: str, session_id: str) -> Dict:
        """Get all messages from a specific session"""
        try:
            # Verify session belongs to user
            session = await self.db.chat_sessions.find_one({
                "_id": session_id,
                "user_id": user_id
            })
            
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
            
            messages = await self.db.chat_messages.find(
                {"session_id": session_id}
            ).sort("timestamp", 1).to_list(length=None)
            
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "id": str(msg["_id"]),
                    "type": msg["type"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"].isoformat(),
                    "language": msg.get("language", "en"),
                    "hasFile": msg.get("has_file", False)
                })
            
            return {
                "data": formatted_messages,
                "success": True
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting session messages: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving session messages"
            )
    
    async def delete_session(self, user_id: str, session_id: str) -> Dict:
        """Delete a chat session and all its messages"""
        try:
            # Verify session belongs to user
            session = await self.db.chat_sessions.find_one({
                "_id": session_id,
                "user_id": user_id
            })
            
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
            
            # Delete messages
            await self.db.chat_messages.delete_many({"session_id": session_id})
            
            # Delete session
            await self.db.chat_sessions.delete_one({"_id": session_id})
            
            return {
                "success": True,
                "message": "Session deleted successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting session"
            )
    
    async def bookmark_session(self, user_id: str, session_id: str, bookmark: bool) -> Dict:
        """Toggle bookmark status of a session"""
        try:
            result = await self.db.chat_sessions.update_one(
                {"_id": session_id, "user_id": user_id},
                {"$set": {"bookmark": bookmark}}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
            
            return {
                "success": True,
                "message": f"Session {'bookmarked' if bookmark else 'unbookmarked'} successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error bookmarking session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating bookmark status"
            )
    
    async def search_chat_history(
        self, 
        user_id: str, 
        query: str, 
        language: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Dict:
        """Search through chat history"""
        try:
            # Get user's sessions
            session_filter: Dict = {"user_id": user_id}
            if language:
                session_filter["language"] = language
            if date_from or date_to:
                date_filter: Dict = {}
                if date_from:
                    date_filter["$gte"] = datetime.fromisoformat(date_from)
                if date_to:
                    date_filter["$lte"] = datetime.fromisoformat(date_to)
                session_filter["date"] = date_filter
            
            sessions = await self.db.chat_sessions.find(session_filter).to_list(length=None)
            session_ids = [str(session["_id"]) for session in sessions]
            
            # Search in messages
            search_filter: Dict = {
                "session_id": {"$in": session_ids},
                "content": {"$regex": query, "$options": "i"}
            }
            
            messages = await self.db.chat_messages.find(search_filter).sort("timestamp", -1).to_list(length=50)
            
            results = []
            for msg in messages:
                results.append({
                    "sessionId": msg["session_id"],
                    "messageId": str(msg["_id"]),
                    "content": msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"],
                    "timestamp": msg["timestamp"].isoformat(),
                    "relevance": 1.0  # Simple relevance score
                })
            
            return {
                "data": results,
                "total": len(results)
            }
            
        except Exception as e:
            logger.error(f"Error searching chat history: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error searching chat history"
            )
    
    async def _create_session(self, user_id: str, session_id: str, first_message: str, language: str):
        """Create a new chat session"""
        title = first_message[:50] + "..." if len(first_message) > 50 else first_message
        
        session = {
            "_id": session_id,
            "user_id": user_id,
            "title": title,
            "date": datetime.utcnow(),
            "language": language,
            "tags": [],
            "bookmark": False,
            "message_count": 0
        }
        
        await self.db.chat_sessions.insert_one(session)
    
    async def _save_message(
        self, 
        session_id: str, 
        message_type: str, 
        content: str, 
        language: str,
        has_file: bool = False,
        confidence: Optional[float] = None,
        sources: Optional[List[str]] = None
    ):
        """Save a message to database"""
        message = {
            "session_id": session_id,
            "type": message_type,
            "content": content,
            "timestamp": datetime.utcnow(),
            "language": language,
            "has_file": has_file
        }
        
        if confidence is not None:
            message["confidence"] = confidence
        if sources:
            message["sources"] = sources
        
        await self.db.chat_messages.insert_one(message)
    
    async def _get_session_messages(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get recent messages from a session for context"""
        messages = await self.db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).limit(limit).to_list(length=limit)
        
        # Reverse to get chronological order
        messages.reverse()
        
        return [
            {
                "type": msg["type"],
                "content": msg["content"]
            }
            for msg in messages
        ]
    
    async def _update_session_message_count(self, session_id: str):
        """Update message count for a session"""
        count = await self.db.chat_messages.count_documents({"session_id": session_id})
        await self.db.chat_sessions.update_one(
            {"_id": session_id},
            {"$set": {"message_count": count}}
        )
