from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class SiteBase(BaseModel):
    site_code: str = Field(..., min_length=4, max_length=10, description="Site code (e.g., A001, A002)")
    site_name: str = Field(..., min_length=1, max_length=200, description="Site name")
    location: Optional[str] = Field(None, max_length=500, description="Site location")
    address: Optional[str] = Field(None, max_length=1000, description="Site address")
    contact_person: Optional[str] = Field(None, max_length=200, description="Contact person name")
    contact_email: Optional[str] = Field(None, max_length=200, description="Contact email")
    contact_phone: Optional[str] = Field(None, max_length=50, description="Contact phone")
    
    @validator('site_code')
    def validate_site_code(cls, v):
        """Validate site code format (A001, A002, etc.)"""
        if not v.startswith('A'):
            raise ValueError('Site code must start with "A"')
        if not v[1:].isdigit() or len(v[1:]) != 3:
            raise ValueError('Site code must be in format A001, A002, etc.')
        return v.upper()
    
    @validator('contact_email')
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower() if v else v

class SiteCreate(SiteBase):
    """Schema for creating a new site"""
    pass

class SiteUpdate(BaseModel):
    """Schema for updating a site"""
    site_code: Optional[str] = Field(None, min_length=4, max_length=10)
    site_name: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, max_length=500)
    address: Optional[str] = Field(None, max_length=1000)
    contact_person: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[str] = Field(None, max_length=200)
    contact_phone: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    
    @validator('site_code')
    def validate_site_code(cls, v):
        """Validate site code format (A001, A002, etc.)"""
        if v and not v.startswith('A'):
            raise ValueError('Site code must start with "A"')
        if v and (not v[1:].isdigit() or len(v[1:]) != 3):
            raise ValueError('Site code must be in format A001, A002, etc.')
        return v.upper() if v else v
    
    @validator('contact_email')
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower() if v else v

class SiteResponse(SiteBase):
    """Schema for site response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SiteList(BaseModel):
    """Schema for site list (minimal info)"""
    id: int
    site_code: str
    site_name: str
    location: Optional[str] = None
    is_active: bool
    
    class Config:
        orm_mode = True
