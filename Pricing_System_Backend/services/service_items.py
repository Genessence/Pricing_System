"""
Service Items service for managing service-related items.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.service_items import ServiceItems
from schemas.service_items import ServiceItemsCreate, ServiceItemsUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class ServiceItemsService(BaseService[ServiceItems]):
    """Service for managing service items."""
    
    def __init__(self):
        super().__init__(ServiceItems)
    
    def create_service_item(self, db: Session, item_data: ServiceItemsCreate) -> ServiceItems:
        """
        Create a new service item.
        
        Args:
            db: Database session
            item_data: Service item creation data
            
        Returns:
            Created service item instance
        """
        try:
            item_dict = item_data.model_dump()
            return self.create(db, item_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating service item: {str(e)}")
            raise DatabaseError("Failed to create service item", context={"error": str(e)})
    
    def update_service_item(self, db: Session, item_id: UUID, item_data: ServiceItemsUpdate) -> Optional[ServiceItems]:
        """
        Update a service item.
        
        Args:
            db: Database session
            item_id: Item ID
            item_data: Item update data
            
        Returns:
            Updated service item instance
        """
        try:
            update_data = item_data.model_dump(exclude_unset=True)
            return self.update(db, item_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating service item {item_id}: {str(e)}")
            raise DatabaseError("Failed to update service item", context={"id": str(item_id), "error": str(e)})
    
    def search_service_items(self, db: Session, search_term: str) -> List[ServiceItems]:
        """
        Search service items by description.
        
        Args:
            db: Database session
            search_term: Search term
            
        Returns:
            List of matching service items
        """
        try:
            return db.query(ServiceItems).filter(
                ServiceItems.description.ilike(f"%{search_term}%")
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error searching service items with term {search_term}: {str(e)}")
            raise DatabaseError("Failed to search service items", context={"search_term": search_term, "error": str(e)})
    
    def get_service_items_by_rfq(self, db: Session, rfq_id: UUID) -> List[ServiceItems]:
        """
        Get service items associated with an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of service items for the RFQ
        """
        try:
            from models.service_items_quotation import ServiceItemsQuotation
            return db.query(ServiceItems).join(ServiceItemsQuotation).filter(
                ServiceItemsQuotation.rfq_id == rfq_id
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting service items by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get service items by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
