"""
Vendors model for supplier management.
"""

from sqlalchemy import Column, String, Boolean, BigInteger, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base
from models.enums import SupplierStatus


class Vendors(Base):
    """Vendors model for supplier information."""
    
    __tablename__ = "vendors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    providing_commodity_type = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String)
    phone = Column(BigInteger)
    address = Column(String)
    state = Column(String)
    country = Column(String)
    postal_code = Column(BigInteger)
    tax_id = Column(String)
    gst_number = Column(String)
    status = Column(String, nullable=False, default=SupplierStatus.ACTIVE)
    rating = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    service_quotations = relationship("ServiceItemsQuotation", back_populates="vendor")
    transport_quotations = relationship("TransportItemsQuotation", back_populates="vendor")
    indent_quotations = relationship("IndentItemsQuotation", back_populates="vendor")
    attachments = relationship("Attachments", back_populates="vendor")
    rfq_vendors = relationship("RFQVendors", back_populates="vendors")
    
    def __repr__(self):
        return f"<Vendors(id={self.id}, name={self.name}, code={self.code})>"
