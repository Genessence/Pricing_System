"""
RFQ Vendors model for managing vendor associations with RFQs.
"""

from sqlalchemy import Column, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class RFQVendors(Base):
    """RFQ Vendors model for managing vendor associations with RFQs."""
    
    __tablename__ = "RFQ_Vendors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("General_Purchase_RFQ.id"))
    vendors_ids = Column(ARRAY(UUID(as_uuid=True)))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("GeneralPurchaseRFQ", back_populates="rfq_vendors")
    # vendors = relationship("Vendors", back_populates="rfq_vendors")  # Disabled due to array-based relationship
    
    def __repr__(self):
        return f"<RFQVendors(id={self.id}, rfq_id={self.rfq_id})>"
