"""
RFQ Vendors service for managing vendor associations with RFQs.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.rfq_vendors import RFQVendors
from schemas.rfq_vendors import RFQVendorsCreate, RFQVendorsUpdate, RFQVendorsAddVendor, RFQVendorsRemoveVendor
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class RFQVendorsService(BaseService[RFQVendors]):
    """Service for managing RFQ vendor associations."""
    
    def __init__(self):
        super().__init__(RFQVendors)
    
    def create_rfq_vendor_association(self, db: Session, rfq_vendor_data: RFQVendorsCreate) -> RFQVendors:
        """
        Create a new RFQ vendor association.
        
        Args:
            db: Database session
            rfq_vendor_data: RFQ vendor creation data
            
        Returns:
            Created RFQ vendor association instance
        """
        try:
            # Validate RFQ exists
            from models.general_purchase_rfq import GeneralPurchaseRFQ
            rfq = db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.id == rfq_vendor_data.rfq_id).first()
            if not rfq:
                raise ValidationError("RFQ not found", context={"rfq_id": str(rfq_vendor_data.rfq_id)})
            
            # Validate all vendors exist
            from models.vendors import Vendors
            for vendor_id in rfq_vendor_data.vendors_ids:
                vendor = db.query(Vendors).filter(Vendors.id == vendor_id).first()
                if not vendor:
                    raise ValidationError("Vendor not found", context={"vendor_id": str(vendor_id)})
            
            # Check if association already exists
            existing = db.query(RFQVendors).filter(RFQVendors.rfq_id == rfq_vendor_data.rfq_id).first()
            if existing:
                raise ValidationError("RFQ vendor association already exists", context={"rfq_id": str(rfq_vendor_data.rfq_id)})
            
            rfq_vendor_dict = rfq_vendor_data.model_dump()
            return self.create(db, rfq_vendor_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating RFQ vendor association: {str(e)}")
            raise DatabaseError("Failed to create RFQ vendor association", context={"error": str(e)})
    
    def get_vendors_by_rfq(self, db: Session, rfq_id: UUID) -> Optional[RFQVendors]:
        """
        Get vendor associations for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            RFQ vendor association or None if not found
        """
        try:
            return db.query(RFQVendors).filter(RFQVendors.rfq_id == rfq_id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting vendors by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get vendors by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def add_vendor_to_rfq(self, db: Session, rfq_id: UUID, vendor_data: RFQVendorsAddVendor) -> Optional[RFQVendors]:
        """
        Add a vendor to an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            vendor_data: Vendor data to add
            
        Returns:
            Updated RFQ vendor association
        """
        try:
            # Validate vendor exists
            from models.vendors import Vendors
            vendor = db.query(Vendors).filter(Vendors.id == vendor_data.vendor_id).first()
            if not vendor:
                raise ValidationError("Vendor not found", context={"vendor_id": str(vendor_data.vendor_id)})
            
            # Get existing association
            rfq_vendor = self.get_vendors_by_rfq(db, rfq_id)
            if not rfq_vendor:
                # Create new association
                rfq_vendor_data = RFQVendorsCreate(
                    rfq_id=rfq_id,
                    vendors_ids=[vendor_data.vendor_id]
                )
                return self.create_rfq_vendor_association(db, rfq_vendor_data)
            else:
                # Add vendor to existing association
                if vendor_data.vendor_id not in rfq_vendor.vendors_ids:
                    rfq_vendor.vendors_ids.append(vendor_data.vendor_id)
                    db.commit()
                    db.refresh(rfq_vendor)
                    logger.info(f"Added vendor {vendor_data.vendor_id} to RFQ {rfq_id}")
                else:
                    logger.warning(f"Vendor {vendor_data.vendor_id} already associated with RFQ {rfq_id}")
                
                return rfq_vendor
        except SQLAlchemyError as e:
            logger.error(f"Error adding vendor to RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to add vendor to RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def remove_vendor_from_rfq(self, db: Session, rfq_id: UUID, vendor_data: RFQVendorsRemoveVendor) -> Optional[RFQVendors]:
        """
        Remove a vendor from an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            vendor_data: Vendor data to remove
            
        Returns:
            Updated RFQ vendor association
        """
        try:
            # Get existing association
            rfq_vendor = self.get_vendors_by_rfq(db, rfq_id)
            if not rfq_vendor:
                raise NotFoundError("RFQ vendor association not found", context={"rfq_id": str(rfq_id)})
            
            # Remove vendor from association
            if vendor_data.vendor_id in rfq_vendor.vendors_ids:
                rfq_vendor.vendors_ids.remove(vendor_data.vendor_id)
                db.commit()
                db.refresh(rfq_vendor)
                logger.info(f"Removed vendor {vendor_data.vendor_id} from RFQ {rfq_id}")
            else:
                logger.warning(f"Vendor {vendor_data.vendor_id} not associated with RFQ {rfq_id}")
            
            return rfq_vendor
        except SQLAlchemyError as e:
            logger.error(f"Error removing vendor from RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to remove vendor from RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def update_rfq_vendors(self, db: Session, rfq_id: UUID, vendors_data: RFQVendorsUpdate) -> Optional[RFQVendors]:
        """
        Update vendor associations for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            vendors_data: Updated vendor data
            
        Returns:
            Updated RFQ vendor association
        """
        try:
            # Validate all vendors exist if provided
            if vendors_data.vendors_ids:
                from models.vendors import Vendors
                for vendor_id in vendors_data.vendors_ids:
                    vendor = db.query(Vendors).filter(Vendors.id == vendor_id).first()
                    if not vendor:
                        raise ValidationError("Vendor not found", context={"vendor_id": str(vendor_id)})
            
            # Get existing association
            rfq_vendor = self.get_vendors_by_rfq(db, rfq_id)
            if not rfq_vendor:
                raise NotFoundError("RFQ vendor association not found", context={"rfq_id": str(rfq_id)})
            
            update_data = vendors_data.model_dump(exclude_unset=True)
            return self.update(db, rfq_vendor.id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating RFQ vendors {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to update RFQ vendors", context={"rfq_id": str(rfq_id), "error": str(e)})
