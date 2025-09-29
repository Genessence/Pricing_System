"""
Pydantic schemas for Transport Items model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class TransportItemsBase(BaseCreateSchema):
    """Base schema for Transport Items."""
    
    from_location: str = Field(..., min_length=1, max_length=100, description="From location")
    to_location: str = Field(..., min_length=1, max_length=100, description="To location")
    vehicle_size: str = Field(..., min_length=1, max_length=50, description="Vehicle size")
    load: int = Field(..., ge=0, description="Load capacity")
    frequency: int = Field(..., ge=0, description="Frequency")
    dimensions: str = Field(..., min_length=1, max_length=100, description="Dimensions")
    suggestions: Optional[str] = Field(None, max_length=500, description="Suggestions")


class TransportItemsCreate(TransportItemsBase):
    """Schema for creating a new transport item."""
    pass


class TransportItemsUpdate(BaseUpdateSchema):
    """Schema for updating a transport item."""
    
    from_location: Optional[str] = Field(None, min_length=1, max_length=100)
    to_location: Optional[str] = Field(None, min_length=1, max_length=100)
    vehicle_size: Optional[str] = Field(None, min_length=1, max_length=50)
    load: Optional[int] = Field(None, ge=0)
    frequency: Optional[int] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, min_length=1, max_length=100)
    suggestions: Optional[str] = Field(None, max_length=500)


class TransportItemsResponse(TransportItemsBase, BaseResponseSchema):
    """Schema for transport item response."""
    pass


class TransportItemsListResponse(BaseResponseSchema):
    """Schema for transport item list response."""
    
    from_location: str
    to_location: str
    vehicle_size: str
    load: int
    frequency: int
    dimensions: str
    suggestions: Optional[str] = None
