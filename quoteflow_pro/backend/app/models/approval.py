from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ApprovalType(str, enum.Enum):
    RFQ_APPROVAL = "rfq_approval"
    QUOTATION_APPROVAL = "quotation_approval"
    SUPPLIER_APPROVAL = "supplier_approval"

class Approval(Base):
    __tablename__ = "approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    approval_type = Column(Enum(ApprovalType), nullable=False)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comments = Column(Text)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="approvals", lazy="select")
    quotation = relationship("Quotation", lazy="select")
    supplier = relationship("Supplier", lazy="select")
    approver = relationship("User", back_populates="approvals", lazy="select")
    
    def __repr__(self):
        return f"<Approval(id={self.id}, type='{self.approval_type}', status='{self.status}')>"
