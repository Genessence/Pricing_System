"""
Pydantic schemas for Vendors model.
"""

from pydantic import Field, EmailStr, validator
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema
from models.enums import SupplierStatus, CommodityTypes


class VendorsBase(BaseCreateSchema):
    """Base schema for Vendors."""
    
    name: str = Field(..., min_length=1, max_length=100, description="Vendor name")
    code: str = Field(..., min_length=1, max_length=20, description="Vendor code")
    is_active: bool = Field(default=True, description="Whether vendor is active")
    providing_commodity_type: CommodityTypes = Field(..., description="Commodity type provided")
    contact_person: str = Field(..., min_length=1, max_length=100, description="Contact person")
    email: Optional[EmailStr] = Field(None, description="Vendor email")
    phone: Optional[int] = Field(None, description="Phone number")
    address: Optional[str] = Field(None, max_length=500, description="Vendor address")
    state: Optional[str] = Field(None, max_length=50, description="State")
    country: Optional[str] = Field(None, max_length=50, description="Country")
    postal_code: Optional[int] = Field(None, description="Postal code")
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID")
    gst_number: Optional[str] = Field(None, max_length=50, description="GST number")
    status: SupplierStatus = Field(default=SupplierStatus.ACTIVE, description="Supplier status")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Vendor rating (1-5)")


class VendorsCreate(VendorsBase):
    """Schema for creating a new vendor."""
    pass


class VendorsUpdate(BaseUpdateSchema):
    """Schema for updating a vendor."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    is_active: Optional[bool] = None
    providing_commodity_type: Optional[CommodityTypes] = None
    contact_person: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[int] = None
    address: Optional[str] = Field(None, max_length=500)
    state: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[int] = None
    tax_id: Optional[str] = Field(None, max_length=50)
    gst_number: Optional[str] = Field(None, max_length=50)
    status: Optional[SupplierStatus] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class VendorsResponse(VendorsBase, BaseResponseSchema):
    """Schema for vendor response."""
    pass


class VendorsListResponse(BaseResponseSchema):
    """Schema for vendor list response."""
    
    name: str
    code: str
    is_active: bool
    providing_commodity_type: CommodityTypes
    contact_person: str
    email: Optional[str] = None
    phone: Optional[int] = None
    status: SupplierStatus
    rating: Optional[int] = None
