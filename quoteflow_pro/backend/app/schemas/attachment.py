from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.attachment import AttachmentType

class AttachmentBase(BaseModel):
    attachment_type: AttachmentType = Field(..., description="Type of attachment")
    filename: str = Field(..., min_length=1, max_length=255, description="File name")
    description: Optional[str] = Field(None, description="File description")

class AttachmentCreate(AttachmentBase):
    """Schema for creating an attachment"""
    rfq_id: Optional[int] = Field(None, description="RFQ ID")
    quotation_id: Optional[int] = Field(None, description="Quotation ID")
    supplier_id: Optional[int] = Field(None, description="Supplier ID")
    approval_id: Optional[int] = Field(None, description="Approval ID")
    file_path: str = Field(..., description="File path")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")
    uploaded_by: int = Field(..., description="User ID who uploaded the file")

class AttachmentUpdate(BaseModel):
    """Schema for updating an attachment"""
    filename: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class AttachmentResponse(AttachmentBase):
    """Schema for attachment response"""
    id: int
    rfq_id: Optional[int] = None
    quotation_id: Optional[int] = None
    supplier_id: Optional[int] = None
    approval_id: Optional[int] = None
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    uploader: Optional[dict] = None
    
    class Config:
        from_attributes = True

class AttachmentList(BaseModel):
    """Schema for attachment list (minimal info)"""
    id: int
    filename: str
    attachment_type: AttachmentType
    file_size: int
    mime_type: str
    created_at: datetime
    uploader: Optional[dict] = None
    
    class Config:
        from_attributes = True
