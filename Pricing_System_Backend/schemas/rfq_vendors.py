"""
Pydantic schemas for RFQ Vendors model.
"""

from pydantic import Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class RFQVendorsBase(BaseCreateSchema):
    """Base schema for RFQ Vendors."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    vendors_ids: List[UUID] = Field(..., min_items=1, description="List of vendor IDs")
    
    @validator('vendors_ids')
    def validate_vendors_ids(cls, v):
        if not v:
            raise ValueError('At least one vendor ID is required')
        return v


class RFQVendorsCreate(RFQVendorsBase):
    """Schema for creating a new RFQ vendor association."""
    pass


class RFQVendorsUpdate(BaseUpdateSchema):
    """Schema for updating an RFQ vendor association."""
    
    rfq_id: Optional[UUID] = None
    vendors_ids: Optional[List[UUID]] = Field(None, min_items=1)
    
    @validator('vendors_ids')
    def validate_vendors_ids(cls, v):
        if v is not None and not v:
            raise ValueError('At least one vendor ID is required')
        return v


class RFQVendorsResponse(RFQVendorsBase, BaseResponseSchema):
    """Schema for RFQ vendor response."""
    pass


class RFQVendorsListResponse(BaseResponseSchema):
    """Schema for RFQ vendor list response."""
    
    rfq_id: UUID
    vendors_ids: List[UUID]


class RFQVendorsWithRelations(RFQVendorsResponse):
    """Schema for RFQ vendor with related data."""
    
    rfq: Optional[dict] = None
    vendors: List[dict] = []


class RFQVendorsAddVendor(BaseCreateSchema):
    """Schema for adding a vendor to an RFQ."""
    
    vendor_id: UUID = Field(..., description="Vendor ID to add")


class RFQVendorsRemoveVendor(BaseCreateSchema):
    """Schema for removing a vendor from an RFQ."""
    
    vendor_id: UUID = Field(..., description="Vendor ID to remove")
