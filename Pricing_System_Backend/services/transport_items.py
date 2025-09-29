"""
Transport Items service for managing transportation-related items.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.transport_items import TransportItems
from schemas.transport_items import TransportItemsCreate, TransportItemsUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class TransportItemsService(BaseService[TransportItems]):
    """Service for managing transport items."""
    
    def __init__(self):
        super().__init__(TransportItems)
    
    def create_transport_item(self, db: Session, item_data: TransportItemsCreate) -> TransportItems:
        """
        Create a new transport item.
        
        Args:
            db: Database session
            item_data: Transport item creation data
            
        Returns:
            Created transport item instance
        """
        try:
            item_dict = item_data.model_dump()
            return self.create(db, item_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating transport item: {str(e)}")
            raise DatabaseError("Failed to create transport item", context={"error": str(e)})
    
    def update_transport_item(self, db: Session, item_id: UUID, item_data: TransportItemsUpdate) -> Optional[TransportItems]:
        """
        Update a transport item.
        
        Args:
            db: Database session
            item_id: Item ID
            item_data: Item update data
            
        Returns:
            Updated transport item instance
        """
        try:
            update_data = item_data.model_dump(exclude_unset=True)
            return self.update(db, item_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating transport item {item_id}: {str(e)}")
            raise DatabaseError("Failed to update transport item", context={"id": str(item_id), "error": str(e)})
    
    def search_transport_items(self, db: Session, search_term: str) -> List[TransportItems]:
        """
        Search transport items by description or route.
        
        Args:
            db: Database session
            search_term: Search term
            
        Returns:
            List of matching transport items
        """
        try:
            return db.query(TransportItems).filter(
                (TransportItems.from_location.ilike(f"%{search_term}%")) |
                (TransportItems.to_location.ilike(f"%{search_term}%")) |
                (TransportItems.vehicle_size.ilike(f"%{search_term}%"))
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error searching transport items with term {search_term}: {str(e)}")
            raise DatabaseError("Failed to search transport items", context={"search_term": search_term, "error": str(e)})
    
    def get_transport_items_by_route(self, db: Session, from_location: str, to_location: str) -> List[TransportItems]:
        """
        Get transport items by route.
        
        Args:
            db: Database session
            from_location: From location
            to_location: To location
            
        Returns:
            List of transport items for the route
        """
        try:
            return db.query(TransportItems).filter(
                TransportItems.from_location.ilike(f"%{from_location}%"),
                TransportItems.to_location.ilike(f"%{to_location}%")
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting transport items by route {from_location} to {to_location}: {str(e)}")
            raise DatabaseError("Failed to get transport items by route", context={"from_location": from_location, "to_location": to_location, "error": str(e)})
    
    def get_transport_items_by_rfq(self, db: Session, rfq_id: UUID) -> List[TransportItems]:
        """
        Get transport items associated with an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of transport items for the RFQ
        """
        try:
            from models.transport_items_quotation import TransportItemsQuotation
            return db.query(TransportItems).join(TransportItemsQuotation).filter(
                TransportItemsQuotation.rfq_id == rfq_id
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting transport items by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get transport items by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
