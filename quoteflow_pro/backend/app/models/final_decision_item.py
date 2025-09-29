from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class FinalDecisionItem(Base):
    __tablename__ = "final_decision_items"
    
    id = Column(Integer, primary_key=True, index=True)
    final_decision_id = Column(Integer, ForeignKey("final_decisions.id"), nullable=False)
    rfq_item_id = Column(Integer, ForeignKey("rfq_items.id"), nullable=False)
    selected_supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    selected_quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=True)
    final_unit_price = Column(Float, nullable=False)
    final_total_price = Column(Float, nullable=False)
    supplier_code = Column(String(50), nullable=True)
    supplier_name = Column(String(200), nullable=True)
    decision_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    final_decision = relationship("FinalDecision", back_populates="items", lazy="select")
    rfq_item = relationship("RFQItem", lazy="select")
    selected_supplier = relationship("Supplier", lazy="select")
    selected_quotation = relationship("Quotation", lazy="select")
    
    def __repr__(self):
        return f"<FinalDecisionItem(id={self.id}, rfq_item_id={self.rfq_item_id}, final_unit_price={self.final_unit_price})>"
