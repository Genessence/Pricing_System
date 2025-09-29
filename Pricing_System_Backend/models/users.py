"""
Users model for system users.
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from config.database import Base
from models.enums import UserRoles


class Users(Base):
    """Users model for system users."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, nullable=False, default=UserRoles.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    site_id = Column(UUID(as_uuid=True), ForeignKey("Sites.id"))
    
    # Relationships
    site = relationship("Sites", back_populates="users")
    created_rfqs = relationship("GeneralPurchaseRFQ", foreign_keys="GeneralPurchaseRFQ.created_by", back_populates="creator")
    approved_rfqs = relationship("GeneralPurchaseRFQ", foreign_keys="GeneralPurchaseRFQ.approved_by", back_populates="approver")
    
    def __repr__(self):
        return f"<Users(id={self.id}, username={self.username}, email={self.email})>"
