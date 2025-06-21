from fastapi import HTTPException, UploadFile, Depends, Form # type: ignore
from typing import List, Optional, Dict, Any
import base64
import logging

from models.chat import (
    SendMessageRequest, SendMessageResponse,
    ChatHistoryResponse, ChatSessionMessagesResponse,
    VoiceToTextRequest, VoiceToTextResponse,
    TextToSpeechRequest, TextToSpeechResponse,
    NewSessionRequest, NewSessionResponse, GreetingMessage,
    UploadDocumentResponse, MessageTypeEnum
)
from services.openai_service import openai_service
from services.sarvam_service import sarvam_service
from services.chat_service import chat_service
from services.file_service import file_service
from middlewares.auth import get_current_user
from models.user import User

logger = logging.getLogger(__name__)


class ChatbotController:
    def __init__(self):
        pass
    
    async def send_message(
        self,
        request: SendMessageRequest,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Send message to AI and get response"""
        try:
            user_id = str(current_user.id)
            
            # Create session if not provided
            session_id = request.session_id
            if not session_id:
                session_id = await chat_service.create_session(user_id, request.language.value)
            
            # Validate session belongs to user
            session = await chat_service.get_session(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            # Save user message
            await chat_service.add_message(
                session_id=session_id,
                user_id=user_id,
                content=request.message,
                message_type=MessageTypeEnum.USER,
                language=request.language.value
            )
            
            # Process any uploaded files
            file_context = ""
            if request.files:
                for file_data in request.files:
                    # Save file and extract content for context
                    file_id, file_path, file_size = await file_service.save_base64_file(
                        file_data.data,
                        file_data.name,
                        "document"
                    )
                    
                    # Save document metadata
                    await chat_service.save_document(
                        user_id=user_id,
                        file_name=file_data.name,
                        file_size=file_size,
                        file_type=file_data.type,
                        file_url=file_service.get_file_url(file_path),
                        session_id=session_id
                    )
                    
                    # Process document content with AI
                    try:
                        from services.document_service import document_service
                        doc_result = await document_service.process_document_for_chat(file_path)
                        
                        if doc_result["success"]:
                            # Use the document text as additional context
                            if len(doc_result["text"]) > 2000:  # Large document
                                # Create a summary for context
                                summary = document_service.create_document_summary(doc_result["text"], max_length=1000)
                                file_context += f"\n[Document uploaded: {file_data.name}]\nDocument summary: {summary}"
                            else:
                                # Include full content for small documents
                                file_context += f"\n[Document uploaded: {file_data.name}]\nDocument content: {doc_result['text']}"
                        else:
                            file_context += f"\n[Document uploaded: {file_data.name} - Could not extract text content]"
                    except Exception as e:
                        logger.error(f"Error processing document {file_data.name}: {e}")
                        file_context += f"\n[Document uploaded: {file_data.name} - Processing failed]"
            
            # Get chat history for context
            recent_messages = await chat_service.get_session_messages(session_id, user_id, limit=10)
            
            # Build conversation history for OpenAI
            messages = []
            for msg in recent_messages[-5:]:  # Last 5 messages for context
                role = "user" if msg.type == MessageTypeEnum.USER else "assistant"
                messages.append({"role": role, "content": msg.content})
            
            # Add current message
            current_message = request.message + file_context
            messages.append({"role": "user", "content": current_message})
            
            # Get AI response
            ai_response = await openai_service.get_chat_completion(
                messages=messages,
                language=request.language.value
            )
            
            # Save AI response
            await chat_service.add_message(
                session_id=session_id,
                user_id=user_id,
                content=ai_response["content"],
                message_type=MessageTypeEnum.AI,
                language=request.language.value,
                confidence=ai_response["confidence"]
            )
            
            # Update session title if it's the first exchange
            if session.message_count == 0:
                title = await self._generate_session_title(request.message)
                await chat_service.update_session_title(session_id, user_id, title)
            
            return {
                "data": SendMessageResponse(
                    content=ai_response["content"],
                    confidence=ai_response["confidence"],
                    session_id=session_id
                ),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in send_message: {e}")
            raise HTTPException(status_code=500, detail="Failed to process message")
    
    async def get_chat_history(
        self,
        page: int = 1,
        limit: int = 10,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Get user's chat history"""
        try:
            user_id = str(current_user.id)
            
            result = await chat_service.get_user_sessions(user_id, page, limit)
            
            history_data = []
            for session in result["sessions"]:
                history_data.append(ChatHistoryResponse(
                    id=str(session.id),
                    date=session.created_at.strftime("%Y-%m-%d"),
                    title=session.title,
                    language=session.language.value,
                    message_count=session.message_count
                ))
            
            return {
                "data": history_data,
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in get_chat_history: {e}")
            raise HTTPException(status_code=500, detail="Failed to get chat history")
    
    async def get_session_messages(
        self,
        session_id: str,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Get messages from a specific chat session"""
        try:
            user_id = str(current_user.id)
            
            # Validate session belongs to user
            session = await chat_service.get_session(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            messages = await chat_service.get_session_messages(session_id, user_id)
            
            messages_data = []
            for message in messages:
                messages_data.append(ChatSessionMessagesResponse(
                    id=str(message.id),
                    type=message.type.value,
                    content=message.content,
                    timestamp=message.timestamp.isoformat(),
                    language=message.language.value,
                    has_file=message.has_file
                ))
            
            return {
                "data": messages_data,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in get_session_messages: {e}")
            raise HTTPException(status_code=500, detail="Failed to get session messages")
    
    async def delete_session(
        self,
        session_id: str,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Delete a chat session"""
        try:
            user_id = str(current_user.id)
            
            success = await chat_service.delete_session(session_id, user_id)
            
            if not success:
                raise HTTPException(status_code=404, detail="Session not found")
            
            return {
                "success": True,
                "message": "Session deleted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error in delete_session: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete session")
    
    async def upload_document(
        self,
        file: UploadFile,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Upload document for chat"""
        try:
            user_id = str(current_user.id)
            
            # Validate file type
            if not file_service.is_valid_document_file(file.filename):
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            # Save file
            file_id, file_path, file_size = await file_service.save_uploaded_file(file, "document")
            
            # Save document metadata
            doc_id = await chat_service.save_document(
                user_id=user_id,
                file_name=file.filename,
                file_size=file_size,
                file_type=file.content_type,
                file_url=file_service.get_file_url(file_path)
            )
            
            return {
                "data": UploadDocumentResponse(
                    file_id=doc_id,
                    file_name=file.filename,
                    file_size=file_size,
                    file_type=file.content_type,
                    file_url=file_service.get_file_url(file_path)
                ),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in upload_document: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload document")
    
    async def delete_document(
        self,
        file_id: str,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Delete uploaded document"""
        try:
            user_id = str(current_user.id)
            
            # Get document
            document = await chat_service.get_document(file_id, user_id)
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
            
            # Delete file from filesystem
            await file_service.delete_file(document.file_url.replace("/static/", ""))
            
            # Delete document record
            success = await chat_service.delete_document(file_id, user_id)
            
            return {
                "success": success,
                "message": "Document deleted successfully" if success else "Failed to delete document"
            }
            
        except Exception as e:
            logger.error(f"Error in delete_document: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete document")
    
    async def voice_to_text(
        self,
        audio: UploadFile,
        language: str = Form(default="en"),
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Convert voice recording to text"""
        try:
            # Validate audio file
            if not file_service.is_valid_audio_file(audio.filename):
                raise HTTPException(status_code=400, detail="Invalid audio file type")
            
            # Read audio content
            audio_content = await audio.read()
            
            # Convert language to Sarvam format
            sarvam_language = sarvam_service.get_language_code(language)
            
            # Use Sarvam AI for speech to text
            stt_result = await sarvam_service.speech_to_text(audio_content, sarvam_language)
            
            return {
                "data": VoiceToTextResponse(
                    text=stt_result.get("transcript", ""),
                    confidence=0.9,  # Sarvam doesn't provide confidence, using default
                    language=language
                ),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in voice_to_text: {e}")
            raise HTTPException(status_code=500, detail="Failed to convert voice to text")
    
    async def text_to_speech(
        self,
        request: TextToSpeechRequest,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Convert text to speech audio"""
        try:
            # Convert language to Sarvam format
            sarvam_language = sarvam_service.get_language_code(request.language.value)
            
            # Get appropriate speaker for language
            speaker = request.voice or sarvam_service.get_speaker_for_language(sarvam_language)
            
            # Use Sarvam AI for text to speech
            tts_result = await sarvam_service.text_to_speech(
                request.text,
                sarvam_language,
                speaker,
                request.speed or 1.0
            )
            
            # Save audio file
            if "audios" in tts_result and tts_result["audios"]:
                audio_base64 = tts_result["audios"][0]
                file_id, file_path, file_size = await file_service.save_base64_file(
                    audio_base64,
                    "tts_output.wav",
                    "audio"
                )
                
                # Use full URL for audio files so frontend can play them
                audio_url = file_service.get_file_url(file_path, full_url=True)
                
                # Estimate duration (rough calculation)
                duration = len(request.text.split()) * 0.6  # ~0.6 seconds per word
                
                return {
                    "data": TextToSpeechResponse(
                        audio_url=audio_url,
                        duration=duration
                    ),
                    "success": True
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to generate audio")
            
        except Exception as e:
            logger.error(f"Error in text_to_speech: {e}")
            raise HTTPException(status_code=500, detail="Failed to convert text to speech")
    
    async def start_new_session(
        self,
        request: NewSessionRequest,
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Start a new chat session"""
        try:
            user_id = str(current_user.id)
            
            # Create new session
            session_id = await chat_service.create_session(user_id, request.language.value)
            
            # Get greeting message
            greeting_content = openai_service.get_greeting_message(request.language.value)
            
            # Save greeting message
            message_id = await chat_service.add_message(
                session_id=session_id,
                user_id=user_id,
                content=greeting_content,
                message_type=MessageTypeEnum.AI,
                language=request.language.value,
                confidence=1.0
            )
            
            return {
                "data": NewSessionResponse(
                    session_id=session_id,
                    greeting=GreetingMessage(
                        content=greeting_content,
                        language=request.language.value,
                        message_id=message_id
                    )
                ),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in start_new_session: {e}")
            raise HTTPException(status_code=500, detail="Failed to start new session")
    
    async def upload_and_analyze_document(
        self,
        file: UploadFile,
        session_id: Optional[str] = Form(None),
        query: Optional[str] = Form(None),
        language: str = Form("en"),
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Upload and analyze a document with AI"""
        try:
            # Validate file type
            if not file_service.is_valid_document_file(file.filename):
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid file type. Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG"
                )
            
            # Save uploaded file
            file_id, file_path, file_size = await file_service.save_uploaded_file(
                file, 
                "document"
            )
            
            # Save document metadata to database
            doc_id = await chat_service.save_document(
                user_id=str(current_user.id),
                file_name=file.filename,
                file_size=file_size,
                file_type=file.content_type,
                file_url=file_service.get_file_url(file_path),
                session_id=session_id
            )
            
            # Create new session if none provided
            if not session_id:
                session_id = await chat_service.create_session(
                    user_id=str(current_user.id),
                    language=language
                )
            
            # Process document with AI
            result = await chat_service.process_document_message(
                session_id=session_id,
                user_id=str(current_user.id),
                file_path=file_path,
                user_query=query,
                language=language
            )
            
            if result["success"]:
                return {
                    "data": {
                        "document_id": doc_id,
                        "session_id": session_id,
                        "analysis": result["content"],
                        "confidence": result["confidence"],
                        "document_info": result["document_info"],
                        "file_url": file_service.get_file_url(file_path)
                    },
                    "success": True
                }
            else:
                raise HTTPException(status_code=500, detail=result.get("error", "Failed to analyze document"))
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in upload_and_analyze_document: {e}")
            raise HTTPException(status_code=500, detail="Failed to process document")

    async def analyze_health_document(
        self,
        file: UploadFile,
        session_id: Optional[str] = Form(None),
        language: str = Form("en"),
        current_user: User = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """Upload and analyze a health/medical document"""
        try:
            # Validate file type
            if not file_service.is_valid_document_file(file.filename):
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid file type. Supported formats: PDF, DOC, DOCX, TXT"
                )
            
            # Save uploaded file
            file_id, file_path, file_size = await file_service.save_uploaded_file(
                file, 
                "document"
            )
            
            # Save document metadata
            doc_id = await chat_service.save_document(
                user_id=str(current_user.id),
                file_name=file.filename,
                file_size=file_size,
                file_type=file.content_type,
                file_url=file_service.get_file_url(file_path),
                session_id=session_id
            )
            
            # Create new session if none provided
            if not session_id:
                session_id = await chat_service.create_session(
                    user_id=str(current_user.id),
                    language=language
                )
            
            # Get health-specific analysis
            result = await chat_service.get_health_document_analysis(
                session_id=session_id,
                user_id=str(current_user.id),
                file_path=file_path,
                language=language
            )
            
            if result["success"]:
                return {
                    "data": {
                        "document_id": doc_id,
                        "session_id": session_id,
                        "health_analysis": result["analysis"],
                        "confidence": result["confidence"],
                        "document_info": result["document_info"],
                        "file_url": file_service.get_file_url(file_path)
                    },
                    "success": True
                }
            else:
                raise HTTPException(status_code=500, detail=result.get("error", "Failed to analyze health document"))
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in analyze_health_document: {e}")
            raise HTTPException(status_code=500, detail="Failed to process health document")

    async def _generate_session_title(self, first_message: str) -> str:
        """Generate a session title based on the first message"""
        try:
            # Simple title generation - take first few words
            words = first_message.split()[:5]
            title = " ".join(words)
            if len(title) > 50:
                title = title[:50] + "..."
            return title or "New Chat"
        except:
            return "New Chat"


# Global instance
chatbot_controller = ChatbotController()