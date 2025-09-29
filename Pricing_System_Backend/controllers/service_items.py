"""
Service Items controller for managing service-related items.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.service_items import ServiceItemsService
from schemas.service_items import ServiceItemsCreate, ServiceItemsUpdate, ServiceItemsResponse, ServiceItemsListResponse
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class ServiceItemsController(BaseController):
    """Controller for managing service items."""
    
    def __init__(self):
        self.service = ServiceItemsService()
        super().__init__(self.service, ServiceItemsResponse)
    
    def create_service_item(
        self, 
        item_data: ServiceItemsCreate, 
        db: Session = Depends(get_db)
    ) -> ServiceItemsResponse:
        """
        Create a new service item.
        
        Args:
            item_data: Service item creation data
            db: Database session
            
        Returns:
            Created service item response
        """
        try:
            item = self.service.create_service_item(db, item_data)
            return ServiceItemsResponse.model_validate(item)
        except Exception as e:
            logger.error(f"Error creating service item: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_service_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> ServiceItemsResponse:
        """
        Get a service item by ID.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Service item response
        """
        try:
            item = self.service.get(db, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Service item not found")
            return ServiceItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting service item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_service_items(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsListResponse]:
        """
        Get multiple service items.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            db: Database session
            
        Returns:
            List of service item responses
        """
        try:
            items = self.service.get_multi(db, skip=skip, limit=limit)
            return [ServiceItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting service items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def search_service_items(
        self, 
        search_term: str = Query(..., description="Search term for description"),
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsListResponse]:
        """
        Search service items by description.
        
        Args:
            search_term: Search term
            db: Database session
            
        Returns:
            List of matching service items
        """
        try:
            items = self.service.search_service_items(db, search_term)
            return [ServiceItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error searching service items: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_service_items_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsListResponse]:
        """
        Get service items associated with an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of service items for the RFQ
        """
        try:
            items = self.service.get_service_items_by_rfq(db, rfq_id)
            return [ServiceItemsListResponse.model_validate(item) for item in items]
        except Exception as e:
            logger.error(f"Error getting service items by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_service_item(
        self, 
        item_id: UUID, 
        item_data: ServiceItemsUpdate, 
        db: Session = Depends(get_db)
    ) -> ServiceItemsResponse:
        """
        Update a service item.
        
        Args:
            item_id: Item ID
            item_data: Item update data
            db: Database session
            
        Returns:
            Updated service item response
        """
        try:
            item = self.service.update_service_item(db, item_id, item_data)
            if not item:
                raise HTTPException(status_code=404, detail="Service item not found")
            return ServiceItemsResponse.model_validate(item)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating service item {item_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_service_item(
        self, 
        item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete a service item.
        
        Args:
            item_id: Item ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, item_id)
            if not success:
                raise HTTPException(status_code=404, detail="Service item not found")
            return {"message": "Service item deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting service item {item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
service_items_controller = ServiceItemsController()
