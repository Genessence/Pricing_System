"""
Transport Items Quotation controller for managing transport item quotations.
"""

from typing import List
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.transport_items_quotation import TransportItemsQuotationService
from schemas.transport_items_quotation import (
    TransportItemsQuotationCreate, TransportItemsQuotationUpdate, TransportItemsQuotationResponse, 
    TransportItemsQuotationListResponse
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class TransportItemsQuotationController(BaseController):
    """Controller for managing transport items quotations."""
    
    def __init__(self):
        self.service = TransportItemsQuotationService()
        super().__init__(self.service, TransportItemsQuotationResponse)
    
    def create_transport_quotation(
        self, 
        quotation_data: TransportItemsQuotationCreate, 
        db: Session = Depends(get_db)
    ) -> TransportItemsQuotationResponse:
        """
        Create a new transport items quotation.
        
        Args:
            quotation_data: Quotation creation data
            db: Database session
            
        Returns:
            Created quotation response
        """
        try:
            quotation = self.service.create_transport_quotation(db, quotation_data)
            return TransportItemsQuotationResponse.model_validate(quotation)
        except Exception as e:
            logger.error(f"Error creating transport quotation: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_quotations_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[TransportItemsQuotationListResponse]:
        """
        Get transport quotations for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of quotations for the RFQ
        """
        try:
            quotations = self.service.get_quotations_by_rfq(db, rfq_id)
            return [TransportItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[TransportItemsQuotationListResponse]:
        """
        Get transport quotations by a vendor.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            List of quotations by the vendor
        """
        try:
            quotations = self.service.get_quotations_by_vendor(db, vendor_id)
            return [TransportItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_transport_item(
        self, 
        transport_item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[TransportItemsQuotationListResponse]:
        """
        Get quotations for a specific transport item.
        
        Args:
            transport_item_id: Transport item ID
            db: Database session
            
        Returns:
            List of quotations for the transport item
        """
        try:
            quotations = self.service.get_quotations_by_transport_item(db, transport_item_id)
            return [TransportItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by transport item {transport_item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_quotation(
        self, 
        quotation_id: UUID, 
        quotation_data: TransportItemsQuotationUpdate, 
        db: Session = Depends(get_db)
    ) -> TransportItemsQuotationResponse:
        """
        Update a transport items quotation.
        
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
                raise HTTPException(status_code=404, detail="Transport quotation not found")
            return TransportItemsQuotationResponse.model_validate(quotation)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating transport quotation {quotation_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


# Create controller instance
transport_items_quotation_controller = TransportItemsQuotationController()
