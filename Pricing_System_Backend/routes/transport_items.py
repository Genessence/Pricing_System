"""
Transport Items routes for managing transportation-related items.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.transport_items import transport_items_controller
from schemas.transport_items import TransportItemsCreate, TransportItemsUpdate, TransportItemsResponse, TransportItemsListResponse

router = APIRouter()


@router.post("/", response_model=TransportItemsResponse, status_code=201)
async def create_transport_item(item_data: TransportItemsCreate, db: Session = Depends(get_db)):
    """Create a new transport item."""
    return transport_items_controller.create_transport_item(item_data, db)


@router.get("/", response_model=List[TransportItemsListResponse])
async def get_transport_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get multiple transport items."""
    return transport_items_controller.get_transport_items(skip=skip, limit=limit, db=db)


@router.get("/search", response_model=List[TransportItemsListResponse])
async def search_transport_items(search_term: str = Query(..., description="Search term for description or route"), db: Session = Depends(get_db)):
    """Search transport items by description or route."""
    return transport_items_controller.search_transport_items(search_term, db)


@router.get("/route", response_model=List[TransportItemsListResponse])
async def get_transport_items_by_route(
    from_location: str = Query(..., description="From location"),
    to_location: str = Query(..., description="To location"),
    db: Session = Depends(get_db)
):
    """Get transport items by route."""
    return transport_items_controller.get_transport_items_by_route(from_location, to_location, db)


@router.get("/rfq/{rfq_id}", response_model=List[TransportItemsListResponse])
async def get_transport_items_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get transport items associated with an RFQ."""
    return transport_items_controller.get_transport_items_by_rfq(rfq_id, db)


@router.get("/{item_id}", response_model=TransportItemsResponse)
async def get_transport_item(item_id: UUID = Path(..., description="Item ID"), db: Session = Depends(get_db)):
    """Get a transport item by ID."""
    return transport_items_controller.get_transport_item(item_id, db)


@router.put("/{item_id}", response_model=TransportItemsResponse)
async def update_transport_item(
    item_data: TransportItemsUpdate,
    item_id: UUID = Path(..., description="Item ID"),
    db: Session = Depends(get_db)
):
    """Update a transport item."""
    return transport_items_controller.update_transport_item(item_id, item_data, db)


@router.delete("/{item_id}")
async def delete_transport_item(item_id: UUID = Path(..., description="Item ID"), db: Session = Depends(get_db)):
    """Delete a transport item."""
    return transport_items_controller.delete_transport_item(item_id, db)
