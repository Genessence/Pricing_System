"""
RFQ Vendors routes for managing vendor associations with RFQs.
"""

from fastapi import APIRouter, Query, Path
from typing import List
from uuid import UUID

from controllers.rfq_vendors import rfq_vendors_controller
from schemas.rfq_vendors import (
    RFQVendorsCreate, RFQVendorsUpdate, RFQVendorsResponse, RFQVendorsListResponse,
    RFQVendorsAddVendor, RFQVendorsRemoveVendor
)

router = APIRouter()


@router.post("/", response_model=RFQVendorsResponse, status_code=201)
async def create_rfq_vendor_association(rfq_vendor_data: RFQVendorsCreate):
    """Create a new RFQ vendor association."""
    return rfq_vendors_controller.create_rfq_vendor_association(rfq_vendor_data)


@router.get("/", response_model=List[RFQVendorsListResponse])
async def get_rfq_vendors(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return")
):
    """Get multiple RFQ vendor associations."""
    return rfq_vendors_controller.get_multi(skip=skip, limit=limit)


@router.get("/rfq/{rfq_id}", response_model=RFQVendorsResponse)
async def get_vendors_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID")):
    """Get vendor associations for an RFQ."""
    return rfq_vendors_controller.get_vendors_by_rfq(rfq_id)


@router.post("/rfq/{rfq_id}/add-vendor", response_model=RFQVendorsResponse)
async def add_vendor_to_rfq(
    vendor_data: RFQVendorsAddVendor,
    rfq_id: UUID = Path(..., description="RFQ ID")
):
    """Add a vendor to an RFQ."""
    return rfq_vendors_controller.add_vendor_to_rfq(rfq_id, vendor_data)


@router.post("/rfq/{rfq_id}/remove-vendor", response_model=RFQVendorsResponse)
async def remove_vendor_from_rfq(
    vendor_data: RFQVendorsRemoveVendor,
    rfq_id: UUID = Path(..., description="RFQ ID")
):
    """Remove a vendor from an RFQ."""
    return rfq_vendors_controller.remove_vendor_from_rfq(rfq_id, vendor_data)


@router.put("/rfq/{rfq_id}", response_model=RFQVendorsResponse)
async def update_rfq_vendors(
    vendors_data: RFQVendorsUpdate,
    rfq_id: UUID = Path(..., description="RFQ ID")
):
    """Update vendor associations for an RFQ."""
    return rfq_vendors_controller.update_rfq_vendors(rfq_id, vendors_data)


@router.delete("/rfq/{rfq_id}")
async def delete_rfq_vendor_association(rfq_id: UUID = Path(..., description="RFQ ID")):
    """Delete RFQ vendor association."""
    return rfq_vendors_controller.delete_rfq_vendor_association(rfq_id)
