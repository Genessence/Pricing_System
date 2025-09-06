from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from app.models.quotation import QuotationStatus
from app.schemas.supplier import SupplierResponse

class QuotationItemBase(BaseModel):
    rfq_item_id: int = Field(..., description="RFQ item ID")
    item_code: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=500)
    specifications: Optional[str] = None
    unit_of_measure: str = Field(..., min_length=1, max_length=20)
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    total_price: float = Field(..., gt=0)
    delivery_days: int = Field(default=0, ge=0)
    notes: Optional[str] = None
    
    @validator('total_price')
    def validate_total_price(cls, v, values):
        """Validate total price matches quantity * unit_price"""
        if 'quantity' in values and 'unit_price' in values:
            expected_total = values['quantity'] * values['unit_price']
            if abs(v - expected_total) > 0.01:  # Allow small floating point differences
                raise ValueError('Total price must equal quantity * unit_price')
        return v

class QuotationItemCreate(QuotationItemBase):
    """Schema for creating quotation item"""
    pass

class QuotationItemResponse(QuotationItemBase):
    """Schema for quotation item response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class QuotationBase(BaseModel):
    total_amount: float = Field(..., gt=0, description="Total quotation amount")
    currency: str = Field(default="INR", min_length=3, max_length=3, description="Currency code")
    validity_days: int = Field(default=30, ge=1, le=365, description="Validity period in days")
    delivery_days: int = Field(default=0, ge=0, description="Delivery period in days")
    transportation_freight: Optional[float] = Field(default=0.0, ge=0, description="Transportation/Freight charges")
    packing_charges: Optional[float] = Field(default=0.0, ge=0, description="Packing charges")
    delivery_lead_time: Optional[int] = Field(default=0, ge=0, description="Delivery lead time in days")
    warranty: Optional[str] = Field(None, max_length=100, description="Warranty information")
    terms_conditions: Optional[str] = Field(None, description="Terms and conditions")
    comments: Optional[str] = Field(None, description="Additional comments")
    
    @validator('currency')
    def validate_currency(cls, v):
        """Validate currency code"""
        valid_currencies = ['INR', 'USD', 'EUR', 'GBP']
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

class QuotationCreate(QuotationBase):
    """Schema for creating a quotation"""
    rfq_id: int = Field(..., description="RFQ ID")
    supplier_id: int = Field(..., description="Supplier ID")
    items: List[QuotationItemCreate] = Field(..., min_length=1, description="Quotation items")
    
    @validator('items')
    def validate_items_total(cls, v, values):
        """Validate that items total matches quotation total"""
        if 'total_amount' in values:
            items_total = sum(item.total_price for item in v)
            if abs(items_total - values['total_amount']) > 0.01:
                raise ValueError('Items total must match quotation total amount')
        return v

class QuotationUpdate(BaseModel):
    """Schema for updating a quotation"""
    total_amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    validity_days: Optional[int] = Field(None, ge=1, le=365)
    delivery_days: Optional[int] = Field(None, ge=0)
    transportation_freight: Optional[float] = Field(None, ge=0)
    packing_charges: Optional[float] = Field(None, ge=0)
    delivery_lead_time: Optional[int] = Field(None, ge=0)
    warranty: Optional[str] = Field(None, max_length=100)
    status: Optional[QuotationStatus] = None
    terms_conditions: Optional[str] = None
    comments: Optional[str] = None
    
    @validator('currency')
    def validate_currency(cls, v):
        """Validate currency code if provided"""
        if v:
            valid_currencies = ['INR', 'USD', 'EUR', 'GBP']
            if v not in valid_currencies:
                raise ValueError(f'Currency must be one of: {", ".join(valid_currencies)}')
        return v

class QuotationResponse(QuotationBase):
    """Schema for quotation response"""
    id: int
    rfq_id: int
    supplier_id: int
    quotation_number: str
    status: QuotationStatus
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[QuotationItemResponse] = []
    supplier: Optional[SupplierResponse] = None
    
    class Config:
        from_attributes = True

class QuotationList(BaseModel):
    """Schema for quotation list (minimal info)"""
    id: int
    quotation_number: str
    rfq_id: int
    supplier_id: int
    total_amount: float
    currency: str
    status: QuotationStatus
    submitted_at: datetime
    supplier: Optional[dict] = None
    rfq: Optional[dict] = None
    
    class Config:
        from_attributes = True
