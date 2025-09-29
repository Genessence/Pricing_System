"""
Vendors service for managing suppliers.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.vendors import Vendors
from schemas.vendors import VendorsCreate, VendorsUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class VendorsService(BaseService[Vendors]):
    """Service for managing vendors."""
    
    def __init__(self):
        super().__init__(Vendors)
    
    def create_vendor(self, db: Session, vendor_data: VendorsCreate) -> Vendors:
        """
        Create a new vendor.
        
        Args:
            db: Database session
            vendor_data: Vendor creation data
            
        Returns:
            Created vendor instance
        """
        try:
            # Check if vendor code already exists
            existing_vendor = db.query(Vendors).filter(Vendors.code == vendor_data.code).first()
            if existing_vendor:
                raise ValidationError("Vendor code already exists", context={"code": vendor_data.code})
            
            vendor_dict = vendor_data.model_dump()
            return self.create(db, vendor_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating vendor: {str(e)}")
            raise DatabaseError("Failed to create vendor", context={"error": str(e)})
    
    def get_vendor_by_code(self, db: Session, code: str) -> Optional[Vendors]:
        """
        Get vendor by code.
        
        Args:
            db: Database session
            code: Vendor code
            
        Returns:
            Vendor instance or None if not found
        """
        try:
            return db.query(Vendors).filter(Vendors.code == code).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting vendor by code {code}: {str(e)}")
            raise DatabaseError("Failed to get vendor by code", context={"code": code, "error": str(e)})
    
    def update_vendor(self, db: Session, vendor_id: UUID, vendor_data: VendorsUpdate) -> Optional[Vendors]:
        """
        Update a vendor.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            vendor_data: Vendor update data
            
        Returns:
            Updated vendor instance
        """
        try:
            # Check if code is being updated and if it conflicts
            if vendor_data.code:
                existing_vendor = db.query(Vendors).filter(
                    Vendors.code == vendor_data.code,
                    Vendors.id != vendor_id
                ).first()
                if existing_vendor:
                    raise ValidationError("Vendor code already exists", context={"code": vendor_data.code})
            
            update_data = vendor_data.model_dump(exclude_unset=True)
            return self.update(db, vendor_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating vendor {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to update vendor", context={"id": str(vendor_id), "error": str(e)})
    
    def get_vendors_by_commodity_type(self, db: Session, commodity_type: str) -> List[Vendors]:
        """
        Get vendors by commodity type.
        
        Args:
            db: Database session
            commodity_type: Commodity type
            
        Returns:
            List of vendors for the commodity type
        """
        try:
            return db.query(Vendors).filter(
                Vendors.providing_commodity_type == commodity_type,
                Vendors.is_active == True
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting vendors by commodity type {commodity_type}: {str(e)}")
            raise DatabaseError("Failed to get vendors by commodity type", context={"commodity_type": commodity_type, "error": str(e)})
    
    def get_active_vendors(self, db: Session) -> List[Vendors]:
        """
        Get all active vendors.
        
        Args:
            db: Database session
            
        Returns:
            List of active vendors
        """
        try:
            return db.query(Vendors).filter(Vendors.is_active == True).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting active vendors: {str(e)}")
            raise DatabaseError("Failed to get active vendors", context={"error": str(e)})
    
    def get_vendors_by_status(self, db: Session, status: str) -> List[Vendors]:
        """
        Get vendors by status.
        
        Args:
            db: Database session
            status: Vendor status
            
        Returns:
            List of vendors with the status
        """
        try:
            return db.query(Vendors).filter(Vendors.status == status).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting vendors by status {status}: {str(e)}")
            raise DatabaseError("Failed to get vendors by status", context={"status": status, "error": str(e)})
    
    def update_vendor_rating(self, db: Session, vendor_id: UUID, rating: int) -> Optional[Vendors]:
        """
        Update vendor rating.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            rating: New rating (1-5)
            
        Returns:
            Updated vendor instance
        """
        try:
            if not 1 <= rating <= 5:
                raise ValidationError("Rating must be between 1 and 5", context={"rating": rating})
            
            return self.update(db, vendor_id, {"rating": rating})
        except SQLAlchemyError as e:
            logger.error(f"Error updating vendor rating {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to update vendor rating", context={"id": str(vendor_id), "error": str(e)})
    
    def search_vendors(self, db: Session, search_term: str) -> List[Vendors]:
        """
        Search vendors by name or code.
        
        Args:
            db: Database session
            search_term: Search term
            
        Returns:
            List of matching vendors
        """
        try:
            return db.query(Vendors).filter(
                (Vendors.name.ilike(f"%{search_term}%")) |
                (Vendors.code.ilike(f"%{search_term}%"))
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error searching vendors with term {search_term}: {str(e)}")
            raise DatabaseError("Failed to search vendors", context={"search_term": search_term, "error": str(e)})
