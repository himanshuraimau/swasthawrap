import httpx # type: ignore
import base64
from typing import Optional, Dict, Any
from config import settings
import logging

logger = logging.getLogger(__name__)


class SarvamAIService:
    def __init__(self):
        self.api_key = settings.sarvam_api_key
        self.base_url = "https://api.sarvam.ai"
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def speech_to_text(self, audio_file_content: bytes, language_code: str = "en-IN") -> Dict[str, Any]:
        """Convert speech to text using Sarvam AI"""
        try:
            async with httpx.AsyncClient() as client:
                files = {"file": ("audio.wav", audio_file_content, "audio/wav")}
                data = {
                    "language_code": language_code,
                    "model": "saarika:v2.5"
                }
                headers = {"api-subscription-key": self.api_key}
                
                response = await client.post(
                    f"{self.base_url}/speech-to-text",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Speech to text error: {e}")
            raise
    
    async def text_to_speech(
        self, 
        text: str, 
        language_code: str = "en-IN",
        speaker: str = "Anushka",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Convert text to speech using Sarvam AI"""
        try:
            # Validate text length
            if len(text) > 1500:
                text = text[:1500]
            
            # Ensure we have a valid language code
            valid_languages = [
                "bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN", 
                "ml-IN", "mr-IN", "or-IN", "pa-IN", "ta-IN", "te-IN"
            ]
            if language_code not in valid_languages:
                language_code = "en-IN"
            
            # Ensure we have a valid speaker (lowercase as required by API)
            valid_speakers = ["anushka", "manisha", "vidya", "arya", "abhilash", "karun", "hitesh", 
                            "meera", "pavithra", "maitreyi", "arvind", "amol", "amartya", 
                            "diya", "neel", "misha", "vian", "arjun", "maya"]
            speaker_lower = speaker.lower()
            if speaker_lower not in valid_speakers:
                speaker_lower = "anushka"
                
            # Ensure speed is within valid range
            speed = max(0.3, min(3.0, speed))
            
            async with httpx.AsyncClient() as client:
                payload = {
                    "text": text,
                    "target_language_code": language_code,
                    "speaker": speaker_lower,
                    "pace": speed,
                    "model": "bulbul:v2"
                }
                
                logger.info(f"TTS request payload: {payload}")
                
                response = await client.post(
                    f"{self.base_url}/text-to-speech",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                
                logger.info(f"TTS response status: {response.status_code}")
                if response.status_code != 200:
                    logger.error(f"TTS response body: {response.text}")
                
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Text to speech error: {e}")
            raise
    
    async def translate_text(
        self, 
        text: str, 
        source_language: str = "auto",
        target_language: str = "en-IN"
    ) -> Dict[str, Any]:
        """Translate text using Sarvam AI"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "input": text,
                    "source_language_code": source_language,
                    "target_language_code": target_language,
                    "model": "mayura:v1"
                }
                
                response = await client.post(
                    f"{self.base_url}/translate",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Translation error: {e}")
            raise
    
    async def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect language of input text"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {"input": text}
                
                response = await client.post(
                    f"{self.base_url}/text-lid",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            raise
    
    def get_language_code(self, language: str) -> str:
        """Convert language code to Sarvam AI format"""
        language_map = {
            "en": "en-IN",
            "hi": "hi-IN", 
            "ta": "ta-IN",
            "bn": "bn-IN",
            "gu": "gu-IN",
            "kn": "kn-IN",
            "ml": "ml-IN",
            "mr": "mr-IN",
            "or": "or-IN",
            "pa": "pa-IN",
            "te": "te-IN"
        }
        return language_map.get(language, "en-IN")
    
    def get_speaker_for_language(self, language: str) -> str:
        """Get appropriate speaker for language"""
        speaker_map = {
            "en-IN": "anushka",
            "hi-IN": "manisha",
            "ta-IN": "vidya",
            "bn-IN": "anushka",
            "gu-IN": "anushka",
            "kn-IN": "anushka",
            "ml-IN": "anushka",
            "mr-IN": "anushka",
            "or-IN": "anushka",
            "pa-IN": "anushka",
            "te-IN": "anushka"
        }
        return speaker_map.get(language, "anushka")


# Global instance
sarvam_service = SarvamAIService()
