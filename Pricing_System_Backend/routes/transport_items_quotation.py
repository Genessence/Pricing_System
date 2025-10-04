"""
Transport Items Quotation routes for managing transport item quotations.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.transport_items_quotation import transport_items_quotation_controller
from schemas.transport_items_quotation import (
    TransportItemsQuotationCreate, TransportItemsQuotationUpdate, TransportItemsQuotationResponse, 
    TransportItemsQuotationListResponse
)

router = APIRouter()


@router.post("/", response_model=TransportItemsQuotationResponse, status_code=201)
async def create_transport_quotation(quotation_data: TransportItemsQuotationCreate, db: Session = Depends(get_db)):
    """Create a new transport items quotation."""
    return transport_items_quotation_controller.create_transport_quotation(quotation_data, db)


@router.get("/", response_model=List[TransportItemsQuotationListResponse])
async def get_transport_quotations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get multiple transport items quotations."""
    return transport_items_quotation_controller.get_multi(skip=skip, limit=limit, db=db)


@router.get("/rfq/{rfq_id}", response_model=List[TransportItemsQuotationListResponse])
async def get_quotations_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get transport quotations for an RFQ."""
    return transport_items_quotation_controller.get_quotations_by_rfq(rfq_id, db)


@router.get("/vendor/{vendor_id}", response_model=List[TransportItemsQuotationListResponse])
async def get_quotations_by_vendor(vendor_id: UUID = Path(..., description="Vendor ID"), db: Session = Depends(get_db)):
    """Get transport quotations by a vendor."""
    return transport_items_quotation_controller.get_quotations_by_vendor(vendor_id, db)


@router.get("/transport-item/{transport_item_id}", response_model=List[TransportItemsQuotationListResponse])
async def get_quotations_by_transport_item(transport_item_id: UUID = Path(..., description="Transport item ID"), db: Session = Depends(get_db)):
    """Get quotations for a specific transport item."""
    return transport_items_quotation_controller.get_quotations_by_transport_item(transport_item_id, db)


@router.get("/{quotation_id}", response_model=TransportItemsQuotationResponse)
async def get_transport_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Get a transport items quotation by ID."""
    return transport_items_quotation_controller.get(quotation_id, db)


@router.put("/{quotation_id}", response_model=TransportItemsQuotationResponse)
async def update_transport_quotation(
    quotation_data: TransportItemsQuotationUpdate,
    quotation_id: UUID = Path(..., description="Quotation ID"),
    db: Session = Depends(get_db)
):
    """Update a transport items quotation."""
    return transport_items_quotation_controller.update_quotation(quotation_id, quotation_data, db)


@router.delete("/{quotation_id}")
async def delete_transport_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Delete a transport items quotation."""
    return transport_items_quotation_controller.delete(quotation_id, db)
