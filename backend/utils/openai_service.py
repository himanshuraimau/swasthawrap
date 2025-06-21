import openai
from typing import List, Dict, Any, Optional
import logging
import json

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self, api_key: str):
        if not api_key:
            logger.warning("OpenAI API key not provided. Chat functionality will use fallback responses.")
            self.client = None
        else:
            self.client = openai.AsyncOpenAI(api_key=api_key)
        
    async def get_chat_response(
        self, 
        message: str, 
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Get response from OpenAI for health-related queries
        """
        try:
            # If no OpenAI client, return fallback response
            if not self.client:
                return {
                    "content": self._get_fallback_response(language),
                    "confidence": 0.1,
                    "sources": ["Fallback Response"],
                    "suggestions": []
                }
            
            # System prompt for health assistant
            system_prompt = self._get_system_prompt(language)
            
            # Prepare messages
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages for context
                    messages.append({
                        "role": "user" if msg["type"] == "user" else "assistant",
                        "content": msg["content"]
                    })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Get response from OpenAI
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            
            content = response.choices[0].message.content
            
            # Generate suggestions based on the query
            suggestions = await self._generate_suggestions(message, language)
            
            return {
                "content": content,
                "confidence": 0.9,  # Could implement actual confidence scoring
                "sources": ["OpenAI GPT-3.5", "Medical Knowledge Base"],
                "suggestions": suggestions
            }
            
        except Exception as e:
            logger.error(f"Error getting OpenAI response: {e}")
            return {
                "content": self._get_fallback_response(language),
                "confidence": 0.1,
                "sources": ["Fallback Response"],
                "suggestions": []
            }
    
    def _get_system_prompt(self, language: str) -> str:
        """Get system prompt based on language"""
        prompts = {
            "en": """You are a helpful health assistant for SwasthWrap, a health management platform. 
                     Provide accurate, helpful health information while always recommending users consult 
                     healthcare professionals for serious medical concerns. Be empathetic and supportive.
                     Keep responses concise but informative.""",
            "hi": """आप SwasthWrap के लिए एक सहायक स्वास्थ्य सहायक हैं, जो एक स्वास्थ्य प्रबंधन प्लेटफॉर्म है।
                     सटीक, उपयोगी स्वास्थ्य जानकारी प्रदान करें और हमेशा गंभीर चिकित्सा चिंताओं के लिए
                     स्वास्थ्य पेशेवरों से सलाह लेने की सिफारिश करें।""",
            "ta": """நீங்கள் SwasthWrap என்ற உடல்நலப் பராமரிப்பு தளத்திற்கான உதவிகரமான உடல்நலப் பராமரிப்பு உதவியாளர்.
                     துல்லியமான, பயனுள்ள உடல்நலத் தகவலை வழங்கவும்."""
        }
        return prompts.get(language, prompts["en"])
    
    async def _generate_suggestions(self, message: str, language: str) -> List[str]:
        """Generate follow-up suggestions based on user query"""
        try:
            if not self.client:
                return []
                
            suggestions_prompt = f"""Based on this health query: "{message}", 
                                   suggest 3 short follow-up questions a user might ask. 
                                   Respond in {language} language.
                                   Format as a JSON array of strings."""
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": suggestions_prompt}],
                max_tokens=200,
                temperature=0.8
            )
            
            suggestions_text = response.choices[0].message.content
            try:
                suggestions = json.loads(suggestions_text)
                return suggestions if isinstance(suggestions, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return []
    
    def _get_fallback_response(self, language: str) -> str:
        """Get fallback response when OpenAI fails"""
        responses = {
            "en": "I'm sorry, I'm having trouble processing your request right now. Please try again later or consult with a healthcare professional.",
            "hi": "क्षमा करें, मुझे अभी आपके अनुरोध को संसाधित करने में समस्या हो रही है। कृपया बाद में फिर कोशिश करें।",
            "ta": "மன்னிக்கவும், உங்கள் கோரிக்கையை இப்போது செயலாக்குவதில் சிக்கல் உள்ளது. பின்னர் மீண்டும் முயற்சிக்கவும்."
        }
        return responses.get(language, responses["en"])
