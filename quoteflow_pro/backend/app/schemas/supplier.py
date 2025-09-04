from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.supplier import SupplierStatus, SupplierCategory

class SupplierBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200, description="Company name")
    contact_person: str = Field(..., min_length=1, max_length=100, description="Contact person name")
    email: str = Field(..., min_length=1, max_length=200, description="Email address")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    address: Optional[str] = Field(None, description="Address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State")
    country: str = Field(default="India", max_length=100, description="Country")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID")
    gst_number: Optional[str] = Field(None, max_length=50, description="GST number")
    category: SupplierCategory = Field(default=SupplierCategory.GENERAL, description="Supplier category")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    @validator('email')
    def validate_email(cls, v):
        """Validate email format"""
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('gst_number')
    def validate_gst(cls, v):
        """Validate GST number format if provided"""
        if v and len(v) != 15:
            raise ValueError('GST number must be 15 characters long')
        return v.upper() if v else v

class SupplierCreate(SupplierBase):
    """Schema for creating a new supplier"""
    pass

class SupplierUpdate(BaseModel):
    """Schema for updating a supplier"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    tax_id: Optional[str] = Field(None, max_length=50)
    gst_number: Optional[str] = Field(None, max_length=50)
    category: Optional[SupplierCategory] = None
    status: Optional[SupplierStatus] = None
    rating: Optional[int] = Field(None, ge=0, le=5)
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('email')
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower() if v else v
    
    @validator('gst_number')
    def validate_gst(cls, v):
        """Validate GST number format if provided"""
        if v and len(v) != 15:
            raise ValueError('GST number must be 15 characters long')
        return v.upper() if v else v

class SupplierResponse(SupplierBase):
    """Schema for supplier response"""
    id: int
    status: SupplierStatus
    rating: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SupplierList(BaseModel):
    """Schema for supplier list (minimal info)"""
    id: int
    company_name: str
    contact_person: str
    email: str
    category: SupplierCategory
    status: SupplierStatus
    rating: int
    is_active: bool
    
    class Config:
        from_attributes = True
