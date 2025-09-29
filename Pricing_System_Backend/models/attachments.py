"""
Attachments model for file attachments.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base
from models.enums import AttachmentType


class Attachments(Base):
    """Attachments model for file attachments."""
    
    __tablename__ = "Attachments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("General_Purchase_RFQ.id"))
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))
    attachment_type = Column(Text)
    file_path = Column(String)  # Path to stored file
    file_name = Column(String)  # Original filename
    file_size = Column(String)  # File size in bytes
    mime_type = Column(String)  # MIME type of the file
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("GeneralPurchaseRFQ", back_populates="attachments")
    vendor = relationship("Vendors", back_populates="attachments")
    
    def __repr__(self):
        return f"<Attachments(id={self.id}, file_name={self.file_name}, type={self.attachment_type})>"
