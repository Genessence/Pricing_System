"""
Authentication middleware for JWT token validation and user authentication.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import logging

from config.database import get_db
from config.settings import settings
from services.users import UsersService
from models.users import Users

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()

# User service instance
users_service = UsersService()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token
        expires_delta: Token expiration time
        
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token data or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {str(e)}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Users:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP authorization credentials
        db: Database session
        
    Returns:
        Current user object
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the token
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Extract user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = users_service.get(db, user_id)
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: Users = Depends(get_current_user)
) -> Users:
    """
    Get the current active user.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Active user object
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: Users = Depends(get_current_user)
) -> Users:
    """
    Get the current admin user.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Admin user object
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_approver_user(
    current_user: Users = Depends(get_current_user)
) -> Users:
    """
    Get the current approver user.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Approver user object
        
    Raises:
        HTTPException: If user is not approver
    """
    if current_user.role not in ["ADMIN", "APPROVER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[Users]:
    """
    Authenticate a user with username and password.
    
    Args:
        db: Database session
        username: Username
        password: Plain text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = users_service.get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user_token(user: Users) -> str:
    """
    Create a JWT token for a user.
    
    Args:
        user: User object
        
    Returns:
        JWT token string
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "site_id": str(user.site_id)},
        expires_delta=access_token_expires
    )
    return access_token


# Optional authentication dependency (doesn't raise exception if no token)
async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[Users]:
    """
    Get the current user if authenticated, otherwise return None.
    
    Args:
        request: FastAPI request object
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
    """
    try:
        authorization: str = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            return None
        
        token = authorization.split(" ")[1]
        payload = verify_token(token)
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = users_service.get(db, user_id)
        return user if user and user.is_active else None
        
    except Exception as e:
        logger.error(f"Optional authentication failed: {str(e)}")
        return None
