"""
Application settings and configuration.
Loads environment variables and provides app-wide settings.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Configuration
    APP_NAME: str = "Pricing System Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    
    # Database Configuration
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Configuration
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8080"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL is required")
        return v
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        if not v:
            raise ValueError("SECRET_KEY is required")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @validator("JWT_SECRET_KEY", pre=True)
    def validate_jwt_secret_key(cls, v):
        if not v:
            raise ValueError("JWT_SECRET_KEY is required")
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
try:
    settings = Settings()
except Exception as e:
    # This is expected during import if .env file doesn't exist yet
    # The user will need to create .env file from .env.example
    import os
    if not os.path.exists('.env'):
        print("Warning: .env file not found. Please create it from .env.example")
    
    # Create a mock settings object for development
    class MockSettings:
        APP_NAME = "Pricing System Backend"
        APP_VERSION = "1.0.0"
        DEBUG = True
        SECRET_KEY = "development-secret-key"
        DATABASE_URL = "sqlite:///./test.db"
        DATABASE_POOL_SIZE = 10
        DATABASE_MAX_OVERFLOW = 20
        JWT_SECRET_KEY = "development-jwt-secret-key"
        JWT_ALGORITHM = "HS256"
        JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
        JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7
        CORS_ORIGINS = ["*"]
        CORS_ALLOW_CREDENTIALS = True
        CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        CORS_ALLOW_HEADERS = ["*"]
        RATE_LIMIT_REQUESTS = 100
        RATE_LIMIT_WINDOW = 60
        MAX_FILE_SIZE = 10485760
        UPLOAD_DIR = "uploads"
        LOG_LEVEL = "INFO"
        LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    settings = MockSettings()
