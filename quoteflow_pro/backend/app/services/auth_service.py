from datetime import timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.user import UserLogin, TokenResponse

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def login_user(db: Session, user_credentials: UserLogin) -> TokenResponse:
        """Login user and return tokens"""
        user = AuthService.authenticate_user(
            db, user_credentials.username, user_credentials.password
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token_expires = timedelta(minutes=30)
        refresh_token_expires = timedelta(days=7)
        
        access_token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            subject=user.id, expires_delta=refresh_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user
        )
    
    @staticmethod
    def refresh_token(db: Session, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token"""
        # Implementation for token refresh
        # This would validate the refresh token and create new access token
        pass
