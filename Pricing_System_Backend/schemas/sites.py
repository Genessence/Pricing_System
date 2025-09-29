"""
Pydantic schemas for Sites model.
"""

from pydantic import Field, validator
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class SitesBase(BaseCreateSchema):
    """Base schema for Sites."""
    
    code: str = Field(..., min_length=1, max_length=20, description="Site code")
    name: str = Field(..., min_length=1, max_length=100, description="Site name")
    address: str = Field(..., min_length=1, max_length=500, description="Site address")
    is_active: bool = Field(default=True, description="Whether site is active")
    last_rfq_sitewise_id: int = Field(default=0, ge=0, description="Last RFQ sitewise ID")
    contact_name: Optional[str] = Field(None, max_length=100, description="Contact person name")
    contact_email: Optional[str] = Field(None, max_length=100, description="Contact email")
    contact_number: Optional[int] = Field(None, description="Contact number")


class SitesCreate(SitesBase):
    """Schema for creating a new site."""
    pass


class SitesUpdate(BaseUpdateSchema):
    """Schema for updating a site."""
    
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    is_active: Optional[bool] = None
    last_rfq_sitewise_id: Optional[int] = Field(None, ge=0)
    contact_name: Optional[str] = Field(None, max_length=100)
    contact_email: Optional[str] = Field(None, max_length=100)
    contact_number: Optional[int] = None


class SitesResponse(SitesBase, BaseResponseSchema):
    """Schema for site response."""
    pass


class SitesListResponse(BaseResponseSchema):
    """Schema for site list response."""
    
    code: str
    name: str
    address: str
    is_active: bool
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_number: Optional[int] = None
