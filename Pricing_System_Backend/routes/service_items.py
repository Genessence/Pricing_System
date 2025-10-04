"""
Service Items routes for managing service-related items.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.service_items import service_items_controller
from schemas.service_items import ServiceItemsCreate, ServiceItemsUpdate, ServiceItemsResponse, ServiceItemsListResponse

router = APIRouter()


@router.post("/", response_model=ServiceItemsResponse, status_code=201)
async def create_service_item(item_data: ServiceItemsCreate, db: Session = Depends(get_db)):
    """Create a new service item."""
    return service_items_controller.create_service_item(item_data, db)


@router.get("/", response_model=List[ServiceItemsListResponse])
async def get_service_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get multiple service items."""
    return service_items_controller.get_service_items(skip=skip, limit=limit, db=db)


@router.get("/search", response_model=List[ServiceItemsListResponse])
async def search_service_items(search_term: str = Query(..., description="Search term for description"), db: Session = Depends(get_db)):
    """Search service items by description."""
    return service_items_controller.search_service_items(search_term, db)


@router.get("/rfq/{rfq_id}", response_model=List[ServiceItemsListResponse])
async def get_service_items_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get service items associated with an RFQ."""
    return service_items_controller.get_service_items_by_rfq(rfq_id, db)


@router.get("/{item_id}", response_model=ServiceItemsResponse)
async def get_service_item(item_id: UUID = Path(..., description="Item ID"), db: Session = Depends(get_db)):
    """Get a service item by ID."""
    return service_items_controller.get_service_item(item_id, db)


@router.put("/{item_id}", response_model=ServiceItemsResponse)
async def update_service_item(
    item_data: ServiceItemsUpdate,
    item_id: UUID = Path(..., description="Item ID"),
    db: Session = Depends(get_db)
):
    """Update a service item."""
    return service_items_controller.update_service_item(item_id, item_data, db)


@router.delete("/{item_id}")
async def delete_service_item(item_id: UUID = Path(..., description="Item ID"), db: Session = Depends(get_db)):
    """Delete a service item."""
    return service_items_controller.delete_service_item(item_id, db)
