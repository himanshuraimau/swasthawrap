from openai import AsyncOpenAI # type: ignore
from typing import List, Dict, Any, Optional
from config import settings
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-4"
        self.system_prompts = {
            "en": """You are SwasthWrap AI, a helpful health assistant. You provide health advice, 
                     medication reminders, and wellness tips. When users upload documents (PDFs, images, text files), 
                     analyze their content and provide relevant health insights. Always be empathetic and encourage 
                     users to consult healthcare professionals for serious concerns. Keep responses 
                     concise and helpful.""",
            "hi": """आप SwasthWrap AI हैं, एक सहायक स्वास्थ्य सहायक। आप स्वास्थ्य सलाह, 
                     दवा अनुस्मारक और कल्याण सुझाव प्रदान करते हैं। जब उपयोगकर्ता दस्तावेज़ (PDF, 
                     चित्र, टेक्स्ट फ़ाइलें) अपलोड करते हैं, तो उनकी सामग्री का विश्लेषण करें और 
                     प्रासंगिक स्वास्थ्य जानकारी प्रदान करें। हमेशा सहानुभूतिपूर्ण रहें 
                     और गंभीर चिंताओं के लिए स्वास्थ्य पेशेवरों से सलाह लेने को प्रोत्साहित करें।""",
            "ta": """நீங்கள் SwasthWrap AI, ஒரு உதவிகரமான சுகாதார உதவியாளர். நீங்கள் சுகாதார 
                     ஆலோசனை, மருந்து நினைவூட்டல்கள் மற்றும் நல்வாழ்வு குறிப்புகளை வழங்குகிறீர்கள். 
                     பயனர்கள் ஆவணங்களை (PDF, படங்கள், உரை கோப்புகள்) பதிவேற்றும்போது, 
                     அவற்றின் உள்ளடக்கத்தை பகுப்பாய்வு செய்து தொடர்புடைய சுகாதார நுண்ணறிவுகளை வழங்கவும். 
                     எப்போதும் அனுதாபத்துடன் இருங்கள் மற்றும் தீவிர கவலைகளுக்கு சுகாதார 
                     நிபுணர்களை ஆலோசிக்க ஊக்குவிக்கவும்."""
        }
    
    async def get_chat_completion(
        self,
        messages: List[Dict[str, str]],
        language: str = "en",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Get chat completion from OpenAI"""
        try:
            # Add system prompt based on language
            system_prompt = self.system_prompts.get(language, self.system_prompts["en"])
            
            # Prepare messages with system prompt
            full_messages = [
                {"role": "system", "content": system_prompt}
            ] + messages
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            content = response.choices[0].message.content
            
            # Calculate confidence based on response quality
            confidence = self._calculate_confidence(content)
            
            return {
                "content": content,
                "confidence": confidence,
                "usage": response.usage.dict() if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"OpenAI completion error: {e}")
            raise
    
    def _calculate_confidence(self, content: str) -> float:
        """Calculate confidence score based on response characteristics"""
        if not content:
            return 0.0
        
        # Simple confidence calculation based on response length and completeness
        word_count = len(content.split())
        
        if word_count < 5:
            return 0.5
        elif word_count < 20:
            return 0.7
        elif word_count < 100:
            return 0.85
        else:
            return 0.9
    
    async def get_health_advice(
        self,
        user_query: str,
        user_context: Optional[Dict] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get health-specific advice"""
        try:
            # Build context-aware prompt
            context_info = ""
            if user_context:
                age = user_context.get("age", "")
                gender = user_context.get("gender", "")
                conditions = user_context.get("medical_conditions", [])
                
                context_info = f"User context: Age {age}, Gender {gender}"
                if conditions:
                    context_info += f", Medical conditions: {', '.join(conditions)}"
                context_info += ". "
            
            messages = [
                {
                    "role": "user", 
                    "content": f"{context_info}Question: {user_query}"
                }
            ]
            
            return await self.get_chat_completion(messages, language)
            
        except Exception as e:
            logger.error(f"Health advice error: {e}")
            raise
    
    def get_greeting_message(self, language: str = "en") -> str:
        """Get greeting message in specified language"""
        greetings = {
            "en": "Hello! I'm your SwasthWrap health assistant. How can I help you today?",
            "hi": "नमस्ते! मैं आपका SwasthWrap स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
            "ta": "வணக்கம்! நான் உங்கள் SwasthWrap சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
        }
        return greetings.get(language, greetings["en"])
    
    async def analyze_document(
        self,
        document_text: str,
        query: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Analyze document content and answer questions about it"""
        try:
            # Prepare the analysis prompt
            if query:
                prompt = f"""
                Please analyze the following document and answer the specific question.
                
                Document content:
                {document_text}
                
                Question: {query}
                
                Please provide a comprehensive answer based on the document content.
                """
            else:
                prompt = f"""
                Please analyze the following document and provide:
                1. A brief summary
                2. Key points or important information
                3. Any health-related insights or recommendations (if applicable)
                
                Document content:
                {document_text}
                """
            
            messages = [
                {"role": "user", "content": prompt}
            ]
            
            return await self.get_chat_completion(
                messages, 
                language, 
                temperature=0.3,  # Lower temperature for more factual analysis
                max_tokens=1500
            )
            
        except Exception as e:
            logger.error(f"Document analysis error: {e}")
            raise

    async def process_document_chunks(
        self,
        chunks: List[str],
        query: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Process large documents by analyzing chunks"""
        try:
            chunk_summaries = []
            
            # Process each chunk
            for i, chunk in enumerate(chunks):
                logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                
                if query:
                    prompt = f"""
                    Based on this section of a document, please answer the question if the information is relevant.
                    
                    Document section:
                    {chunk}
                    
                    Question: {query}
                    
                    If this section doesn't contain relevant information for the question, just say "No relevant information in this section."
                    """
                else:
                    prompt = f"""
                    Please summarize the key points from this section of a document:
                    
                    {chunk}
                    
                    Provide a concise summary of the main points.
                    """
                
                messages = [{"role": "user", "content": prompt}]
                
                chunk_result = await self.get_chat_completion(
                    messages, 
                    language, 
                    temperature=0.3,
                    max_tokens=500
                )
                
                if chunk_result.get("content") and "No relevant information" not in chunk_result["content"]:
                    chunk_summaries.append({
                        "chunk_index": i,
                        "summary": chunk_result["content"]
                    })
            
            # Combine chunk summaries into final response
            if chunk_summaries:
                combined_content = "\n\n".join([cs["summary"] for cs in chunk_summaries])
                
                # Generate final comprehensive response
                final_prompt = f"""
                Based on the following analyzed sections of a document, please provide a comprehensive response:
                
                {combined_content}
                
                {"Please answer the question: " + query if query else "Please provide a comprehensive summary and any insights."}
                """
                
                messages = [{"role": "user", "content": final_prompt}]
                
                final_result = await self.get_chat_completion(
                    messages, 
                    language, 
                    temperature=0.5,
                    max_tokens=1000
                )
                
                return {
                    "content": final_result.get("content", ""),
                    "confidence": final_result.get("confidence", 0.8),
                    "chunks_processed": len(chunks),
                    "relevant_chunks": len(chunk_summaries),
                    "usage": final_result.get("usage")
                }
            else:
                return {
                    "content": "No relevant information found in the document for your query." if query else "Unable to extract meaningful content from the document.",
                    "confidence": 0.3,
                    "chunks_processed": len(chunks),
                    "relevant_chunks": 0
                }
                
        except Exception as e:
            logger.error(f"Document chunks processing error: {e}")
            raise

    async def get_health_document_insights(
        self,
        document_text: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get health-specific insights from medical documents"""
        try:
            prompt = f"""
            Please analyze this health/medical document and provide:
            1. Key health information and findings
            2. Important dates, measurements, or values
            3. Recommendations or action items mentioned
            4. Any medications or treatments discussed
            5. Follow-up requirements or next steps
            
            Please present the information in a clear, organized manner.
            
            Document content:
            {document_text}
            """
            
            messages = [{"role": "user", "content": prompt}]
            
            return await self.get_chat_completion(
                messages, 
                language, 
                temperature=0.2,  # Very low temperature for medical accuracy
                max_tokens=1500
            )
            
        except Exception as e:
            logger.error(f"Health document insights error: {e}")
            raise


# Global instance
openai_service = OpenAIService()
