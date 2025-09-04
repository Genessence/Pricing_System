from sqlalchemy import Column, Integer, String, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
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
    title = Column(String(200), nullable=False)
    description = Column(Text)
    commodity_type = Column(Enum(CommodityType), nullable=False)
    status = Column(Enum(RFQStatus), default=RFQStatus.DRAFT)
    total_value = Column(Float, default=0.0)
    currency = Column(String(3), default="INR")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships - commented out to avoid circular imports
    # user = relationship("User", back_populates="rfqs", lazy="select")
    # items = relationship("RFQItem", back_populates="rfq", cascade="all, delete-orphan", lazy="select")
    
    def __repr__(self):
        return f"<RFQ(id={self.id}, title='{self.title}', status='{self.status}')>"
