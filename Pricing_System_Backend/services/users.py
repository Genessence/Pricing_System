"""
Users service for managing system users.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging
from passlib.context import CryptContext

from services.base import BaseService
from models.users import Users
from schemas.users import UsersCreate, UsersUpdate, UsersLogin
from utils.error_handler import DatabaseError, NotFoundError, ValidationError, UnauthorizedError

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UsersService(BaseService[Users]):
    """Service for managing users."""
    
    def __init__(self):
        super().__init__(Users)
    
    def create_user(self, db: Session, user_data: UsersCreate) -> Users:
        """
        Create a new user.
        
        Args:
            db: Database session
            user_data: User creation data
            
        Returns:
            Created user instance
        """
        try:
            # Check if username already exists
            existing_user = db.query(Users).filter(Users.username == user_data.username).first()
            if existing_user:
                raise ValidationError("Username already exists", context={"username": user_data.username})
            
            # Check if email already exists
            existing_email = db.query(Users).filter(Users.email == user_data.email).first()
            if existing_email:
                raise ValidationError("Email already exists", context={"email": user_data.email})
            
            # Hash password
            hashed_password = pwd_context.hash(user_data.password)
            
            user_dict = user_data.model_dump(exclude={"password"})
            user_dict["password"] = hashed_password
            
            return self.create(db, user_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating user: {str(e)}")
            raise DatabaseError("Failed to create user", context={"error": str(e)})
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[Users]:
        """
        Get user by username.
        
        Args:
            db: Database session
            username: Username
            
        Returns:
            User instance or None if not found
        """
        try:
            return db.query(Users).filter(Users.username == username).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting user by username {username}: {str(e)}")
            raise DatabaseError("Failed to get user by username", context={"username": username, "error": str(e)})
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[Users]:
        """
        Get user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User instance or None if not found
        """
        try:
            return db.query(Users).filter(Users.email == email).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting user by email {email}: {str(e)}")
            raise DatabaseError("Failed to get user by email", context={"email": email, "error": str(e)})
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[Users]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            username: Username or email
            password: Plain text password
            
        Returns:
            User instance if authenticated, None otherwise
        """
        try:
            # Try to find user by username or email
            user = db.query(Users).filter(
                (Users.username == username) | (Users.email == username)
            ).first()
            
            if not user:
                return None
            
            if not user.is_active:
                return None
            
            if not pwd_context.verify(password, user.password):
                return None
            
            return user
        except SQLAlchemyError as e:
            logger.error(f"Error authenticating user {username}: {str(e)}")
            raise DatabaseError("Failed to authenticate user", context={"username": username, "error": str(e)})
    
    def update_user(self, db: Session, user_id: UUID, user_data: UsersUpdate) -> Optional[Users]:
        """
        Update a user.
        
        Args:
            db: Database session
            user_id: User ID
            user_data: User update data
            
        Returns:
            Updated user instance
        """
        try:
            # Check if username is being updated and if it conflicts
            if user_data.username:
                existing_user = db.query(Users).filter(
                    Users.username == user_data.username,
                    Users.id != user_id
                ).first()
                if existing_user:
                    raise ValidationError("Username already exists", context={"username": user_data.username})
            
            # Check if email is being updated and if it conflicts
            if user_data.email:
                existing_email = db.query(Users).filter(
                    Users.email == user_data.email,
                    Users.id != user_id
                ).first()
                if existing_email:
                    raise ValidationError("Email already exists", context={"email": user_data.email})
            
            update_data = user_data.model_dump(exclude_unset=True)
            
            # Hash password if being updated
            if "password" in update_data and update_data["password"]:
                update_data["password"] = pwd_context.hash(update_data["password"])
            
            return self.update(db, user_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating user {user_id}: {str(e)}")
            raise DatabaseError("Failed to update user", context={"id": str(user_id), "error": str(e)})
    
    def get_users_by_site(self, db: Session, site_id: UUID) -> List[Users]:
        """
        Get all users for a specific site.
        
        Args:
            db: Database session
            site_id: Site ID
            
        Returns:
            List of users for the site
        """
        try:
            return db.query(Users).filter(Users.site_id == site_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting users by site {site_id}: {str(e)}")
            raise DatabaseError("Failed to get users by site", context={"site_id": str(site_id), "error": str(e)})
    
    def get_active_users(self, db: Session) -> List[Users]:
        """
        Get all active users.
        
        Args:
            db: Database session
            
        Returns:
            List of active users
        """
        try:
            return db.query(Users).filter(Users.is_active == True).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting active users: {str(e)}")
            raise DatabaseError("Failed to get active users", context={"error": str(e)})
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """
        Hash a password.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
