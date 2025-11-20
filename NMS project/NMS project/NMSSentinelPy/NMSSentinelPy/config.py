from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "sqlite:///./nmssentinel.db"
    
    # Security settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Admin credentials (in production, these should be hashed and stored securely)
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "adminpass"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()