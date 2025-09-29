"""
Pydantic schemas for Transport Items Quotation model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class TransportItemsQuotationBase(BaseCreateSchema):
    """Base schema for Transport Items Quotation."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    transport_items_id: UUID = Field(..., description="Transport item ID")
    vendors_id: UUID = Field(..., description="Vendor ID")


class TransportItemsQuotationCreate(TransportItemsQuotationBase):
    """Schema for creating a new transport items quotation."""
    pass


class TransportItemsQuotationUpdate(BaseUpdateSchema):
    """Schema for updating a transport items quotation."""
    
    rfq_id: Optional[UUID] = None
    transport_items_id: Optional[UUID] = None
    vendors_id: Optional[UUID] = None


class TransportItemsQuotationResponse(TransportItemsQuotationBase, BaseResponseSchema):
    """Schema for transport items quotation response."""
    pass


class TransportItemsQuotationListResponse(BaseResponseSchema):
    """Schema for transport items quotation list response."""
    
    rfq_id: UUID
    transport_items_id: UUID
    vendors_id: UUID


class TransportItemsQuotationWithRelations(TransportItemsQuotationResponse):
    """Schema for transport items quotation with related data."""
    
    rfq: Optional[dict] = None
    transport_item: Optional[dict] = None
    vendor: Optional[dict] = None
