from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class SupplierStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_APPROVAL = "pending_approval"

class SupplierCategory(str, enum.Enum):
    PROVIDED_DATA = "provided_data"
    SERVICE = "service"
    TRANSPORT = "transport"
    GENERAL = "general"

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    vendor_code = Column(String, nullable=False, index=True)
    company_name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(100), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="India")
    postal_code = Column(String(20))
    tax_id = Column(String(50))
    gst_number = Column(String(50))
    category = Column(Enum(SupplierCategory), default=SupplierCategory.GENERAL)
    status = Column(Enum(SupplierStatus), default=SupplierStatus.PENDING_APPROVAL)
    rating = Column(Integer, default=0)  # 0-5 rating
    notes = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    quotations = relationship("Quotation", back_populates="supplier", lazy="select")
    attachments = relationship("Attachment", back_populates="supplier", lazy="select")
    
    def __repr__(self):
        return f"<Supplier(id={self.id}, company_name='{self.company_name}', status='{self.status}')>"
