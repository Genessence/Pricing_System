from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.models.user import User
from app.models.quotation import QuotationStatus
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse, QuotationList
from app.services.quotation_service import QuotationService

router = APIRouter()

@router.get("/", response_model=List[QuotationList])
async def get_quotations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    rfq_id: Optional[int] = Query(None, description="Filter by RFQ ID"),
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    status: Optional[QuotationStatus] = Query(None, description="Filter by quotation status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get quotations with filtering and pagination.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        rfq_id: Filter by RFQ ID
        supplier_id: Filter by supplier ID
        status: Filter by quotation status
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of quotations matching criteria
    """
    return QuotationService.get_quotations(db, current_user, skip, limit, rfq_id, supplier_id, status)

@router.get("/{quotation_id}", response_model=QuotationResponse)
async def get_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get specific quotation by ID.
    
    Args:
        quotation_id: Quotation ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Quotation details
        
    Raises:
        HTTPException: If quotation not found
    """
    quotation = QuotationService.get_quotation(db, quotation_id, current_user)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation not found"
        )
    return quotation

@router.post("/", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
async def create_quotation(
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new quotation.
    
    Args:
        quotation_data: Quotation creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created quotation details
        
    Raises:
        HTTPException: If RFQ/supplier not found or supplier already quoted
    """
    return QuotationService.create_quotation(db, quotation_data, current_user.id)

@router.put("/{quotation_id}", response_model=QuotationResponse)
async def update_quotation(
    quotation_id: int,
    quotation_data: QuotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update quotation.
    
    Args:
        quotation_id: Quotation ID
        quotation_data: Quotation update data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated quotation details
        
    Raises:
        HTTPException: If quotation not found or cannot be updated
    """
    return QuotationService.update_quotation(db, quotation_id, quotation_data, current_user)

@router.post("/{quotation_id}/approve", response_model=QuotationResponse)
async def approve_quotation(
    quotation_id: int,
    comments: str = Query(None, description="Approval comments"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Approve quotation (Admin only).
    
    Args:
        quotation_id: Quotation ID
        comments: Approval comments
        db: Database session
        current_user: Admin user
        
    Returns:
        Approved quotation details
        
    Raises:
        HTTPException: If quotation not found or not submitted
    """
    return QuotationService.approve_quotation(db, quotation_id, current_user.id, comments)

@router.post("/{quotation_id}/reject", response_model=QuotationResponse)
async def reject_quotation(
    quotation_id: int,
    comments: str = Query(None, description="Rejection comments"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Reject quotation (Admin only).
    
    Args:
        quotation_id: Quotation ID
        comments: Rejection comments
        db: Database session
        current_user: Admin user
        
    Returns:
        Rejected quotation details
        
    Raises:
        HTTPException: If quotation not found or not submitted
    """
    return QuotationService.reject_quotation(db, quotation_id, current_user.id, comments)

@router.get("/rfq/{rfq_id}/compare")
async def compare_quotations(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Compare quotations for a specific RFQ.
    
    Args:
        rfq_id: RFQ ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Quotation comparison data
        
    Raises:
        HTTPException: If RFQ not found
    """
    return QuotationService.compare_quotations(db, rfq_id)
