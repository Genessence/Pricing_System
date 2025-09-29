"""
Pydantic schemas for Users model.
"""

from pydantic import Field, EmailStr, validator
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema
from models.enums import UserRoles


class UsersBase(BaseCreateSchema):
    """Base schema for Users."""
    
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="User email")
    first_name: Optional[str] = Field(None, max_length=50, description="First name")
    last_name: Optional[str] = Field(None, max_length=50, description="Last name")
    role: UserRoles = Field(default=UserRoles.USER, description="User role")
    is_active: bool = Field(default=True, description="Whether user is active")
    site_id: Optional[UUID] = Field(None, description="Associated site ID")


class UsersCreate(UsersBase):
    """Schema for creating a new user."""
    
    password: str = Field(..., min_length=8, max_length=100, description="User password")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UsersUpdate(BaseUpdateSchema):
    """Schema for updating a user."""
    
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    role: Optional[UserRoles] = None
    is_active: Optional[bool] = None
    site_id: Optional[UUID] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UsersResponse(UsersBase, BaseResponseSchema):
    """Schema for user response."""
    pass


class UsersListResponse(BaseResponseSchema):
    """Schema for user list response."""
    
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRoles
    is_active: bool
    site_id: Optional[UUID] = None


class UsersLogin(BaseCreateSchema):
    """Schema for user login."""
    
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class UsersPasswordChange(BaseCreateSchema):
    """Schema for password change."""
    
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        return v
