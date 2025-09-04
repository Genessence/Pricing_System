from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class QuotationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    quotation_number = Column(String(50), unique=True, index=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    validity_days = Column(Integer, default=30)
    delivery_days = Column(Integer, default=0)
    status = Column(Enum(QuotationStatus), default=QuotationStatus.SUBMITTED)
    terms_conditions = Column(Text)
    comments = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="quotations", lazy="select")
    supplier = relationship("Supplier", back_populates="quotations", lazy="select")
    reviewer = relationship("User", foreign_keys=[reviewed_by], lazy="select")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan", lazy="select")
    attachments = relationship("Attachment", back_populates="quotation", lazy="select")
    
    def __repr__(self):
        return f"<Quotation(id={self.id}, quotation_number='{self.quotation_number}', total_amount={self.total_amount})>"
