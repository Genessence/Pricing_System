"""
Vendor routes for managing suppliers.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.vendors import vendors_controller
from schemas.vendors import VendorsCreate, VendorsUpdate, VendorsResponse, VendorsListResponse

router = APIRouter()


@router.post("/", response_model=VendorsResponse, status_code=201)
async def create_vendor(vendor_data: VendorsCreate, db: Session = Depends(get_db)):
    """Create a new vendor."""
    return vendors_controller.create_vendor(vendor_data, db)


@router.get("/", response_model=List[VendorsListResponse])
async def get_vendors(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    status: Optional[str] = Query(None, description="Filter by status"),
    commodity_type: Optional[str] = Query(None, description="Filter by commodity type"),
    db: Session = Depends(get_db)
):
    """Get multiple vendors with optional filtering."""
    return vendors_controller.get_vendors(
        skip=skip, limit=limit, is_active=is_active, 
        status=status, commodity_type=commodity_type, db=db
    )


@router.get("/active", response_model=List[VendorsListResponse])
async def get_active_vendors(db: Session = Depends(get_db)):
    """Get all active vendors."""
    return vendors_controller.get_active_vendors(db)


@router.get("/commodity/{commodity_type}", response_model=List[VendorsListResponse])
async def get_vendors_by_commodity_type(commodity_type: str = Path(..., description="Commodity type"), db: Session = Depends(get_db)):
    """Get vendors by commodity type."""
    return vendors_controller.get_vendors_by_commodity_type(commodity_type, db)


@router.get("/search", response_model=List[VendorsListResponse])
async def search_vendors(search_term: str = Query(..., description="Search term for name or code"), db: Session = Depends(get_db)):
    """Search vendors by name or code."""
    return vendors_controller.search_vendors(search_term, db)


@router.get("/{vendor_id}", response_model=VendorsResponse)
async def get_vendor(vendor_id: UUID = Path(..., description="Vendor ID"), db: Session = Depends(get_db)):
    """Get a vendor by ID."""
    return vendors_controller.get_vendor(vendor_id, db)


@router.get("/code/{code}", response_model=VendorsResponse)
async def get_vendor_by_code(code: str = Path(..., description="Vendor code"), db: Session = Depends(get_db)):
    """Get a vendor by code."""
    return vendors_controller.get_vendor_by_code(code, db)


@router.put("/{vendor_id}", response_model=VendorsResponse)
async def update_vendor(
    vendor_data: VendorsUpdate,
    vendor_id: UUID = Path(..., description="Vendor ID"),
    db: Session = Depends(get_db)
):
    """Update a vendor."""
    return vendors_controller.update_vendor(vendor_id, vendor_data, db)


@router.patch("/{vendor_id}/rating", response_model=VendorsResponse)
async def update_vendor_rating(
    vendor_id: UUID = Path(..., description="Vendor ID"),
    rating: int = Query(..., ge=1, le=5, description="Rating between 1 and 5"),
    db: Session = Depends(get_db)
):
    """Update vendor rating."""
    return vendors_controller.update_vendor_rating(vendor_id, rating, db)


@router.delete("/{vendor_id}")
async def delete_vendor(vendor_id: UUID = Path(..., description="Vendor ID"), db: Session = Depends(get_db)):
    """Delete a vendor."""
    return vendors_controller.delete_vendor(vendor_id, db)
