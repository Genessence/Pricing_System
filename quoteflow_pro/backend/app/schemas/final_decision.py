from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FinalDecisionItemBase(BaseModel):
    rfq_item_id: int
    selected_supplier_id: Optional[int] = None
    selected_quotation_id: Optional[int] = None
    final_unit_price: float
    final_total_price: float
    supplier_code: Optional[str] = None
    supplier_name: Optional[str] = None
    decision_notes: Optional[str] = None

class FinalDecisionItemCreate(FinalDecisionItemBase):
    pass

class FinalDecisionItemResponse(FinalDecisionItemBase):
    id: int
    final_decision_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FinalDecisionBase(BaseModel):
    rfq_id: int
    status: str = "pending"
    total_approved_amount: float = 0.0
    currency: str = "INR"
    approval_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

class FinalDecisionCreate(FinalDecisionBase):
    items: List[FinalDecisionItemCreate] = []

class FinalDecisionUpdate(BaseModel):
    status: Optional[str] = None
    total_approved_amount: Optional[float] = None
    approval_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

class FinalDecisionResponse(FinalDecisionBase):
    id: int
    approved_by: int
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[FinalDecisionItemResponse] = []
    
    class Config:
        from_attributes = True

class FinalDecisionWithDetails(FinalDecisionResponse):
    approver_name: Optional[str] = None
    rfq_number: Optional[str] = None
    rfq_title: Optional[str] = None
