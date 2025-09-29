"""
Indent Items Quotation controller for managing indent item quotations.
"""

from typing import List
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.indent_items_quotation import IndentItemsQuotationService
from schemas.indent_items_quotation import (
    IndentItemsQuotationCreate, IndentItemsQuotationUpdate, IndentItemsQuotationResponse, 
    IndentItemsQuotationListResponse
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class IndentItemsQuotationController(BaseController):
    """Controller for managing indent items quotations."""
    
    def __init__(self):
        self.service = IndentItemsQuotationService()
        super().__init__(self.service, IndentItemsQuotationResponse)
    
    def create_indent_quotation(
        self, 
        quotation_data: IndentItemsQuotationCreate, 
        db: Session = Depends(get_db)
    ) -> IndentItemsQuotationResponse:
        """
        Create a new indent items quotation.
        
        Args:
            quotation_data: Quotation creation data
            db: Database session
            
        Returns:
            Created quotation response
        """
        try:
            quotation = self.service.create_indent_quotation(db, quotation_data)
            return IndentItemsQuotationResponse.model_validate(quotation)
        except Exception as e:
            logger.error(f"Error creating indent quotation: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_quotations_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[IndentItemsQuotationListResponse]:
        """
        Get indent quotations for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of quotations for the RFQ
        """
        try:
            quotations = self.service.get_quotations_by_rfq(db, rfq_id)
            return [IndentItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[IndentItemsQuotationListResponse]:
        """
        Get indent quotations by a vendor.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            List of quotations by the vendor
        """
        try:
            quotations = self.service.get_quotations_by_vendor(db, vendor_id)
            return [IndentItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_quotations_by_indent_item(
        self, 
        indent_item_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[IndentItemsQuotationListResponse]:
        """
        Get quotations for a specific indent item.
        
        Args:
            indent_item_id: Indent item ID
            db: Database session
            
        Returns:
            List of quotations for the indent item
        """
        try:
            quotations = self.service.get_quotations_by_indent_item(db, indent_item_id)
            return [IndentItemsQuotationListResponse.model_validate(quotation) for quotation in quotations]
        except Exception as e:
            logger.error(f"Error getting quotations by indent item {indent_item_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_quotation(
        self, 
        quotation_id: UUID, 
        quotation_data: IndentItemsQuotationUpdate, 
        db: Session = Depends(get_db)
    ) -> IndentItemsQuotationResponse:
        """
        Update an indent items quotation.
        
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
                raise HTTPException(status_code=404, detail="Indent quotation not found")
            return IndentItemsQuotationResponse.model_validate(quotation)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating indent quotation {quotation_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


# Create controller instance
indent_items_quotation_controller = IndentItemsQuotationController()
