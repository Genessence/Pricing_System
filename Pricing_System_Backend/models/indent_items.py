"""
Indent Items model for pre-filled item information.
"""

from sqlalchemy import Column, String, Boolean, BigInteger, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class IndentItems(Base):
    """Indent Items model with pre-filled information."""
    
    __tablename__ = "Indent_Items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_code = Column("itemCode", String(50), primary_key=True, nullable=False)
    description = Column(String(500), nullable=False)
    specification = Column(String, nullable=False)
    uom = Column("UOM", String(20), nullable=False)
    is_active = Column("isActive", Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    quantity = Column(BigInteger)
    last_buying_price = Column(BigInteger)
    last_vendor_name = Column(String)
    
    # Relationships
    quotations = relationship("IndentItemsQuotation", back_populates="indent_item")
    
    def __repr__(self):
        return f"<IndentItems(id={self.id}, item_code={self.item_code}, description={self.description})>"
