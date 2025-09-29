from pydantic import BaseModel, Field
from typing import Optional


class TransportItemBase(BaseModel):
    from_location: str = Field(..., min_length=1, max_length=200)
    to_location: str = Field(..., min_length=1, max_length=200)
    vehicle_size: str = Field(..., min_length=1, max_length=50)
    load: Optional[str] = Field("", max_length=200)
    dimensions: Optional[str] = Field("", max_length=100)
    frequency: int = Field(default=1, ge=1)


class TransportItemCreate(TransportItemBase):
    """Schema for creating transport item"""

    pass


class TransportItemUpdate(BaseModel):
    from_location: Optional[str] = Field(None, min_length=1, max_length=200)
    to_location: Optional[str] = Field(None, min_length=1, max_length=200)
    vehicle_size: Optional[str] = Field(None, min_length=1, max_length=50)
    load: Optional[str] = Field(None, max_length=200)
    dimensions: Optional[str] = Field(None, max_length=100)
    frequency: Optional[int] = Field(None, ge=1)


class TransportItemResponse(TransportItemBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
