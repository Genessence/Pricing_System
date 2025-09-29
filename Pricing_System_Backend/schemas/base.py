"""
Base Pydantic schemas for common patterns.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True
    )


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class IDMixin(BaseModel):
    """Mixin for ID field."""
    
    id: UUID


class BaseResponseSchema(BaseSchema, IDMixin, TimestampMixin):
    """Base response schema with ID and timestamps."""
    pass


class BaseCreateSchema(BaseSchema):
    """Base create schema without ID and timestamps."""
    pass


class BaseUpdateSchema(BaseSchema):
    """Base update schema with optional fields."""
    pass


class PaginationSchema(BaseModel):
    """Pagination metadata schema."""
    
    page: int = 1
    limit: int = 10
    total: int = 0
    pages: int = 0
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponseSchema(BaseModel):
    """Paginated response schema."""
    
    items: list
    pagination: PaginationSchema
