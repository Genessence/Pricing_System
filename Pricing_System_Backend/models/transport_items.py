"""
Transport Items model for transportation-related items.
"""

from sqlalchemy import Column, String, BigInteger, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class TransportItems(Base):
    """Transport Items model for transportation-related items."""
    
    __tablename__ = "Transport_Items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_location = Column("from", String, nullable=False)
    to_location = Column("to", String, nullable=False)
    vehicle_size = Column(String, nullable=False)
    load = Column(BigInteger, nullable=False)
    frequency = Column(BigInteger, nullable=False)
    dimensions = Column(String, nullable=False)
    suggestions = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quotations = relationship("TransportItemsQuotation", back_populates="transport_item")
    
    def __repr__(self):
        return f"<TransportItems(id={self.id}, from={self.from_location}, to={self.to_location})>"
