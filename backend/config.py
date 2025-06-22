import os
from pydantic_settings import BaseSettings # type: ignore
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Database
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your_secret_key_here")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # API Settings
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }


settings = Settings()
