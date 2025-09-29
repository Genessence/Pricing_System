"""
Service Items Quotation model for service item quotations.
"""

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class ServiceItemsQuotation(Base):
    """Service Items Quotation model for service item quotations."""
    
    __tablename__ = "Service_Items_Quotation"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("General_Purchase_RFQ.id"))
    service_items_id = Column(UUID(as_uuid=True), ForeignKey("Service_Items.id"))
    vendors_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("GeneralPurchaseRFQ", back_populates="service_quotations")
    service_item = relationship("ServiceItems", back_populates="quotations")
    vendor = relationship("Vendors", back_populates="service_quotations")
    
    def __repr__(self):
        return f"<ServiceItemsQuotation(id={self.id}, rfq_id={self.rfq_id})>"
