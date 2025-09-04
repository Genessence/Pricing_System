from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class RFQItem(Base):
    __tablename__ = "rfq_items"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    erp_item_id = Column(Integer, ForeignKey("erp_items.id"), nullable=True)
    item_code = Column(String(50), nullable=False)
    description = Column(String(500), nullable=False)
    specifications = Column(Text)
    unit_of_measure = Column(String(20), nullable=False)
    required_quantity = Column(Float, nullable=False)
    last_buying_price = Column(Float, default=0.0)
    last_vendor = Column(String(200))
    
    # Relationships - commented out to avoid circular imports
    # rfq = relationship("RFQ", back_populates="items", lazy="select")
    # erp_item = relationship("ERPItem", back_populates="rfq_items", lazy="select")
    
    def __repr__(self):
        return f"<RFQItem(id={self.id}, item_code='{self.item_code}', quantity={self.required_quantity})>"
