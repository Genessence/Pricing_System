from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.models.user import User
from app.models.supplier import SupplierCategory, SupplierStatus
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse, SupplierList
from app.services.supplier_service import SupplierService

router = APIRouter()

@router.get("/", response_model=List[SupplierList])
async def get_suppliers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    category: Optional[SupplierCategory] = Query(None, description="Filter by supplier category"),
    status: Optional[SupplierStatus] = Query(None, description="Filter by supplier status"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get suppliers with filtering and pagination.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        category: Filter by supplier category
        status: Filter by supplier status
        is_active: Filter by active status
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of suppliers matching criteria
    """
    return SupplierService.get_suppliers(db, skip, limit, category, status, is_active)

@router.get("/search", response_model=List[SupplierList])
async def search_suppliers(
    q: str = Query(..., description="Search query for company name, contact person, or email"),
    category: Optional[SupplierCategory] = Query(None, description="Filter by supplier category"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search suppliers by name, contact person, or email.
    
    Args:
        q: Search query
        category: Filter by supplier category
        limit: Maximum number of results
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of matching suppliers
    """
    return SupplierService.search_suppliers(db, q, category, limit)

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get specific supplier by ID.
    
    Args:
        supplier_id: Supplier ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Supplier details
        
    Raises:
        HTTPException: If supplier not found
    """
    supplier = SupplierService.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier

@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new supplier.
    
    Args:
        supplier_data: Supplier creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created supplier details
        
    Raises:
        HTTPException: If supplier email already exists or validation fails
    """
    return SupplierService.create_supplier(db, supplier_data, int(current_user.id))  # type: ignore

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update supplier.
    
    Args:
        supplier_id: Supplier ID
        supplier_data: Supplier update data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated supplier details
        
    Raises:
        HTTPException: If supplier not found or validation fails
    """
    return SupplierService.update_supplier(db, supplier_id, supplier_data, current_user)

@router.delete("/{supplier_id}")
async def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Delete supplier (Admin only).
    
    Args:
        supplier_id: Supplier ID
        db: Database session
        current_user: Admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If supplier not found or has associated quotations
    """
    SupplierService.delete_supplier(db, supplier_id, current_user)
    return {"message": "Supplier deleted successfully"}

@router.post("/{supplier_id}/approve", response_model=SupplierResponse)
async def approve_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Approve supplier (Admin only).
    
    Args:
        supplier_id: Supplier ID
        db: Database session
        current_user: Admin user
        
    Returns:
        Approved supplier details
        
    Raises:
        HTTPException: If supplier not found or not pending approval
    """
    return SupplierService.approve_supplier(db, supplier_id, current_user)

@router.post("/{supplier_id}/reject", response_model=SupplierResponse)
async def reject_supplier(
    supplier_id: int,
    reason: str = Query(None, description="Rejection reason"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Reject supplier (Admin only).
    
    Args:
        supplier_id: Supplier ID
        reason: Rejection reason
        db: Database session
        current_user: Admin user
        
    Returns:
        Rejected supplier details
        
    Raises:
        HTTPException: If supplier not found or not pending approval
    """
    return SupplierService.reject_supplier(db, supplier_id, current_user, reason)
