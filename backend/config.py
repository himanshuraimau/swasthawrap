import os
from pydantic_settings import BaseSettings # type: ignore
from pydantic import field_validator # type: ignore
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Database
    mongodb_url: str
    database_name: str = "swasthwrap"
    
    # OpenAI
    openai_api_key: str
    
    # Sarvam AI
    sarvam_api_key: str
    
    # JWT
    secret_key: str = "your_secret_key_here_change_this_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    backend_url: str = "http://localhost:8000"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }
    
    @field_validator('openai_api_key')
    @classmethod
    def validate_openai_key(cls, v):
        if not v or v == "your_openai_api_key_here":
            raise ValueError("OPENAI_API_KEY must be set in environment variables")
        return v
    
    @field_validator('sarvam_api_key')
    @classmethod
    def validate_sarvam_key(cls, v):
        if not v or v == "your_sarvam_api_key_here":
            raise ValueError("SARVAM_API_KEY must be set in environment variables")
        return v
    
    @field_validator('mongodb_url')
    @classmethod
    def validate_mongodb_url(cls, v):
        if not v:
            raise ValueError("MONGODB_URL must be set in environment variables")
        return v


settings = Settings()
