"""
Indent Items routes for managing pre-filled items.
"""

from fastapi import APIRouter, Query, Path
from typing import List, Optional
from uuid import UUID

from controllers.indent_items import indent_items_controller
from schemas.indent_items import IndentItemsCreate, IndentItemsUpdate, IndentItemsResponse, IndentItemsListResponse

router = APIRouter()


@router.post("/", response_model=IndentItemsResponse, status_code=201)
async def create_indent_item(item_data: IndentItemsCreate):
    """Create a new indent item."""
    return indent_items_controller.create_indent_item(item_data)


@router.get("/", response_model=List[IndentItemsListResponse])
async def get_indent_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status")
):
    """Get multiple indent items with optional filtering."""
    return indent_items_controller.get_indent_items(skip=skip, limit=limit, is_active=is_active)


@router.get("/active", response_model=List[IndentItemsListResponse])
async def get_active_indent_items():
    """Get all active indent items."""
    return indent_items_controller.get_active_indent_items()


@router.get("/search", response_model=List[IndentItemsListResponse])
async def search_indent_items(search_term: str = Query(..., description="Search term for description or code")):
    """Search indent items by description or code."""
    return indent_items_controller.search_indent_items(search_term)


@router.get("/{item_id}", response_model=IndentItemsResponse)
async def get_indent_item(item_id: UUID = Path(..., description="Item ID")):
    """Get an indent item by ID."""
    return indent_items_controller.get_indent_item(item_id)


@router.get("/code/{item_code}", response_model=IndentItemsResponse)
async def get_indent_item_by_code(item_code: str = Path(..., description="Item code")):
    """Get an indent item by code."""
    return indent_items_controller.get_indent_item_by_code(item_code)


@router.put("/{item_id}", response_model=IndentItemsResponse)
async def update_indent_item(
    item_id: UUID = Path(..., description="Item ID"),
    item_data: IndentItemsUpdate = None
):
    """Update an indent item."""
    return indent_items_controller.update_indent_item(item_id, item_data)


@router.patch("/{item_id}/buying-info", response_model=IndentItemsResponse)
async def update_last_buying_info(
    item_id: UUID = Path(..., description="Item ID"),
    price: int = Query(..., ge=0, description="Last buying price"),
    vendor_name: str = Query(..., description="Last vendor name")
):
    """Update last buying price and vendor for an item."""
    return indent_items_controller.update_last_buying_info(item_id, price, vendor_name)


@router.delete("/{item_id}")
async def delete_indent_item(item_id: UUID = Path(..., description="Item ID")):
    """Delete an indent item."""
    return indent_items_controller.delete_indent_item(item_id)
