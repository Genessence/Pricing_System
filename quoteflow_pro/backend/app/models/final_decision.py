from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class FinalDecision(Base):
    __tablename__ = "final_decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")
    total_approved_amount = Column(Float, default=0.0)
    currency = Column(String(3), default="INR")
    approval_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="final_decisions", lazy="select")
    approver = relationship("User", lazy="select")
    items = relationship("FinalDecisionItem", back_populates="final_decision", cascade="all, delete-orphan", lazy="select")
    
    def __repr__(self):
        return f"<FinalDecision(id={self.id}, rfq_id={self.rfq_id}, status='{self.status}')>"
