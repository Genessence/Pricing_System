"""
General Purchase RFQ model for main RFQ records.
"""

from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base
from models.enums import CommodityTypes, RFQStatus


class GeneralPurchaseRFQ(Base):
    """General Purchase RFQ model for main RFQ records."""
    
    __tablename__ = "General_Purchase_RFQ"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_number = Column(String(20), nullable=False, unique=True)
    title = Column(String(200), nullable=False)
    description = Column(String)
    commodity_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default=RFQStatus.DRAFT)
    total_value = Column(BigInteger)
    currency = Column(String)
    apd_number = Column(String)
    creator_comments = Column(String)
    approver_comments = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    sitewise_id = Column(BigInteger)
    site_code = Column(String, ForeignKey("Sites.code"))
    
    # Relationships
    creator = relationship("Users", foreign_keys=[created_by], back_populates="created_rfqs")
    approver = relationship("Users", foreign_keys=[approved_by], back_populates="approved_rfqs")
    site = relationship("Sites", back_populates="rfqs")
    
    # Quotation relationships
    service_quotations = relationship("ServiceItemsQuotation", back_populates="rfq")
    transport_quotations = relationship("TransportItemsQuotation", back_populates="rfq")
    indent_quotations = relationship("IndentItemsQuotation", back_populates="rfq")
    
    # Other relationships
    attachments = relationship("Attachments", back_populates="rfq")
    rfq_vendors = relationship("RFQVendors", back_populates="rfq")
    
    def __repr__(self):
        return f"<GeneralPurchaseRFQ(id={self.id}, rfq_number={self.rfq_number}, title={self.title})>"
