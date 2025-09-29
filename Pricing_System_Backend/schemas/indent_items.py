"""
Pydantic schemas for Indent Items model.
"""

from pydantic import Field, validator
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class IndentItemsBase(BaseCreateSchema):
    """Base schema for Indent Items."""
    
    item_code: str = Field(..., min_length=1, max_length=50, description="Item code")
    description: str = Field(..., min_length=1, max_length=500, description="Item description")
    specification: str = Field(..., min_length=1, description="Item specification")
    uom: str = Field(..., min_length=1, max_length=20, description="Unit of measure")
    is_active: bool = Field(default=True, description="Whether item is active")
    quantity: Optional[int] = Field(None, ge=0, description="Quantity")
    last_buying_price: Optional[int] = Field(None, ge=0, description="Last buying price")
    last_vendor_name: Optional[str] = Field(None, max_length=100, description="Last vendor name")


class IndentItemsCreate(IndentItemsBase):
    """Schema for creating a new indent item."""
    pass


class IndentItemsUpdate(BaseUpdateSchema):
    """Schema for updating an indent item."""
    
    item_code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    specification: Optional[str] = Field(None, min_length=1)
    uom: Optional[str] = Field(None, min_length=1, max_length=20)
    is_active: Optional[bool] = None
    quantity: Optional[int] = Field(None, ge=0)
    last_buying_price: Optional[int] = Field(None, ge=0)
    last_vendor_name: Optional[str] = Field(None, max_length=100)


class IndentItemsResponse(IndentItemsBase, BaseResponseSchema):
    """Schema for indent item response."""
    pass


class IndentItemsListResponse(BaseResponseSchema):
    """Schema for indent item list response."""
    
    item_code: str
    description: str
    specification: str
    uom: str
    is_active: bool
    quantity: Optional[int] = None
    last_buying_price: Optional[int] = None
    last_vendor_name: Optional[str] = None
