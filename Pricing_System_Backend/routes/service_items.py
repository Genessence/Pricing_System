"""
Service Items routes for managing service-related items.
"""

from fastapi import APIRouter, Query, Path
from typing import List
from uuid import UUID

from controllers.service_items import service_items_controller
from schemas.service_items import ServiceItemsCreate, ServiceItemsUpdate, ServiceItemsResponse, ServiceItemsListResponse

router = APIRouter()


@router.post("/", response_model=ServiceItemsResponse, status_code=201)
async def create_service_item(item_data: ServiceItemsCreate):
    """Create a new service item."""
    return service_items_controller.create_service_item(item_data)


@router.get("/", response_model=List[ServiceItemsListResponse])
async def get_service_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return")
):
    """Get multiple service items."""
    return service_items_controller.get_service_items(skip=skip, limit=limit)


@router.get("/search", response_model=List[ServiceItemsListResponse])
async def search_service_items(search_term: str = Query(..., description="Search term for description")):
    """Search service items by description."""
    return service_items_controller.search_service_items(search_term)


@router.get("/rfq/{rfq_id}", response_model=List[ServiceItemsListResponse])
async def get_service_items_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID")):
    """Get service items associated with an RFQ."""
    return service_items_controller.get_service_items_by_rfq(rfq_id)


@router.get("/{item_id}", response_model=ServiceItemsResponse)
async def get_service_item(item_id: UUID = Path(..., description="Item ID")):
    """Get a service item by ID."""
    return service_items_controller.get_service_item(item_id)


@router.put("/{item_id}", response_model=ServiceItemsResponse)
async def update_service_item(
    item_data: ServiceItemsUpdate,
    item_id: UUID = Path(..., description="Item ID")
):
    """Update a service item."""
    return service_items_controller.update_service_item(item_id, item_data)


@router.delete("/{item_id}")
async def delete_service_item(item_id: UUID = Path(..., description="Item ID")):
    """Delete a service item."""
    return service_items_controller.delete_service_item(item_id)
