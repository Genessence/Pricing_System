"""
Pydantic schemas for Attachments model.
"""

from pydantic import Field
from typing import Optional
from uuid import UUID
from datetime import datetime

from schemas.base import BaseResponseSchema, BaseCreateSchema, BaseUpdateSchema
from models.enums import AttachmentType


class AttachmentsBase(BaseCreateSchema):
    """Base schema for Attachments."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    vendor_id: Optional[UUID] = Field(None, description="Vendor ID")
    attachment_type: Optional[AttachmentType] = Field(None, description="Attachment type")
    file_name: Optional[str] = Field(None, max_length=255, description="Original filename")
    file_size: Optional[str] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = Field(None, max_length=100, description="MIME type")


class AttachmentsCreate(AttachmentsBase):
    """Schema for creating a new attachment."""
    pass


class AttachmentsUpdate(BaseUpdateSchema):
    """Schema for updating an attachment."""
    
    rfq_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None
    attachment_type: Optional[AttachmentType] = None
    file_name: Optional[str] = Field(None, max_length=255)
    file_size: Optional[str] = None
    mime_type: Optional[str] = Field(None, max_length=100)


class AttachmentsResponse(AttachmentsBase, BaseResponseSchema):
    """Schema for attachment response."""
    
    file_path: Optional[str] = Field(None, description="File path")


class AttachmentsListResponse(BaseResponseSchema):
    """Schema for attachment list response."""
    
    rfq_id: UUID
    vendor_id: Optional[UUID] = None
    attachment_type: Optional[AttachmentType] = None
    file_name: Optional[str] = None
    file_size: Optional[str] = None
    mime_type: Optional[str] = None


class AttachmentsWithRelations(AttachmentsResponse):
    """Schema for attachment with related data."""
    
    rfq: Optional[dict] = None
    vendor: Optional[dict] = None


class AttachmentsUpload(BaseCreateSchema):
    """Schema for file upload."""
    
    rfq_id: UUID = Field(..., description="RFQ ID")
    vendor_id: Optional[UUID] = Field(None, description="Vendor ID")
    attachment_type: Optional[AttachmentType] = Field(None, description="Attachment type")
