"""
RFQ routes for managing Request for Quotations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.general_purchase_rfq import general_purchase_rfq_controller
from schemas.general_purchase_rfq import (
    GeneralPurchaseRFQCreate, GeneralPurchaseRFQUpdate, GeneralPurchaseRFQResponse,
    GeneralPurchaseRFQListResponse, GeneralPurchaseRFQStatusUpdate
)

router = APIRouter()


@router.post("/", response_model=GeneralPurchaseRFQResponse, status_code=201)
async def create_rfq(
    rfq_data: GeneralPurchaseRFQCreate,
    creator_id: UUID = Query(..., description="ID of the user creating the RFQ"),
    db: Session = Depends(get_db)
):
    """Create a new RFQ."""
    return general_purchase_rfq_controller.create_rfq(rfq_data, creator_id, db)


@router.get("/", response_model=List[GeneralPurchaseRFQListResponse])
async def get_rfqs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[str] = Query(None, description="Filter by status"),
    commodity_type: Optional[str] = Query(None, description="Filter by commodity type"),
    site_code: Optional[str] = Query(None, description="Filter by site code"),
    created_by: Optional[UUID] = Query(None, description="Filter by creator"),
    db: Session = Depends(get_db)
):
    """Get multiple RFQs with optional filtering."""
    return general_purchase_rfq_controller.get_rfqs(
        skip=skip, limit=limit, status=status, 
        commodity_type=commodity_type, site_code=site_code, created_by=created_by, db=db
    )


@router.get("/{rfq_id}", response_model=GeneralPurchaseRFQResponse)
async def get_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get an RFQ by ID."""
    return general_purchase_rfq_controller.get_rfq(rfq_id, db)


@router.get("/number/{rfq_number}", response_model=GeneralPurchaseRFQResponse)
async def get_rfq_by_number(rfq_number: str = Path(..., description="RFQ number"), db: Session = Depends(get_db)):
    """Get an RFQ by number."""
    return general_purchase_rfq_controller.get_rfq_by_number(rfq_number, db)


@router.get("/status/{status}", response_model=List[GeneralPurchaseRFQListResponse])
async def get_rfqs_by_status(status: str = Path(..., description="RFQ status"), db: Session = Depends(get_db)):
    """Get RFQs by status."""
    return general_purchase_rfq_controller.get_rfqs_by_status(status, db)


@router.get("/creator/{creator_id}", response_model=List[GeneralPurchaseRFQListResponse])
async def get_rfqs_by_creator(creator_id: UUID = Path(..., description="Creator user ID"), db: Session = Depends(get_db)):
    """Get RFQs created by a user."""
    return general_purchase_rfq_controller.get_rfqs_by_creator(creator_id, db)


@router.get("/site/{site_code}", response_model=List[GeneralPurchaseRFQListResponse])
async def get_rfqs_by_site(site_code: str = Path(..., description="Site code"), db: Session = Depends(get_db)):
    """Get RFQs for a specific site."""
    return general_purchase_rfq_controller.get_rfqs_by_site(site_code, db)


@router.put("/{rfq_id}", response_model=GeneralPurchaseRFQResponse)
async def update_rfq(
    rfq_data: GeneralPurchaseRFQUpdate,
    rfq_id: UUID = Path(..., description="RFQ ID"),
    db: Session = Depends(get_db)
):
    """Update an RFQ."""
    return general_purchase_rfq_controller.update_rfq(rfq_id, rfq_data, db)


@router.patch("/{rfq_id}/status", response_model=GeneralPurchaseRFQResponse)
async def update_rfq_status(
    status_data: GeneralPurchaseRFQStatusUpdate,
    rfq_id: UUID = Path(..., description="RFQ ID"),
    approver_id: UUID = Query(..., description="ID of the user approving the RFQ"),
    db: Session = Depends(get_db)
):
    """Update RFQ status."""
    return general_purchase_rfq_controller.update_rfq_status(rfq_id, status_data, approver_id, db)


@router.delete("/{rfq_id}")
async def delete_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Delete an RFQ."""
    return general_purchase_rfq_controller.delete_rfq(rfq_id, db)
