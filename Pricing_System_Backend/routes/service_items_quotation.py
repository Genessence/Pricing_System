"""
Service Items Quotation routes for managing service item quotations.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.service_items_quotation import service_items_quotation_controller
from schemas.service_items_quotation import (
    ServiceItemsQuotationCreate, ServiceItemsQuotationUpdate, ServiceItemsQuotationResponse, 
    ServiceItemsQuotationListResponse
)

router = APIRouter()


@router.post("/", response_model=ServiceItemsQuotationResponse, status_code=201)
async def create_service_quotation(quotation_data: ServiceItemsQuotationCreate, db: Session = Depends(get_db)):
    """Create a new service items quotation."""
    return service_items_quotation_controller.create_service_quotation(quotation_data, db)


@router.get("/", response_model=List[ServiceItemsQuotationListResponse])
async def get_service_quotations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get multiple service items quotations."""
    return service_items_quotation_controller.get_multi(skip=skip, limit=limit, db=db)


@router.get("/rfq/{rfq_id}", response_model=List[ServiceItemsQuotationListResponse])
async def get_quotations_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get service quotations for an RFQ."""
    return service_items_quotation_controller.get_quotations_by_rfq(rfq_id, db)


@router.get("/vendor/{vendor_id}", response_model=List[ServiceItemsQuotationListResponse])
async def get_quotations_by_vendor(vendor_id: UUID = Path(..., description="Vendor ID"), db: Session = Depends(get_db)):
    """Get service quotations by a vendor."""
    return service_items_quotation_controller.get_quotations_by_vendor(vendor_id, db)


@router.get("/service-item/{service_item_id}", response_model=List[ServiceItemsQuotationListResponse])
async def get_quotations_by_service_item(service_item_id: UUID = Path(..., description="Service item ID"), db: Session = Depends(get_db)):
    """Get quotations for a specific service item."""
    return service_items_quotation_controller.get_quotations_by_service_item(service_item_id, db)


@router.get("/{quotation_id}", response_model=ServiceItemsQuotationResponse)
async def get_service_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Get a service items quotation by ID."""
    return service_items_quotation_controller.get(quotation_id, db)


@router.put("/{quotation_id}", response_model=ServiceItemsQuotationResponse)
async def update_service_quotation(
    quotation_data: ServiceItemsQuotationUpdate,
    quotation_id: UUID = Path(..., description="Quotation ID"),
    db: Session = Depends(get_db)
):
    """Update a service items quotation."""
    return service_items_quotation_controller.update_quotation(quotation_id, quotation_data, db)


@router.delete("/{quotation_id}")
async def delete_service_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Delete a service items quotation."""
    return service_items_quotation_controller.delete(quotation_id, db)
