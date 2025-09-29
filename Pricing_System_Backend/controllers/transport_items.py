"""
Transport Items controller for managing transportation-related items.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.transport_items import TransportItemsService
from schemas.transport_items import TransportItemsCreate, TransportItemsUpdate, TransportItemsResponse, TransportItemsListResponse
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class TransportItemsController(BaseController):
    """Controller for managing transport items."""
    
    def __init__(self):
        self.service = TransportItemsService()
        super().__init__(self.service, TransportItemsResponse)
    
    def create_transport_item(
        self, 
        item_data: TransportItemsCreate, 
        db: Session = Depends(get_db)
    ) -> TransportItemsResponse:
        """
        Create a new transport item.
        
        Args:
            item_data: Transport item creation data
            db: Database session
            
        Returns:
            Created transport item response
        """
        try:
            item = self.service.create_transport_item(db, item_data)
            return TransportItemsResponse.model_validate(item)
        except Exception as e:
            logger.error(f"Error creating transport item: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_transport_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> TransportItemsResponse:
        """
        Get a transport item by ID.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Transport item response
        """
        try:
            item = self.service.get(db, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Transport item not found")
            return TransportItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting transport item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_transport_items(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        db: Session = Depends(get_db)
    ) -> List[TransportItemsListResponse]:
        """
        Get multiple transport items.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            db: Database session
            
        Returns:
            List of transport item responses
        """
        try:
            items = self.service.get_multi(db, skip=skip, limit=limit)
            return [TransportItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting transport items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def search_transport_items(
        self, 
        search_term: str = Query(..., description="Search term for description or route"),
        db: Session = Depends(get_db)
    ) -> List[TransportItemsListResponse]:
        """
        Search transport items by description or route.
        
        Args:
            search_term: Search term
            db: Database session
            
        Returns:
            List of matching transport items
        """
        try:
            items = self.service.search_transport_items(db, search_term)
            return [TransportItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error searching transport items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_transport_items_by_route(
        self, 
        from_location: str = Query(..., description="From location"),
        to_location: str = Query(..., description="To location"),
        db: Session = Depends(get_db)
    ) -> List[TransportItemsListResponse]:
        """
        Get transport items by route.
        
        Args:
            from_location: From location
            to_location: To location
            db: Database session
            
        Returns:
            List of transport items for the route
        """
        try:
            items = self.service.get_transport_items_by_route(db, from_location, to_location)
            return [TransportItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting transport items by route: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_transport_items_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[TransportItemsListResponse]:
        """
        Get transport items associated with an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of transport items for the RFQ
        """
        try:
            items = self.service.get_transport_items_by_rfq(db, rfq_id)
            return [TransportItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting transport items by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_transport_item(
        self, 
        item_id: UUID, 
        item_data: TransportItemsUpdate, 
        db: Session = Depends(get_db)
    ) -> TransportItemsResponse:
        """
        Update a transport item.
        
        Args:
            item_id: Item ID
            item_data: Item update data
            db: Database session
            
        Returns:
            Updated transport item response
        """
        try:
            item = self.service.update_transport_item(db, item_id, item_data)
            if not item:
                raise HTTPException(status_code=404, detail="Transport item not found")
            return TransportItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating transport item {item_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_transport_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete a transport item.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, item_id)
            if not success:
                raise HTTPException(status_code=404, detail="Transport item not found")
            return {"message": "Transport item deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting transport item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
transport_items_controller = TransportItemsController()
