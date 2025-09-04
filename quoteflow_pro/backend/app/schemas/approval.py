from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.approval import ApprovalStatus, ApprovalType

class ApprovalBase(BaseModel):
    approval_type: ApprovalType = Field(..., description="Type of approval")
    comments: Optional[str] = Field(None, description="Approval comments")

class ApprovalCreate(ApprovalBase):
    """Schema for creating an approval request"""
    rfq_id: Optional[int] = Field(None, description="RFQ ID (for RFQ approvals)")
    quotation_id: Optional[int] = Field(None, description="Quotation ID (for quotation approvals)")
    supplier_id: Optional[int] = Field(None, description="Supplier ID (for supplier approvals)")
    approver_id: int = Field(..., description="Approver user ID")

class ApprovalUpdate(BaseModel):
    """Schema for updating an approval"""
    status: Optional[ApprovalStatus] = None
    comments: Optional[str] = None

class ApprovalResponse(ApprovalBase):
    """Schema for approval response"""
    id: int
    rfq_id: Optional[int] = None
    quotation_id: Optional[int] = None
    supplier_id: Optional[int] = None
    status: ApprovalStatus
    approver_id: int
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    approver: Optional[dict] = None
    rfq: Optional[dict] = None
    quotation: Optional[dict] = None
    supplier: Optional[dict] = None
    
    class Config:
        from_attributes = True

class ApprovalList(BaseModel):
    """Schema for approval list (minimal info)"""
    id: int
    approval_type: ApprovalType
    status: ApprovalStatus
    approver_id: int
    created_at: datetime
    approved_at: Optional[datetime] = None
    approver: Optional[dict] = None
    
    class Config:
        from_attributes = True
