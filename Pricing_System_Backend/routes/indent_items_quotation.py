"""
Indent Items Quotation routes for managing indent item quotations.
"""

from fastapi import APIRouter, Query, Path, Depends
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from config.database import get_db
from controllers.indent_items_quotation import indent_items_quotation_controller
from schemas.indent_items_quotation import (
    IndentItemsQuotationCreate, IndentItemsQuotationUpdate, IndentItemsQuotationResponse, 
    IndentItemsQuotationListResponse
)

router = APIRouter()


@router.post("/", response_model=IndentItemsQuotationResponse, status_code=201)
async def create_indent_quotation(quotation_data: IndentItemsQuotationCreate, db: Session = Depends(get_db)):
    """Create a new indent items quotation."""
    return indent_items_quotation_controller.create_indent_quotation(quotation_data, db)


@router.get("/", response_model=List[IndentItemsQuotationListResponse])
async def get_indent_quotations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get multiple indent items quotations."""
    return indent_items_quotation_controller.get_multi(skip=skip, limit=limit, db=db)


@router.get("/rfq/{rfq_id}", response_model=List[IndentItemsQuotationListResponse])
async def get_quotations_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID"), db: Session = Depends(get_db)):
    """Get indent quotations for an RFQ."""
    return indent_items_quotation_controller.get_quotations_by_rfq(rfq_id, db)


@router.get("/vendor/{vendor_id}", response_model=List[IndentItemsQuotationListResponse])
async def get_quotations_by_vendor(vendor_id: UUID = Path(..., description="Vendor ID"), db: Session = Depends(get_db)):
    """Get indent quotations by a vendor."""
    return indent_items_quotation_controller.get_quotations_by_vendor(vendor_id, db)


@router.get("/indent-item/{indent_item_id}", response_model=List[IndentItemsQuotationListResponse])
async def get_quotations_by_indent_item(indent_item_id: UUID = Path(..., description="Indent item ID"), db: Session = Depends(get_db)):
    """Get quotations for a specific indent item."""
    return indent_items_quotation_controller.get_quotations_by_indent_item(indent_item_id, db)


@router.get("/{quotation_id}", response_model=IndentItemsQuotationResponse)
async def get_indent_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Get an indent items quotation by ID."""
    return indent_items_quotation_controller.get(quotation_id, db)


@router.put("/{quotation_id}", response_model=IndentItemsQuotationResponse)
async def update_indent_quotation(
    quotation_data: IndentItemsQuotationUpdate,
    quotation_id: UUID = Path(..., description="Quotation ID"),
    db: Session = Depends(get_db)
):
    """Update an indent items quotation."""
    return indent_items_quotation_controller.update_quotation(quotation_id, quotation_data, db)


@router.delete("/{quotation_id}")
async def delete_indent_quotation(quotation_id: UUID = Path(..., description="Quotation ID"), db: Session = Depends(get_db)):
    """Delete an indent items quotation."""
    return indent_items_quotation_controller.delete(quotation_id, db)
