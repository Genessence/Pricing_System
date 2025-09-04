from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    site_code = Column(String(10), unique=True, index=True, nullable=False)  # A001, A002, etc.
    site_name = Column(String(200), nullable=False)
    location = Column(String(500))
    address = Column(String(1000))
    contact_person = Column(String(200))
    contact_email = Column(String(200))
    contact_phone = Column(String(50))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    rfqs = relationship("RFQ", back_populates="site", lazy="select")
    
    def __repr__(self):
        return f"<Site(id={self.id}, site_code='{self.site_code}', site_name='{self.site_name}')>"
