"""
Indent Items service for managing pre-filled items.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.indent_items import IndentItems
from schemas.indent_items import IndentItemsCreate, IndentItemsUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class IndentItemsService(BaseService[IndentItems]):
    """Service for managing indent items."""
    
    def __init__(self):
        super().__init__(IndentItems)
    
    def create_indent_item(self, db: Session, item_data: IndentItemsCreate) -> IndentItems:
        """
        Create a new indent item.
        
        Args:
            db: Database session
            item_data: Indent item creation data
            
        Returns:
            Created indent item instance
        """
        try:
            # Check if item code already exists
            existing_item = db.query(IndentItems).filter(IndentItems.item_code == item_data.item_code).first()
            if existing_item:
                raise ValidationError("Item code already exists", context={"item_code": item_data.item_code})
            
            item_dict = item_data.model_dump()
            return self.create(db, item_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating indent item: {str(e)}")
            raise DatabaseError("Failed to create indent item", context={"error": str(e)})
    
    def get_indent_item_by_code(self, db: Session, item_code: str) -> Optional[IndentItems]:
        """
        Get indent item by code.
        
        Args:
            db: Database session
            item_code: Item code
            
        Returns:
            Indent item instance or None if not found
        """
        try:
            return db.query(IndentItems).filter(IndentItems.item_code == item_code).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting indent item by code {item_code}: {str(e)}")
            raise DatabaseError("Failed to get indent item by code", context={"item_code": item_code, "error": str(e)})
    
    def update_indent_item(self, db: Session, item_id: UUID, item_data: IndentItemsUpdate) -> Optional[IndentItems]:
        """
        Update an indent item.
        
        Args:
            db: Database session
            item_id: Item ID
            item_data: Item update data
            
        Returns:
            Updated indent item instance
        """
        try:
            # Check if code is being updated and if it conflicts
            if item_data.item_code:
                existing_item = db.query(IndentItems).filter(
                    IndentItems.item_code == item_data.item_code,
                    IndentItems.id != item_id
                ).first()
                if existing_item:
                    raise ValidationError("Item code already exists", context={"item_code": item_data.item_code})
            
            update_data = item_data.model_dump(exclude_unset=True)
            return self.update(db, item_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating indent item {item_id}: {str(e)}")
            raise DatabaseError("Failed to update indent item", context={"id": str(item_id), "error": str(e)})
    
    def get_active_indent_items(self, db: Session) -> List[IndentItems]:
        """
        Get all active indent items.
        
        Args:
            db: Database session
            
        Returns:
            List of active indent items
        """
        try:
            return db.query(IndentItems).filter(IndentItems.is_active == True).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting active indent items: {str(e)}")
            raise DatabaseError("Failed to get active indent items", context={"error": str(e)})
    
    def search_indent_items(self, db: Session, search_term: str) -> List[IndentItems]:
        """
        Search indent items by description or code.
        
        Args:
            db: Database session
            search_term: Search term
            
        Returns:
            List of matching indent items
        """
        try:
            return db.query(IndentItems).filter(
                (IndentItems.description.ilike(f"%{search_term}%")) |
                (IndentItems.item_code.ilike(f"%{search_term}%"))
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error searching indent items with term {search_term}: {str(e)}")
            raise DatabaseError("Failed to search indent items", context={"search_term": search_term, "error": str(e)})
    
    def update_last_buying_info(self, db: Session, item_id: UUID, price: int, vendor_name: str) -> Optional[IndentItems]:
        """
        Update last buying price and vendor for an item.
        
        Args:
            db: Database session
            item_id: Item ID
            price: Last buying price
            vendor_name: Last vendor name
            
        Returns:
            Updated indent item instance
        """
        try:
            update_data = {
                "last_buying_price": price,
                "last_vendor_name": vendor_name
            }
            return self.update(db, item_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating last buying info for item {item_id}: {str(e)}")
            raise DatabaseError("Failed to update last buying info", context={"id": str(item_id), "error": str(e)})
