from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "QuoteFlow Pro API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
    
    # Database
    DATABASE_URL: str = "postgresql://pricing_system_gp_user:urVVGzCZruwELazHNnhjYXyMwzxyesJD@dpg-d2smgj6mcj7s73abhln0-a.singapore-postgres.render.com/pricing_system_gp"
    DATABASE_TEST_URL: Optional[str] = "sqlite:///./quoteflow_test.db"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]
    # TEMPORARY: Using wildcard for development debugging
    CORS_ORIGINS: List[str] = ["*"]
    
    # Original specific origins (commented out for debugging)
    # CORS_ORIGINS: List[str] = [
    #     "http://localhost:3000",
    #     "http://localhost:5173", 
    #     "http://localhost:8000",
    #     "http://127.0.0.1:3000",
    #     "http://127.0.0.1:5173",
    #     "http://127.0.0.1:8000",
    #     "https://quoteflow-pro.vercel.app"
    # ]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    CORS_HEADERS: List[str] = ["*"]
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
