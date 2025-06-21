import os
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Database
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb+srv://enghimanshu:enghimanshu@cluster0.vd8qblh.mongodb.net/")
    database_name: str = os.getenv("DATABASE_NAME", "swasthwrap")
    
    # OpenAI
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "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")
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your_secret_key_here")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # API Settings
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }


settings = Settings()
