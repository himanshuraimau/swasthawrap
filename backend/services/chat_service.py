from motor.motor_asyncio import AsyncIOMotorDatabase # type: ignore
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId # type: ignore
import logging

from database import get_database
from models.chat import (
    ChatMessage, ChatSession, ChatDocument,
    MessageTypeEnum, LanguageEnum
)
from services.document_service import document_service
from services.openai_service import openai_service

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.db: AsyncIOMotorDatabase = None
    
    async def get_db(self):
        if self.db is None:
            self.db = await get_database()
        return self.db
    
    async def create_session(self, user_id: str, language: str = "en") -> str:
        """Create a new chat session"""
        try:
            db = await self.get_db()
            
            session_data = {
                "user_id": user_id,
                "title": f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                "language": language,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "message_count": 0,
                "is_active": True
            }
            
            result = await db.chat_sessions.insert_one(session_data)
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise
    
    async def get_session(self, session_id: str, user_id: str) -> Optional[ChatSession]:
        """Get a chat session by ID"""
        try:
            db = await self.get_db()
            
            session_data = await db.chat_sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id,
                "is_active": True
            })
            
            if session_data:
                # Convert ObjectId to string
                session_data["_id"] = str(session_data["_id"])
                return ChatSession(**session_data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting session: {e}")
            return None
    
    async def add_message(
        self,
        session_id: str,
        user_id: str,
        content: str,
        message_type: MessageTypeEnum,
        language: str = "en",
        confidence: Optional[float] = None,
        file_id: Optional[str] = None
    ) -> str:
        """Add a message to a chat session"""
        try:
            db = await self.get_db()
            
            message_data = {
                "session_id": session_id,
                "user_id": user_id,
                "type": message_type.value,
                "content": content,
                "language": language,
                "timestamp": datetime.utcnow(),
                "confidence": confidence,
                "has_file": file_id is not None,
                "file_id": file_id
            }
            
            # Insert message
            result = await db.chat_messages.insert_one(message_data)
            
            # Update session message count and timestamp
            await db.chat_sessions.update_one(
                {"_id": ObjectId(session_id)},
                {
                    "$inc": {"message_count": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error adding message: {e}")
            raise
    
    async def get_session_messages(
        self,
        session_id: str,
        user_id: str,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get messages for a session"""
        try:
            db = await self.get_db()
            
            cursor = db.chat_messages.find({
                "session_id": session_id,
                "user_id": user_id
            }).sort("timestamp", 1).limit(limit)
            
            messages = []
            async for message_data in cursor:
                # Convert ObjectId to string
                message_data["_id"] = str(message_data["_id"])
                messages.append(ChatMessage(**message_data))
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting session messages: {e}")
            return []
    
    async def get_user_sessions(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Get user's chat sessions with pagination"""
        try:
            db = await self.get_db()
            
            skip = (page - 1) * limit
            
            # Get total count
            total = await db.chat_sessions.count_documents({
                "user_id": user_id,
                "is_active": True
            })
            
            # Get sessions
            cursor = db.chat_sessions.find({
                "user_id": user_id,
                "is_active": True
            }).sort("updated_at", -1).skip(skip).limit(limit)
            
            sessions = []
            async for session_data in cursor:
                # Convert ObjectId to string
                session_data["_id"] = str(session_data["_id"])
                sessions.append(ChatSession(**session_data))
            
            return {
                "sessions": sessions,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return {"sessions": [], "total": 0, "page": 1, "limit": limit, "total_pages": 0}
    
    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete a chat session (soft delete)"""
        try:
            db = await self.get_db()
            
            result = await db.chat_sessions.update_one(
                {
                    "_id": ObjectId(session_id),
                    "user_id": user_id
                },
                {"$set": {"is_active": False}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            return False
    
    async def save_document(
        self,
        user_id: str,
        file_name: str,
        file_size: int,
        file_type: str,
        file_url: str,
        session_id: Optional[str] = None
    ) -> str:
        """Save uploaded document metadata"""
        try:
            db = await self.get_db()
            
            document_data = {
                "user_id": user_id,
                "session_id": session_id,
                "file_name": file_name,
                "file_size": file_size,
                "file_type": file_type,
                "file_url": file_url,
                "uploaded_at": datetime.utcnow()
            }
            
            result = await db.chat_documents.insert_one(document_data)
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error saving document: {e}")
            raise
    
    async def get_document(self, file_id: str, user_id: str) -> Optional[ChatDocument]:
        """Get document by ID"""
        try:
            db = await self.get_db()
            
            document_data = await db.chat_documents.find_one({
                "_id": ObjectId(file_id),
                "user_id": user_id
            })
            
            if document_data:
                # Convert ObjectId to string
                document_data["_id"] = str(document_data["_id"])
                return ChatDocument(**document_data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            return None
    
    async def delete_document(self, file_id: str, user_id: str) -> bool:
        """Delete a document"""
        try:
            db = await self.get_db()
            
            result = await db.chat_documents.delete_one({
                "_id": ObjectId(file_id),
                "user_id": user_id
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    async def update_session_title(self, session_id: str, user_id: str, title: str) -> bool:
        """Update session title based on conversation content"""
        try:
            db = await self.get_db()
            
            result = await db.chat_sessions.update_one(
                {
                    "_id": ObjectId(session_id),
                    "user_id": user_id
                },
                {"$set": {"title": title}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating session title: {e}")
            return False
    
    async def process_document_message(
        self,
        session_id: str,
        user_id: str,
        file_path: str,
        user_query: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Process a document and create AI response"""
        try:
            # Extract text from document
            logger.info(f"Processing document: {file_path}")
            doc_result = await document_service.process_document_for_chat(file_path)
            
            if not doc_result["success"]:
                return {
                    "success": False,
                    "error": doc_result.get("error", "Failed to process document")
                }
            
            # Add user message about document upload
            file_name = file_path.split('/')[-1]
            user_content = f"I've uploaded a document: {file_name}"
            if user_query:
                user_content += f". {user_query}"
            
            user_message_id = await self.add_message(
                session_id=session_id,
                user_id=user_id,
                content=user_content,
                message_type=MessageTypeEnum.USER,
                language=language
            )
            
            # Process document with OpenAI
            if len(doc_result["chunks"]) == 1:
                # Single chunk - process directly
                ai_result = await openai_service.analyze_document(
                    document_text=doc_result["text"],
                    query=user_query,
                    language=language
                )
            else:
                # Multiple chunks - process in chunks
                ai_result = await openai_service.process_document_chunks(
                    chunks=doc_result["chunks"],
                    query=user_query,
                    language=language
                )
            
            # Add AI response message
            ai_message_id = await self.add_message(
                session_id=session_id,
                user_id=user_id,
                content=ai_result.get("content", "I've analyzed your document."),
                message_type=MessageTypeEnum.AI,
                language=language,
                confidence=ai_result.get("confidence", 0.8)
            )
            
            # Update session title if it's generic
            if user_query:
                await self.update_session_title(session_id, user_id, f"Document Analysis: {user_query[:50]}...")
            else:
                await self.update_session_title(session_id, user_id, f"Document: {file_name}")
            
            return {
                "success": True,
                "ai_message_id": ai_message_id,
                "user_message_id": user_message_id,
                "content": ai_result.get("content", ""),
                "confidence": ai_result.get("confidence", 0.8),
                "document_info": {
                    "word_count": doc_result.get("word_count", 0),
                    "chunks_processed": doc_result.get("chunk_count", 1),
                    "file_type": doc_result.get("file_type", "unknown")
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing document message: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_health_document_analysis(
        self,
        session_id: str,
        user_id: str,
        file_path: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get health-specific analysis of medical documents"""
        try:
            # Extract text from document
            doc_result = await document_service.process_document_for_chat(file_path)
            
            if not doc_result["success"]:
                return {
                    "success": False,
                    "error": doc_result.get("error", "Failed to process document")
                }
            
            # Get health insights
            if len(doc_result["text"]) > 8000:  # Large document
                # Use chunked processing for large documents
                health_result = await openai_service.process_document_chunks(
                    chunks=doc_result["chunks"],
                    query="Provide health insights and key medical information from this document",
                    language=language
                )
            else:
                # Process directly for smaller documents
                health_result = await openai_service.get_health_document_insights(
                    document_text=doc_result["text"],
                    language=language
                )
            
            # Save analysis as a message
            file_name = file_path.split('/')[-1]
            ai_message_id = await self.add_message(
                session_id=session_id,
                user_id=user_id,
                content=health_result.get("content", "Analysis completed."),
                message_type=MessageTypeEnum.AI,
                language=language,
                confidence=health_result.get("confidence", 0.8)
            )
            
            return {
                "success": True,
                "message_id": ai_message_id,
                "analysis": health_result.get("content", ""),
                "confidence": health_result.get("confidence", 0.8),
                "document_info": doc_result
            }
            
        except Exception as e:
            logger.error(f"Error in health document analysis: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Global instance
chat_service = ChatService()
