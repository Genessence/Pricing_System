"""
Users controller for managing system users.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.users import UsersService
from schemas.users import (
    UsersCreate, UsersUpdate, UsersResponse, UsersListResponse, 
    UsersLogin, UsersPasswordChange
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class UsersController(BaseController):
    """Controller for managing users."""
    
    def __init__(self):
        self.service = UsersService()
        super().__init__(self.service, UsersResponse)
    
    def create_user(
        self, 
        user_data: UsersCreate, 
        db: Session = Depends(get_db)
    ) -> UsersResponse:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            db: Database session
            
        Returns:
            Created user response
        """
        try:
            user = self.service.create_user(db, user_data)
            return UsersResponse.model_validate(user)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_user(
        self, 
        user_id: UUID, 
        db: Session = Depends(get_db)
    ) -> UsersResponse:
        """
        Get a user by ID.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            User response
        """
        try:
            user = self.service.get(db, user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return UsersResponse.model_validate(user)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_users(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        is_active: Optional[bool] = Query(None, description="Filter by active status"),
        role: Optional[str] = Query(None, description="Filter by role"),
        site_id: Optional[UUID] = Query(None, description="Filter by site ID"),
        db: Session = Depends(get_db)
    ) -> List[UsersListResponse]:
        """
        Get multiple users with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status
            role: Filter by role
            site_id: Filter by site ID
            db: Database session
            
        Returns:
            List of user responses
        """
        try:
            filters = {}
            if is_active is not None:
                filters["is_active"] = is_active
            if role:
                filters["role"] = role
            if site_id:
                filters["site_id"] = site_id
            
            users = self.service.get_multi(db, skip=skip, limit=limit, filters=filters)
            return [UsersListResponse.model_validate(user) for user in users]
        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_users_by_site(
        self, 
        site_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[UsersListResponse]:
        """
        Get users for a specific site.
        
        Args:
            site_id: Site ID
            db: Database session
            
        Returns:
            List of users for the site
        """
        try:
            users = self.service.get_users_by_site(db, site_id)
            return [UsersListResponse.model_validate(user) for user in users]
        except Exception as e:
            logger.error(f"Error getting users by site {site_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_active_users(
        self, 
        db: Session = Depends(get_db)
    ) -> List[UsersListResponse]:
        """
        Get all active users.
        
        Args:
            db: Database session
            
        Returns:
            List of active users
        """
        try:
            users = self.service.get_active_users(db)
            return [UsersListResponse.model_validate(user) for user in users]
        except Exception as e:
            logger.error(f"Error getting active users: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_user(
        self, 
        user_id: UUID, 
        user_data: UsersUpdate, 
        db: Session = Depends(get_db)
    ) -> UsersResponse:
        """
        Update a user.
        
        Args:
            user_id: User ID
            user_data: User update data
            db: Database session
            
        Returns:
            Updated user response
        """
        try:
            user = self.service.update_user(db, user_id, user_data)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return UsersResponse.model_validate(user)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_user(
        self, 
        user_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete a user.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, user_id)
            if not success:
                raise HTTPException(status_code=404, detail="User not found")
            return {"message": "User deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def authenticate_user(
        self, 
        login_data: UsersLogin, 
        db: Session = Depends(get_db)
    ) -> UsersResponse:
        """
        Authenticate a user.
        
        Args:
            login_data: Login credentials
            db: Database session
            
        Returns:
            Authenticated user response
        """
        try:
            user = self.service.authenticate_user(db, login_data.username, login_data.password)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            return UsersResponse.model_validate(user)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
users_controller = UsersController()
