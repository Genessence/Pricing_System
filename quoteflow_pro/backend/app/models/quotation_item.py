from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class QuotationItem(Base):
    __tablename__ = "quotation_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    rfq_item_id = Column(Integer, ForeignKey("rfq_items.id"), nullable=False)
    item_code = Column(String(50), nullable=False)
    description = Column(String(500), nullable=False)
    specifications = Column(Text)
    unit_of_measure = Column(String(20), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    delivery_days = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    quotation = relationship("Quotation", back_populates="items", lazy="select")
    rfq_item = relationship("RFQItem", lazy="select")
    
    def __repr__(self):
        return f"<QuotationItem(id={self.id}, item_code='{self.item_code}', unit_price={self.unit_price})>"
