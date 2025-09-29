"""
Indent Items Quotation model for indent item quotations.
"""

from sqlalchemy import Column, DateTime, ForeignKey, BigInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class IndentItemsQuotation(Base):
    """Indent Items Quotation model for indent item quotations."""
    
    __tablename__ = "Indent_Items_Quotation"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("General_Purchase_RFQ.id"))
    indent_items_id = Column(UUID(as_uuid=True), ForeignKey("Indent_Items.id"))
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))
    transportation_freight = Column(BigInteger, nullable=True)
    packaging_charges = Column(BigInteger, nullable=True)
    delivery_lead_time = Column(String, nullable=True)
    warranty = Column(String, nullable=True)
    currency = Column(String(3), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("GeneralPurchaseRFQ", back_populates="indent_quotations")
    indent_item = relationship("IndentItems", back_populates="quotations")
    vendor = relationship("Vendors", back_populates="indent_quotations")
    
    def __repr__(self):
        return f"<IndentItemsQuotation(id={self.id}, rfq_id={self.rfq_id})>"
