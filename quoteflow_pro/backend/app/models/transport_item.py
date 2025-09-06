from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base


class TransportItem(Base):
    __tablename__ = "transport_items"

    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String(200), nullable=False)
    to_location = Column(String(200), nullable=False)
    vehicle_size = Column(String(50), nullable=False)
    load = Column(String(200), nullable=True)
    dimensions = Column(String(100), nullable=True)
    frequency = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=True)

    # Relationships
    rfq_items = relationship("RFQItem", back_populates="transport_item")
