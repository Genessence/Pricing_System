from sqlalchemy import Column, Integer, String, Text, Enum, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class CommodityType(str, enum.Enum):
    PROVIDED_DATA = "provided_data"
    SERVICE = "service"
    TRANSPORT = "transport"

class RFQStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_number = Column(String(20), unique=True, index=True, nullable=False)  # GP-A001-001, GP-A002-001, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text)
    commodity_type = Column(Enum(CommodityType), nullable=False)
    status = Column(Enum(RFQStatus), default=RFQStatus.DRAFT)
    total_value = Column(Float, default=0.0)
    currency = Column(String(3), default="INR")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="rfqs", lazy="select")
    site = relationship("Site", back_populates="rfqs", lazy="select")
    items = relationship("RFQItem", back_populates="rfq", cascade="all, delete-orphan", lazy="select")
    quotations = relationship("Quotation", back_populates="rfq", cascade="all, delete-orphan", lazy="select")
    approvals = relationship("Approval", back_populates="rfq", cascade="all, delete-orphan", lazy="select")
    attachments = relationship("Attachment", back_populates="rfq", cascade="all, delete-orphan", lazy="select")
    
    def __repr__(self):
        return f"<RFQ(id={self.id}, title='{self.title}', status='{self.status}')>"
