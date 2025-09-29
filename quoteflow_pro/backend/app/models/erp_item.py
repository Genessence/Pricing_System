from sqlalchemy import Column, Integer, String, Text, Boolean, Float
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

    # ✅ New fields
    last_buying_price = Column(Float, default=0.0)
    last_vendor = Column(String(200), nullable=True)

    # Relationships
    rfq_items = relationship("RFQItem", back_populates="erp_item", lazy="select")

    def __repr__(self):
        return f"<ERPItem(id={self.id}, item_code='{self.item_code}', description='{self.description}')>"
