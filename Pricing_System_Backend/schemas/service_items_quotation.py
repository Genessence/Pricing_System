"""
Pydantic schemas for Service Items Quotation model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema


class ServiceItemsQuotationBase(BaseCreateSchema):
    """Base schema for Service Items Quotation."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    service_items_id: UUID = Field(..., description="Service item ID")
    vendors_id: UUID = Field(..., description="Vendor ID")


class ServiceItemsQuotationCreate(ServiceItemsQuotationBase):
    """Schema for creating a new service items quotation."""
    pass


class ServiceItemsQuotationUpdate(BaseUpdateSchema):
    """Schema for updating a service items quotation."""
    
    rfq_id: Optional[UUID] = None
    service_items_id: Optional[UUID] = None
    vendors_id: Optional[UUID] = None


class ServiceItemsQuotationResponse(ServiceItemsQuotationBase, BaseResponseSchema):
    """Schema for service items quotation response."""
    pass


class ServiceItemsQuotationListResponse(BaseResponseSchema):
    """Schema for service items quotation list response."""
    
    rfq_id: UUID
    service_items_id: UUID
    vendors_id: UUID


class ServiceItemsQuotationWithRelations(ServiceItemsQuotationResponse):
    """Schema for service items quotation with related data."""
    
    rfq: Optional[dict] = None
    service_item: Optional[dict] = None
    vendor: Optional[dict] = None
