"""
Service Items Quotation service for managing service item quotations.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.service_items_quotation import ServiceItemsQuotation
from schemas.service_items_quotation import ServiceItemsQuotationCreate, ServiceItemsQuotationUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class ServiceItemsQuotationService(BaseService[ServiceItemsQuotation]):
    """Service for managing service items quotations."""
    
    def __init__(self):
        super().__init__(ServiceItemsQuotation)
    
    def create_service_quotation(self, db: Session, quotation_data: ServiceItemsQuotationCreate) -> ServiceItemsQuotation:
        """
        Create a new service items quotation.
        
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
            
            # Validate service item exists
            from models.service_items import ServiceItems
            service_item = db.query(ServiceItems).filter(ServiceItems.id == quotation_data.service_items_id).first()
            if not service_item:
                raise ValidationError("Service item not found", context={"service_items_id": str(quotation_data.service_items_id)})
            
            # Validate vendor exists
            from models.vendors import Vendors
            vendor = db.query(Vendors).filter(Vendors.id == quotation_data.vendors_id).first()
            if not vendor:
                raise ValidationError("Vendor not found", context={"vendors_id": str(quotation_data.vendors_id)})
            
            quotation_dict = quotation_data.model_dump()
            return self.create(db, quotation_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating service quotation: {str(e)}")
            raise DatabaseError("Failed to create service quotation", context={"error": str(e)})
    
    def get_quotations_by_rfq(self, db: Session, rfq_id: UUID) -> List[ServiceItemsQuotation]:
        """
        Get service quotations for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of service quotations for the RFQ
        """
        try:
            return db.query(ServiceItemsQuotation).filter(ServiceItemsQuotation.rfq_id == rfq_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting service quotations by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get service quotations by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def get_quotations_by_vendor(self, db: Session, vendor_id: UUID) -> List[ServiceItemsQuotation]:
        """
        Get service quotations by a vendor.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            
        Returns:
            List of service quotations by the vendor
        """
        try:
            return db.query(ServiceItemsQuotation).filter(ServiceItemsQuotation.vendors_id == vendor_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting service quotations by vendor {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to get service quotations by vendor", context={"vendor_id": str(vendor_id), "error": str(e)})
    
    def get_quotations_by_service_item(self, db: Session, service_item_id: UUID) -> List[ServiceItemsQuotation]:
        """
        Get quotations for a specific service item.
        
        Args:
            db: Database session
            service_item_id: Service item ID
            
        Returns:
            List of quotations for the service item
        """
        try:
            return db.query(ServiceItemsQuotation).filter(ServiceItemsQuotation.service_items_id == service_item_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting service quotations by item {service_item_id}: {str(e)}")
            raise DatabaseError("Failed to get service quotations by item", context={"service_item_id": str(service_item_id), "error": str(e)})
    
    def update_quotation(self, db: Session, quotation_id: UUID, quotation_data: ServiceItemsQuotationUpdate) -> Optional[ServiceItemsQuotation]:
        """
        Update a service quotation.
        
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
            logger.error(f"Error updating service quotation {quotation_id}: {str(e)}")
            raise DatabaseError("Failed to update service quotation", context={"id": str(quotation_id), "error": str(e)})
