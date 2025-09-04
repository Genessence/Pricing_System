from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models.erp_item import ERPItem
from app.models.user import User
from app.schemas.erp_item import ERPItemCreate, ERPItemUpdate
from fastapi import HTTPException, status

class ERPItemService:
    @staticmethod
    def search_items(
        db: Session, 
        query: str, 
        category: Optional[str] = None, 
        limit: int = 20
    ) -> List[ERPItem]:
        """Search ERP items by code or description"""
        search_query = db.query(ERPItem).filter(
            and_(
                ERPItem.is_active == True,
                or_(
                    ERPItem.item_code.ilike(f"%{query}%"),
                    ERPItem.description.ilike(f"%{query}%")
                )
            )
        )
        
        if category:
            search_query = search_query.filter(ERPItem.category == category)
        
        return search_query.limit(limit).all()
    
    @staticmethod
    def get_items(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        is_active: bool = True
    ) -> List[ERPItem]:
        """Get ERP items with filtering and pagination"""
        query = db.query(ERPItem)
        
        if category:
            query = query.filter(ERPItem.category == category)
        
        if is_active is not None:
            query = query.filter(ERPItem.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[ERPItem]:
        """Get specific ERP item by ID"""
        return db.query(ERPItem).filter(ERPItem.id == item_id).first()
    
    @staticmethod
    def create_item(db: Session, item_data: ERPItemCreate, user_id: int) -> ERPItem:
        """Create new ERP item with validation"""
        # Check if item code already exists
        existing_item = db.query(ERPItem).filter(
            ERPItem.item_code == item_data.item_code
        ).first()
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item code already exists"
            )
        
        # Create new item
        db_item = ERPItem(
            item_code=item_data.item_code,
            description=item_data.description,
            specifications=item_data.specifications,
            unit_of_measure=item_data.unit_of_measure,
            category=item_data.category,
            subcategory=item_data.subcategory,
            is_active=True
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_item(
        db: Session,
        item_id: int,
        item_data: ERPItemUpdate,
        current_user: User
    ) -> ERPItem:
        """Update ERP item with validation"""
        item = ERPItemService.get_item(db, item_id)
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ERP item not found"
            )
        
        # Check if item code is being changed and if it already exists
        if item_data.item_code and item_data.item_code != item.item_code:
            existing_item = db.query(ERPItem).filter(
                and_(
                    ERPItem.item_code == item_data.item_code,
                    ERPItem.id != item_id
                )
            ).first()
            
            if existing_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item code already exists"
                )
        
        # Update fields
        for field, value in item_data.dict(exclude_unset=True).items():
            setattr(item, field, value)
        
        db.commit()
        db.refresh(item)
        return item
    
    @staticmethod
    def delete_item(db: Session, item_id: int, current_user: User) -> bool:
        """Soft delete ERP item (Admin only)"""
        item = ERPItemService.get_item(db, item_id)
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ERP item not found"
            )
        
        # Soft delete by setting is_active to False
        item.is_active = False
        db.commit()
        return True
