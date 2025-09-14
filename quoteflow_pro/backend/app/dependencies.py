from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import ALGORITHM
from app.database import get_db
from app.models.user import User, UserRole
from app.core.exceptions import PermissionDenied

security = HTTPBearer(auto_error=True)

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> User:
    """
    Get current authenticated user from JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub") or ""
        if user_id is None:
            raise credentials_exception
            
        # Validate token type
        token_type = payload.get("type")
        if token_type != "access":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:  # type: ignore
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current admin user."""
    # Debug logging
    print(f"=== ADMIN USER DEBUG ===")
    print(f"Current user ID: {current_user.id}")
    print(f"Current user role: {current_user.role}")
    print(f"Current user role type: {type(current_user.role)}")
    print(f"Current user role str: {str(current_user.role)}")
    print(f"UserRole.ADMIN.value: {UserRole.ADMIN.value}")
    print(f"Role comparison: {str(current_user.role) == UserRole.ADMIN.value}")
    print(f"Role comparison (direct): {current_user.role == UserRole.ADMIN}")
    print(f"=== END ADMIN USER DEBUG ===")
    
    # Try multiple comparison methods
    if (str(current_user.role) != UserRole.ADMIN.value and 
        current_user.role != UserRole.ADMIN):
        raise PermissionDenied("Admin access required")
    return current_user
