"""
Pydantic schemas for Indent Items Quotation model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class IndentItemsQuotationBase(BaseCreateSchema):
    """Base schema for Indent Items Quotation."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    indent_items_id: UUID = Field(..., description="Indent item ID")
    vendor_id: UUID = Field(..., description="Vendor ID")
    transportation_freight: Optional[int] = Field(None, description="Transportation freight cost")
    packaging_charges: Optional[int] = Field(None, description="Packaging charges")
    delivery_lead_time: Optional[str] = Field(None, description="Delivery lead time")
    warranty: Optional[str] = Field(None, description="Warranty information")
    currency: Optional[str] = Field(None, max_length=3, description="Currency code (3 characters)")


class IndentItemsQuotationCreate(IndentItemsQuotationBase):
    """Schema for creating a new indent items quotation."""
    pass


class IndentItemsQuotationUpdate(BaseUpdateSchema):
    """Schema for updating an indent items quotation."""
    
    rfq_id: Optional[UUID] = None
    indent_items_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None
    transportation_freight: Optional[int] = None
    packaging_charges: Optional[int] = None
    delivery_lead_time: Optional[str] = None
    warranty: Optional[str] = None
    currency: Optional[str] = Field(None, max_length=3)


class IndentItemsQuotationResponse(IndentItemsQuotationBase, BaseResponseSchema):
    """Schema for indent items quotation response."""
    pass


class IndentItemsQuotationListResponse(BaseResponseSchema):
    """Schema for indent items quotation list response."""
    
    rfq_id: UUID
    indent_items_id: UUID
    vendor_id: UUID
    transportation_freight: Optional[int] = None
    packaging_charges: Optional[int] = None
    delivery_lead_time: Optional[str] = None
    warranty: Optional[str] = None
    currency: Optional[str] = None


class IndentItemsQuotationWithRelations(IndentItemsQuotationResponse):
    """Schema for indent items quotation with related data."""
    
    rfq: Optional[dict] = None
    indent_item: Optional[dict] = None
    vendor: Optional[dict] = None
