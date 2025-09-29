"""
Service Items model for service-related items.
"""

from sqlalchemy import Column, String, BigInteger, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class ServiceItems(Base):
    """Service Items model for service-related items."""
    
    __tablename__ = "Service_Items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(String)
    specification = Column(String)
    uom = Column("UOM", String)
    quantity = Column(BigInteger)
    rate = Column(BigInteger)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quotations = relationship("ServiceItemsQuotation", back_populates="service_item")
    
    def __repr__(self):
        return f"<ServiceItems(id={self.id}, description={self.description})>"
