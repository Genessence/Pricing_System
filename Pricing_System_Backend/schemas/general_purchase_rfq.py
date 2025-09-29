"""
Pydantic schemas for General Purchase RFQ model.
"""

from pydantic import Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema
from models.enums import CommodityTypes, RFQStatus


class GeneralPurchaseRFQBase(BaseCreateSchema):
    """Base schema for General Purchase RFQ."""
    
    title: str = Field(..., min_length=1, max_length=200, description="RFQ title")
    description: Optional[str] = Field(None, max_length=1000, description="RFQ description")
    commodity_type: CommodityTypes = Field(..., description="Commodity type")
    status: RFQStatus = Field(default=RFQStatus.DRAFT, description="RFQ status")
    total_value: Optional[int] = Field(None, ge=0, description="Total value")
    currency: Optional[str] = Field(None, max_length=3, description="Currency code")
    apd_number: Optional[str] = Field(None, max_length=50, description="APD number")
    creator_comments: Optional[str] = Field(None, max_length=1000, description="Creator comments")
    approver_comments: Optional[str] = Field(None, max_length=1000, description="Approver comments")
    created_by: Optional[UUID] = Field(None, description="Creator user ID")
    approved_by: Optional[UUID] = Field(None, description="Approver user ID")
    sitewise_id: Optional[int] = Field(None, ge=0, description="Sitewise ID")
    site_code: Optional[str] = Field(None, max_length=20, description="Site code")


class GeneralPurchaseRFQCreate(GeneralPurchaseRFQBase):
    """Schema for creating a new RFQ."""
    pass


class GeneralPurchaseRFQUpdate(BaseUpdateSchema):
    """Schema for updating an RFQ."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    commodity_type: Optional[CommodityTypes] = None
    status: Optional[RFQStatus] = None
    total_value: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    apd_number: Optional[str] = Field(None, max_length=50)
    creator_comments: Optional[str] = Field(None, max_length=1000)
    approver_comments: Optional[str] = Field(None, max_length=1000)
    approved_by: Optional[UUID] = None
    sitewise_id: Optional[int] = Field(None, ge=0)
    site_code: Optional[str] = Field(None, max_length=20)


class GeneralPurchaseRFQResponse(GeneralPurchaseRFQBase, BaseResponseSchema):
    """Schema for RFQ response."""
    
    rfq_number: str = Field(..., description="RFQ number")


class GeneralPurchaseRFQListResponse(BaseResponseSchema):
    """Schema for RFQ list response."""
    
    rfq_number: str
    title: str
    description: Optional[str] = None
    commodity_type: CommodityTypes
    status: RFQStatus
    total_value: Optional[int] = None
    currency: Optional[str] = None
    created_by: Optional[UUID] = None
    approved_by: Optional[UUID] = None
    site_code: Optional[str] = None


class GeneralPurchaseRFQWithRelations(GeneralPurchaseRFQResponse):
    """Schema for RFQ with related data."""
    
    creator: Optional[dict] = None
    approver: Optional[dict] = None
    site: Optional[dict] = None
    service_quotations: List[dict] = []
    transport_quotations: List[dict] = []
    indent_quotations: List[dict] = []
    attachments: List[dict] = []
    rfq_vendors: List[dict] = []


class GeneralPurchaseRFQStatusUpdate(BaseUpdateSchema):
    """Schema for updating RFQ status."""
    
    status: RFQStatus = Field(..., description="New RFQ status")
    approver_comments: Optional[str] = Field(None, max_length=1000, description="Approver comments")
    approved_by: Optional[UUID] = Field(None, description="Approver user ID")
