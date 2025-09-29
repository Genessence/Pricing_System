"""
User routes for managing system users.
"""

from fastapi import APIRouter, Query, Path
from typing import List, Optional
from uuid import UUID

from controllers.users import users_controller
from schemas.users import (
    UsersCreate, UsersUpdate, UsersResponse, UsersListResponse, 
    UsersLogin, UsersPasswordChange
)

router = APIRouter()


@router.post("/", response_model=UsersResponse, status_code=201)
async def create_user(user_data: UsersCreate):
    """Create a new user."""
    return users_controller.create_user(user_data)


@router.get("/", response_model=List[UsersListResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    role: Optional[str] = Query(None, description="Filter by role"),
    site_id: Optional[UUID] = Query(None, description="Filter by site ID")
):
    """Get multiple users with optional filtering."""
    return users_controller.get_users(
        skip=skip, limit=limit, is_active=is_active, 
        role=role, site_id=site_id
    )


@router.get("/active", response_model=List[UsersListResponse])
async def get_active_users():
    """Get all active users."""
    return users_controller.get_active_users()


@router.get("/site/{site_id}", response_model=List[UsersListResponse])
async def get_users_by_site(site_id: UUID = Path(..., description="Site ID")):
    """Get users for a specific site."""
    return users_controller.get_users_by_site(site_id)


@router.get("/{user_id}", response_model=UsersResponse)
async def get_user(user_id: UUID = Path(..., description="User ID")):
    """Get a user by ID."""
    return users_controller.get_user(user_id)


@router.put("/{user_id}", response_model=UsersResponse)
async def update_user(
    user_data: UsersUpdate,
    user_id: UUID = Path(..., description="User ID")
):
    """Update a user."""
    return users_controller.update_user(user_id, user_data)


@router.delete("/{user_id}")
async def delete_user(user_id: UUID = Path(..., description="User ID")):
    """Delete a user."""
    return users_controller.delete_user(user_id)


@router.post("/login", response_model=UsersResponse)
async def authenticate_user(login_data: UsersLogin):
    """Authenticate a user."""
    return users_controller.authenticate_user(login_data)
