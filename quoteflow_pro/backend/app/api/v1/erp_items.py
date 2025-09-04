from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.schemas.erp_item import ERPItemCreate, ERPItemUpdate, ERPItemResponse, ERPItemList
from app.models.erp_item import ERPItem
from app.models.user import User
from app.core.exceptions import ValidationError, ResourceNotFound
from sqlalchemy import and_, or_

router = APIRouter()

@router.get("/search", response_model=List[ERPItemResponse])
async def search_erp_items(
    q: str = Query(..., description="Search query for item code or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search ERP items by code or description."""
    search_query = db.query(ERPItem).filter(
        and_(
            ERPItem.is_active == True,
            or_(
                ERPItem.item_code.ilike(f"%{q}%"),
                ERPItem.description.ilike(f"%{q}%")
            )
        )
    )
    
    if category:
        search_query = search_query.filter(ERPItem.category == category)
    
    items = search_query.limit(limit).all()
    return items

@router.get("/", response_model=List[ERPItemList])
async def get_erp_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get ERP items with filtering and pagination."""
    query = db.query(ERPItem)
    
    if category:
        query = query.filter(ERPItem.category == category)
    
    if is_active is not None:
        query = query.filter(ERPItem.is_active == is_active)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=ERPItemResponse)
async def get_erp_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific ERP item by ID."""
    item = db.query(ERPItem).filter(ERPItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ERP item not found")
    return item

@router.post("/", response_model=ERPItemResponse)
async def create_erp_item(
    item_data: ERPItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new ERP item."""
    # Check if item code already exists
    existing_item = db.query(ERPItem).filter(
        ERPItem.item_code == item_data.item_code
    ).first()
    
    if existing_item:
        raise ValidationError("Item code already exists")
    
    # Create new item
    db_item = ERPItem(**item_data.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.put("/{item_id}", response_model=ERPItemResponse)
async def update_erp_item(
    item_id: int,
    item_data: ERPItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update ERP item."""
    item = db.query(ERPItem).filter(ERPItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="ERP item not found")
    
    # Check if item code is being changed and if it already exists
    if item_data.item_code and item_data.item_code != item.item_code:
        existing_item = db.query(ERPItem).filter(
            and_(
                ERPItem.item_code == item_data.item_code,
                ERPItem.id != item_id
            )
        ).first()
        
        if existing_item:
            raise ValidationError("Item code already exists")
    
    # Update fields
    for field, value in item_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return item

@router.delete("/{item_id}")
async def delete_erp_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Delete ERP item (Admin only)."""
    item = db.query(ERPItem).filter(ERPItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="ERP item not found")
    
    # Soft delete by setting is_active to False
    item.is_active = False
    db.commit()
    
    return {"message": "ERP item deleted successfully"}
