"""
Service Items Quotation controller for managing service item quotations.
"""

from typing import List
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.service_items_quotation import ServiceItemsQuotationService
from schemas.service_items_quotation import (
    ServiceItemsQuotationCreate, ServiceItemsQuotationUpdate, ServiceItemsQuotationResponse, 
    ServiceItemsQuotationListResponse
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class ServiceItemsQuotationController(BaseController):
    """Controller for managing service items quotations."""
    
    def __init__(self):
        self.service = ServiceItemsQuotationService()
        super().__init__(self.service, ServiceItemsQuotationResponse)
    
    def create_service_quotation(
        self, 
        quotation_data: ServiceItemsQuotationCreate, 
        db: Session = Depends(get_db)
    ) -> ServiceItemsQuotationResponse:
        """
        Create a new service items quotation.
        
        Args:
            quotation_data: Quotation creation data
            db: Database session
            
        Returns:
            Created quotation response
        """
        try:
            quotation = self.service.create_service_quotation(db, quotation_data)
            return ServiceItemsQuotationResponse.model_validate(quotation)
        except Exception as e:
            logger.error(f"Error creating service quotation: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_quotations_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsQuotationListResponse]:
        """
        Get service quotations for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of quotations for the RFQ
        """
        try:
            quotations = self.service.get_quotations_by_rfq(db, rfq_id)
            return [ServiceItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsQuotationListResponse]:
        """
        Get service quotations by a vendor.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            List of quotations by the vendor
        """
        try:
            quotations = self.service.get_quotations_by_vendor(db, vendor_id)
            return [ServiceItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_service_item(
        self, 
        service_item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[ServiceItemsQuotationListResponse]:
        """
        Get quotations for a specific service item.
        
        Args:
            service_item_id: Service item ID
            db: Database session
            
        Returns:
            List of quotations for the service item
        """
        try:
            quotations = self.service.get_quotations_by_service_item(db, service_item_id)
            return [ServiceItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by service item {service_item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_quotation(
        self, 
        quotation_id: UUID, 
        quotation_data: ServiceItemsQuotationUpdate, 
        db: Session = Depends(get_db)
    ) -> ServiceItemsQuotationResponse:
        """
        Update a service items quotation.
        
        Args:
            quotation_id: Quotation ID
            quotation_data: Quotation update data
            db: Database session
            
        Returns:
            Updated quotation response
        """
        try:
            quotation = self.service.update_quotation(db, quotation_id, quotation_data)
            if not quotation:
                raise HTTPException(status_code=404, detail="Service quotation not found")
            return ServiceItemsQuotationResponse.model_validate(quotation)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating service quotation {quotation_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


# Create controller instance
service_items_quotation_controller = ServiceItemsQuotationController()
