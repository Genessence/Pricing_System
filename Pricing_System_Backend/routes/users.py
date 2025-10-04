"""
User routes for managing system users.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.users import users_controller
from schemas.users import (
    UsersCreate, UsersUpdate, UsersResponse, UsersListResponse, 
    UsersLogin, UsersPasswordChange
)

router = APIRouter()


@router.post("/", response_model=UsersResponse, status_code=201)
async def create_user(user_data: UsersCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    return users_controller.create_user(user_data, db)


@router.get("/", response_model=List[UsersListResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    role: Optional[str] = Query(None, description="Filter by role"),
    site_id: Optional[UUID] = Query(None, description="Filter by site ID"),
    db: Session = Depends(get_db)
):
    """Get multiple users with optional filtering."""
    return users_controller.get_users(
        skip=skip, limit=limit, is_active=is_active, 
        role=role, site_id=site_id, db=db
    )


@router.get("/active", response_model=List[UsersListResponse])
async def get_active_users(db: Session = Depends(get_db)):
    """Get all active users."""
    return users_controller.get_active_users(db)


@router.get("/site/{site_id}", response_model=List[UsersListResponse])
async def get_users_by_site(site_id: UUID = Path(..., description="Site ID"), db: Session = Depends(get_db)):
    """Get users for a specific site."""
    return users_controller.get_users_by_site(site_id, db)


@router.get("/{user_id}", response_model=UsersResponse)
async def get_user(user_id: UUID = Path(..., description="User ID"), db: Session = Depends(get_db)):
    """Get a user by ID."""
    return users_controller.get_user(user_id, db)


@router.put("/{user_id}", response_model=UsersResponse)
async def update_user(
    user_data: UsersUpdate,
    user_id: UUID = Path(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Update a user."""
    return users_controller.update_user(user_id, user_data, db)


@router.delete("/{user_id}")
async def delete_user(user_id: UUID = Path(..., description="User ID"), db: Session = Depends(get_db)):
    """Delete a user."""
    return users_controller.delete_user(user_id, db)


@router.post("/login", response_model=UsersResponse)
async def authenticate_user(login_data: UsersLogin, db: Session = Depends(get_db)):
    """Authenticate a user."""
    return users_controller.authenticate_user(login_data, db)
