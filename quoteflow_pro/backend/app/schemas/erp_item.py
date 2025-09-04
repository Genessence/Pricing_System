from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ERPItemBase(BaseModel):
    item_code: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=500)
    specifications: Optional[str] = None
    unit_of_measure: str = Field(..., min_length=1, max_length=20)
    category: Optional[str] = Field(None, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)

class ERPItemCreate(ERPItemBase):
    pass

class ERPItemUpdate(BaseModel):
    item_code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    specifications: Optional[str] = None
    unit_of_measure: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class ERPItemResponse(ERPItemBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ERPItemList(BaseModel):
    id: int
    item_code: str
    description: str
    unit_of_measure: str
    category: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True
