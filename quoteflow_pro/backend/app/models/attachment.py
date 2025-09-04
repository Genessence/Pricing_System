from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class AttachmentType(str, enum.Enum):
    RFQ_DOCUMENT = "rfq_document"
    QUOTATION_DOCUMENT = "quotation_document"
    SUPPLIER_DOCUMENT = "supplier_document"
    APPROVAL_DOCUMENT = "approval_document"
    GENERAL = "general"

class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    approval_id = Column(Integer, ForeignKey("approvals.id"), nullable=True)
    attachment_type = Column(Enum(AttachmentType), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    description = Column(Text)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="attachments", lazy="select")
    quotation = relationship("Quotation", back_populates="attachments", lazy="select")
    supplier = relationship("Supplier", back_populates="attachments", lazy="select")
    approval = relationship("Approval", lazy="select")
    uploader = relationship("User", lazy="select")
    
    def __repr__(self):
        return f"<Attachment(id={self.id}, filename='{self.filename}', type='{self.attachment_type}')>"
