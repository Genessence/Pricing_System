"""
Transport Items Quotation service for managing transport item quotations.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.transport_items_quotation import TransportItemsQuotation
from schemas.transport_items_quotation import TransportItemsQuotationCreate, TransportItemsQuotationUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class TransportItemsQuotationService(BaseService[TransportItemsQuotation]):
    """Service for managing transport items quotations."""
    
    def __init__(self):
        super().__init__(TransportItemsQuotation)
    
    def create_transport_quotation(self, db: Session, quotation_data: TransportItemsQuotationCreate) -> TransportItemsQuotation:
        """
        Create a new transport items quotation.
        
        Args:
            db: Database session
            quotation_data: Quotation creation data
            
        Returns:
            Created quotation instance
        """
        try:
            # Validate RFQ exists
            from models.general_purchase_rfq import GeneralPurchaseRFQ
            rfq = db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.id == quotation_data.rfq_id).first()
            if not rfq:
                raise ValidationError("RFQ not found", context={"rfq_id": str(quotation_data.rfq_id)})
            
            # Validate transport item exists
            from models.transport_items import TransportItems
            transport_item = db.query(TransportItems).filter(TransportItems.id == quotation_data.transport_items_id).first()
            if not transport_item:
                raise ValidationError("Transport item not found", context={"transport_items_id": str(quotation_data.transport_items_id)})
            
            # Validate vendor exists
            from models.vendors import Vendors
            vendor = db.query(Vendors).filter(Vendors.id == quotation_data.vendors_id).first()
            if not vendor:
                raise ValidationError("Vendor not found", context={"vendors_id": str(quotation_data.vendors_id)})
            
            quotation_dict = quotation_data.model_dump()
            return self.create(db, quotation_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating transport quotation: {str(e)}")
            raise DatabaseError("Failed to create transport quotation", context={"error": str(e)})
    
    def get_quotations_by_rfq(self, db: Session, rfq_id: UUID) -> List[TransportItemsQuotation]:
        """
        Get transport quotations for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of transport quotations for the RFQ
        """
        try:
            return db.query(TransportItemsQuotation).filter(TransportItemsQuotation.rfq_id == rfq_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting transport quotations by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get transport quotations by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def get_quotations_by_vendor(self, db: Session, vendor_id: UUID) -> List[TransportItemsQuotation]:
        """
        Get transport quotations by a vendor.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            
        Returns:
            List of transport quotations by the vendor
        """
        try:
            return db.query(TransportItemsQuotation).filter(TransportItemsQuotation.vendors_id == vendor_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting transport quotations by vendor {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to get transport quotations by vendor", context={"vendor_id": str(vendor_id), "error": str(e)})
    
    def get_quotations_by_transport_item(self, db: Session, transport_item_id: UUID) -> List[TransportItemsQuotation]:
        """
        Get quotations for a specific transport item.
        
        Args:
            db: Database session
            transport_item_id: Transport item ID
            
        Returns:
            List of quotations for the transport item
        """
        try:
            return db.query(TransportItemsQuotation).filter(TransportItemsQuotation.transport_items_id == transport_item_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting transport quotations by item {transport_item_id}: {str(e)}")
            raise DatabaseError("Failed to get transport quotations by item", context={"transport_item_id": str(transport_item_id), "error": str(e)})
    
    def update_quotation(self, db: Session, quotation_id: UUID, quotation_data: TransportItemsQuotationUpdate) -> Optional[TransportItemsQuotation]:
        """
        Update a transport quotation.
        
        Args:
            db: Database session
            quotation_id: Quotation ID
            quotation_data: Quotation update data
            
        Returns:
            Updated quotation instance
        """
        try:
            update_data = quotation_data.model_dump(exclude_unset=True)
            return self.update(db, quotation_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating transport quotation {quotation_id}: {str(e)}")
            raise DatabaseError("Failed to update transport quotation", context={"id": str(quotation_id), "error": str(e)})
