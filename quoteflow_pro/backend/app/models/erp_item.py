from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class ERPItem(Base):
    __tablename__ = "erp_items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=False)
    specifications = Column(Text)
    unit_of_measure = Column(String(20), nullable=False)
    category = Column(String(100))
    subcategory = Column(String(100))
    is_active = Column(Boolean, default=True)
    
    # Relationships - commented out to avoid circular imports
    # rfq_items = relationship("RFQItem", back_populates="erp_item", lazy="dynamic")
    
    def __repr__(self):
        return f"<ERPItem(id={self.id}, item_code='{self.item_code}', description='{self.description}')>"
