"""
Indent Items Quotation service for managing indent item quotations.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.indent_items_quotation import IndentItemsQuotation
from schemas.indent_items_quotation import IndentItemsQuotationCreate, IndentItemsQuotationUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class IndentItemsQuotationService(BaseService[IndentItemsQuotation]):
    """Service for managing indent items quotations."""
    
    def __init__(self):
        super().__init__(IndentItemsQuotation)
    
    def create_indent_quotation(self, db: Session, quotation_data: IndentItemsQuotationCreate) -> IndentItemsQuotation:
        """
        Create a new indent items quotation.
        
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
            
            # Validate indent item exists
            from models.indent_items import IndentItems
            indent_item = db.query(IndentItems).filter(IndentItems.id == quotation_data.indent_items_id).first()
            if not indent_item:
                raise ValidationError("Indent item not found", context={"indent_items_id": str(quotation_data.indent_items_id)})
            
            # Validate vendor exists
            from models.vendors import Vendors
            vendor = db.query(Vendors).filter(Vendors.id == quotation_data.vendor_id).first()
            if not vendor:
                raise ValidationError("Vendor not found", context={"vendor_id": str(quotation_data.vendor_id)})
            
            quotation_dict = quotation_data.model_dump()
            return self.create(db, quotation_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating indent quotation: {str(e)}")
            raise DatabaseError("Failed to create indent quotation", context={"error": str(e)})
    
    def get_quotations_by_rfq(self, db: Session, rfq_id: UUID) -> List[IndentItemsQuotation]:
        """
        Get indent quotations for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of indent quotations for the RFQ
        """
        try:
            return db.query(IndentItemsQuotation).filter(IndentItemsQuotation.rfq_id == rfq_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting indent quotations by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get indent quotations by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def get_quotations_by_vendor(self, db: Session, vendor_id: UUID) -> List[IndentItemsQuotation]:
        """
        Get indent quotations by a vendor.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            
        Returns:
            List of indent quotations by the vendor
        """
        try:
            return db.query(IndentItemsQuotation).filter(IndentItemsQuotation.vendor_id == vendor_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting indent quotations by vendor {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to get indent quotations by vendor", context={"vendor_id": str(vendor_id), "error": str(e)})
    
    def get_quotations_by_indent_item(self, db: Session, indent_item_id: UUID) -> List[IndentItemsQuotation]:
        """
        Get quotations for a specific indent item.
        
        Args:
            db: Database session
            indent_item_id: Indent item ID
            
        Returns:
            List of quotations for the indent item
        """
        try:
            return db.query(IndentItemsQuotation).filter(IndentItemsQuotation.indent_items_id == indent_item_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting indent quotations by item {indent_item_id}: {str(e)}")
            raise DatabaseError("Failed to get indent quotations by item", context={"indent_item_id": str(indent_item_id), "error": str(e)})
    
    def update_quotation(self, db: Session, quotation_id: UUID, quotation_data: IndentItemsQuotationUpdate) -> Optional[IndentItemsQuotation]:
        """
        Update an indent quotation.
        
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
            logger.error(f"Error updating indent quotation {quotation_id}: {str(e)}")
            raise DatabaseError("Failed to update indent quotation", context={"id": str(quotation_id), "error": str(e)})
