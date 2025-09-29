"""
Pydantic schemas for Service Items model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class ServiceItemsBase(BaseCreateSchema):
    """Base schema for Service Items."""
    
    description: Optional[str] = Field(None, max_length=500, description="Service description")
    specification: Optional[str] = Field(None, description="Service specification")
    uom: Optional[str] = Field(None, max_length=20, description="Unit of measure")
    quantity: Optional[int] = Field(None, ge=0, description="Quantity")
    rate: Optional[int] = Field(None, ge=0, description="Rate")


class ServiceItemsCreate(ServiceItemsBase):
    """Schema for creating a new service item."""
    pass


class ServiceItemsUpdate(BaseUpdateSchema):
    """Schema for updating a service item."""
    
    description: Optional[str] = Field(None, max_length=500)
    specification: Optional[str] = None
    uom: Optional[str] = Field(None, max_length=20)
    quantity: Optional[int] = Field(None, ge=0)
    rate: Optional[int] = Field(None, ge=0)


class ServiceItemsResponse(ServiceItemsBase, BaseResponseSchema):
    """Schema for service item response."""
    pass


class ServiceItemsListResponse(BaseResponseSchema):
    """Schema for service item list response."""
    
    description: Optional[str] = None
    specification: Optional[str] = None
    uom: Optional[str] = None
    quantity: Optional[int] = None
    rate: Optional[int] = None
