from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.schemas.rfq import RFQCreate, RFQUpdate, RFQResponse, RFQList, RFQItemCreate
from app.models.rfq import RFQ, RFQStatus
from app.models.rfq_item import RFQItem
from app.models.erp_item import ERPItem
from app.models.user import User, UserRole
from app.core.exceptions import PermissionDenied, ResourceNotFound, ValidationError
from sqlalchemy import and_

router = APIRouter()

@router.post("/", response_model=RFQResponse)
async def create_rfq(
    rfq_data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new RFQ."""
    # Validate business rules
    if rfq_data.total_value <= 0:
        raise ValidationError("Total value must be greater than 0")
    
    # Create RFQ
    db_rfq = RFQ(
        title=rfq_data.title,
        description=rfq_data.description,
        commodity_type=rfq_data.commodity_type,
        total_value=rfq_data.total_value,
        currency=rfq_data.currency,
        user_id=current_user.id,
        status=RFQStatus.DRAFT
    )
    
    db.add(db_rfq)
    db.flush()  # Get the RFQ ID
    
    # Create RFQ items
    for item_data in rfq_data.items:
        # If ERP item ID is provided, get the ERP item details
        if item_data.erp_item_id:
            erp_item = db.query(ERPItem).filter(ERPItem.id == item_data.erp_item_id).first()
            if erp_item:
                # Use ERP item details
                db_item = RFQItem(
                    rfq_id=db_rfq.id,
                    erp_item_id=item_data.erp_item_id,
                    item_code=erp_item.item_code,
                    description=erp_item.description,
                    specifications=erp_item.specifications,
                    unit_of_measure=erp_item.unit_of_measure,
                    required_quantity=item_data.required_quantity,
                    last_buying_price=item_data.last_buying_price,
                    last_vendor=item_data.last_vendor
                )
            else:
                raise ValidationError(f"ERP item with ID {item_data.erp_item_id} not found")
        else:
            # Use provided item details
            db_item = RFQItem(
                rfq_id=db_rfq.id,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                required_quantity=item_data.required_quantity,
                last_buying_price=item_data.last_buying_price,
                last_vendor=item_data.last_vendor
            )
        
        db.add(db_item)
    
    db.commit()
    db.refresh(db_rfq)
    
    return db_rfq

@router.get("/", response_model=List[RFQList])
async def get_rfqs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    commodity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get RFQs with filtering and pagination."""
    query = db.query(RFQ)
    
    # Apply role-based filtering
    if current_user.role == UserRole.USER:
        query = query.filter(RFQ.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(RFQ.status == status)
    if commodity_type:
        query = query.filter(RFQ.commodity_type == commodity_type)
    
    rfqs = query.offset(skip).limit(limit).all()
    return rfqs

@router.get("/{rfq_id}", response_model=RFQResponse)
async def get_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific RFQ by ID."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        rfq.user_id != current_user.id):
        raise PermissionDenied("Access denied to this RFQ")
    
    return rfq

@router.put("/{rfq_id}", response_model=RFQResponse)
async def update_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        rfq.user_id != current_user.id):
        raise PermissionDenied("Access denied to this RFQ")
    
    # Check if RFQ can be updated
    if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
        raise ValidationError("Cannot update approved/rejected RFQ")
    
    # Update fields
    for field, value in rfq_data.dict(exclude_unset=True).items():
        setattr(rfq, field, value)
    
    db.commit()
    db.refresh(rfq)
    
    return rfq

@router.delete("/{rfq_id}")
async def delete_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        rfq.user_id != current_user.id):
        raise PermissionDenied("Access denied to this RFQ")
    
    # Check if RFQ can be deleted
    if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
        raise ValidationError("Cannot delete approved/rejected RFQ")
    
    db.delete(rfq)
    db.commit()
    
    return {"message": "RFQ deleted successfully"}

@router.post("/{rfq_id}/approve")
async def approve_rfq(
    rfq_id: int,
    comments: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Approve RFQ (Admin only)."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if rfq.status != RFQStatus.PENDING:
        raise ValidationError("Only pending RFQs can be approved")
    
    # Update status
    rfq.status = RFQStatus.APPROVED
    
    db.commit()
    db.refresh(rfq)
    
    return {"message": "RFQ approved successfully", "rfq": rfq}
