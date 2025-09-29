"""
Indent Items controller for managing pre-filled items.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.indent_items import IndentItemsService
from schemas.indent_items import IndentItemsCreate, IndentItemsUpdate, IndentItemsResponse, IndentItemsListResponse
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class IndentItemsController(BaseController):
    """Controller for managing indent items."""
    
    def __init__(self):
        self.service = IndentItemsService()
        super().__init__(self.service, IndentItemsResponse)
    
    def create_indent_item(
        self, 
        item_data: IndentItemsCreate, 
        db: Session = Depends(get_db)
    ) -> IndentItemsResponse:
        """
        Create a new indent item.
        
        Args:
            item_data: Indent item creation data
            db: Database session
            
        Returns:
            Created indent item response
        """
        try:
            item = self.service.create_indent_item(db, item_data)
            return IndentItemsResponse.model_validate(item)
        except Exception as e:
            logger.error(f"Error creating indent item: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_indent_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> IndentItemsResponse:
        """
        Get an indent item by ID.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Indent item response
        """
        try:
            item = self.service.get(db, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Indent item not found")
            return IndentItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting indent item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_indent_item_by_code(
        self, 
        item_code: str, 
        db: Session = Depends(get_db)
    ) -> IndentItemsResponse:
        """
        Get an indent item by code.
        
        Args:
            item_code: Item code
            db: Database session
            
        Returns:
            Indent item response
        """
        try:
            item = self.service.get_indent_item_by_code(db, item_code)
            if not item:
                raise HTTPException(status_code=404, detail="Indent item not found")
            return IndentItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting indent item by code {item_code}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_indent_items(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        is_active: Optional[bool] = Query(None, description="Filter by active status"),
        db: Session = Depends(get_db)
    ) -> List[IndentItemsListResponse]:
        """
        Get multiple indent items with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status
            db: Database session
            
        Returns:
            List of indent item responses
        """
        try:
            filters = {}
            if is_active is not None:
                filters["is_active"] = is_active
            
            items = self.service.get_multi(db, skip=skip, limit=limit, filters=filters)
            return [IndentItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting indent items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_active_indent_items(
        self, 
        db: Session = Depends(get_db)
    ) -> List[IndentItemsListResponse]:
        """
        Get all active indent items.
        
        Args:
            db: Database session
            
        Returns:
            List of active indent items
        """
        try:
            items = self.service.get_active_indent_items(db)
            return [IndentItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting active indent items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def search_indent_items(
        self, 
        search_term: str = Query(..., description="Search term for description or code"),
        db: Session = Depends(get_db)
    ) -> List[IndentItemsListResponse]:
        """
        Search indent items by description or code.
        
        Args:
            search_term: Search term
            db: Database session
            
        Returns:
            List of matching indent items
        """
        try:
            items = self.service.search_indent_items(db, search_term)
            return [IndentItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error searching indent items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_indent_item(
        self, 
        item_id: UUID, 
        item_data: IndentItemsUpdate, 
        db: Session = Depends(get_db)
    ) -> IndentItemsResponse:
        """
        Update an indent item.
        
        Args:
            item_id: Item ID
            item_data: Item update data
            db: Database session
            
        Returns:
            Updated indent item response
        """
        try:
            item = self.service.update_indent_item(db, item_id, item_data)
            if not item:
                raise HTTPException(status_code=404, detail="Indent item not found")
            return IndentItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating indent item {item_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def update_last_buying_info(
        self, 
        item_id: UUID, 
        price: int = Query(..., ge=0, description="Last buying price"),
        vendor_name: str = Query(..., description="Last vendor name"),
        db: Session = Depends(get_db)
    ) -> IndentItemsResponse:
        """
        Update last buying price and vendor for an item.
        
        Args:
            item_id: Item ID
            price: Last buying price
            vendor_name: Last vendor name
            db: Database session
            
        Returns:
            Updated indent item response
        """
        try:
            item = self.service.update_last_buying_info(db, item_id, price, vendor_name)
            if not item:
                raise HTTPException(status_code=404, detail="Indent item not found")
            return IndentItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating last buying info for item {item_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_indent_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete an indent item.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, item_id)
            if not success:
                raise HTTPException(status_code=404, detail="Indent item not found")
            return {"message": "Indent item deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting indent item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
indent_items_controller = IndentItemsController()
