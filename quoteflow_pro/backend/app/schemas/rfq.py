from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.rfq import CommodityType, RFQStatus
from app.schemas.user import UserResponse
from app.schemas.site import SiteResponse
from app.schemas.quotation import QuotationResponse


class RFQItemBase(BaseModel):
    item_code: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=500)
    specifications: Optional[str] = None
    unit_of_measure: str = Field(..., min_length=1, max_length=20)
    required_quantity: float = Field(..., gt=0)
    last_buying_price: Optional[float] = Field(None, ge=0)
    last_vendor: Optional[str] = Field(None, max_length=200)


class TransportData(BaseModel):
    from_location: str = Field(..., min_length=1, max_length=200)
    to_location: str = Field(..., min_length=1, max_length=200)
    vehicle_size: str = Field(..., min_length=1, max_length=50)
    load: Optional[str] = Field("", max_length=200)
    dimensions: Optional[str] = Field("", max_length=100)
    frequency: int = Field(default=1, ge=1)


class RFQItemCreate(RFQItemBase):
    erp_item_id: Optional[int] = None
    transport_item_id: Optional[int] = None
    transport_data: Optional[TransportData] = None


class RFQItemResponse(RFQItemBase):
    id: int
    erp_item_id: Optional[int] = None
    transport_item_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RFQBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    commodity_type: CommodityType
    total_value: float = Field(..., gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)

    @validator("currency")
    def validate_currency(cls, v):
        valid_currencies = ["INR", "USD", "EUR", "GBP"]
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v


class QuoteFooter(BaseModel):
    """Schema for quotation footer details"""

    currency: Optional[str] = None
    delivery_lead_time: Optional[str] = None
    packing_charges: Optional[str] = None
    remarks_of_quotation: Optional[str] = None
    transportation_freight: Optional[str] = None
    warranty: Optional[str] = None


class QuoteData(BaseModel):
    """Schema for individual quote data from frontend"""

    id: int = Field(..., description="Frontend-generated quote ID")
    supplierId: int = Field(..., description="Supplier ID")
    rates: Dict[int, float] = Field(..., description="Item rates mapping")
    footer: QuoteFooter = Field(..., description="Quotation footer details")


class RFQCreate(RFQBase):
    site_id: int = Field(..., description="Site ID for GP numbering")
    items: List[RFQItemCreate] = Field(..., min_length=1)
    quotes: Optional[List[QuoteData]] = Field(
        default=[], description="Quotation data from frontend"
    )


class RFQUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    commodity_type: Optional[CommodityType] = None
    total_value: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[RFQStatus] = None


class RFQResponse(RFQBase):
    id: int
    rfq_number: str
    status: RFQStatus
    user_id: int
    site_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[RFQItemResponse] = []
    quotations: List[QuotationResponse] = []
    user: Optional[UserResponse] = None
    site: Optional[SiteResponse] = None

    class Config:
        from_attributes = True


class RFQList(BaseModel):
    id: int
    rfq_number: str
    title: str
    commodity_type: CommodityType
    status: RFQStatus
    total_value: float
    currency: str
    user_id: int
    site_id: int
    created_at: datetime
    user: Optional[UserResponse] = None
    site: Optional[SiteResponse] = None

    class Config:
        from_attributes = True
