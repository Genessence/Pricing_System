"""
Sites model for managing company locations.
"""

from sqlalchemy import Column, String, Boolean, BigInteger, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base


class Sites(Base):
    """Sites model for company locations."""
    
    __tablename__ = "Sites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    last_rfq_sitewise_id = Column(BigInteger, nullable=False, default=0)
    contact_name = Column(String)
    contact_email = Column(String)
    contact_number = Column(BigInteger)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("Users", back_populates="site")
    rfqs = relationship("GeneralPurchaseRFQ", back_populates="site")
    
    def __repr__(self):
        return f"<Sites(id={self.id}, code={self.code}, name={self.name})>"
