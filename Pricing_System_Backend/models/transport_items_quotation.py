"""
Transport Items Quotation model for transport item quotations.
"""

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class TransportItemsQuotation(Base):
    """Transport Items Quotation model for transport item quotations."""
    
    __tablename__ = "Transport_Items_Quotation"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("General_Purchase_RFQ.id"))
    transport_items_id = Column(UUID(as_uuid=True), ForeignKey("Transport_Items.id"))
    vendors_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("GeneralPurchaseRFQ", back_populates="transport_quotations")
    transport_item = relationship("TransportItems", back_populates="quotations")
    vendor = relationship("Vendors", back_populates="transport_quotations")
    
    def __repr__(self):
        return f"<TransportItemsQuotation(id={self.id}, rfq_id={self.rfq_id})>"
