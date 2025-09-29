"""
RFQ Vendors controller for managing vendor associations with RFQs.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.rfq_vendors import RFQVendorsService
from schemas.rfq_vendors import (
    RFQVendorsCreate, RFQVendorsUpdate, RFQVendorsResponse, RFQVendorsListResponse,
    RFQVendorsAddVendor, RFQVendorsRemoveVendor
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class RFQVendorsController(BaseController):
    """Controller for managing RFQ vendor associations."""
    
    def __init__(self):
        self.service = RFQVendorsService()
        super().__init__(self.service, RFQVendorsResponse)
    
    def create_rfq_vendor_association(
        self, 
        rfq_vendor_data: RFQVendorsCreate, 
        db: Session = Depends(get_db)
    ) -> RFQVendorsResponse:
        """
        Create a new RFQ vendor association.
        
        Args:
            rfq_vendor_data: RFQ vendor creation data
            db: Database session
            
        Returns:
            Created RFQ vendor association response
        """
        try:
            rfq_vendor = self.service.create_rfq_vendor_association(db, rfq_vendor_data)
            return RFQVendorsResponse.model_validate(rfq_vendor)
        except Exception as e:
            logger.error(f"Error creating RFQ vendor association: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_vendors_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> RFQVendorsResponse:
        """
        Get vendor associations for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            RFQ vendor association response
        """
        try:
            rfq_vendor = self.service.get_vendors_by_rfq(db, rfq_id)
            if not rfq_vendor:
                raise HTTPException(status_code=404, detail="RFQ vendor association not found")
            return RFQVendorsResponse.model_validate(rfq_vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting vendors by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def add_vendor_to_rfq(
        self, 
        rfq_id: UUID, 
        vendor_data: RFQVendorsAddVendor, 
        db: Session = Depends(get_db)
    ) -> RFQVendorsResponse:
        """
        Add a vendor to an RFQ.
        
        Args:
            rfq_id: RFQ ID
            vendor_data: Vendor data to add
            db: Database session
            
        Returns:
            Updated RFQ vendor association response
        """
        try:
            rfq_vendor = self.service.add_vendor_to_rfq(db, rfq_id, vendor_data)
            if not rfq_vendor:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return RFQVendorsResponse.model_validate(rfq_vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding vendor to RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def remove_vendor_from_rfq(
        self, 
        rfq_id: UUID, 
        vendor_data: RFQVendorsRemoveVendor, 
        db: Session = Depends(get_db)
    ) -> RFQVendorsResponse:
        """
        Remove a vendor from an RFQ.
        
        Args:
            rfq_id: RFQ ID
            vendor_data: Vendor data to remove
            db: Database session
            
        Returns:
            Updated RFQ vendor association response
        """
        try:
            rfq_vendor = self.service.remove_vendor_from_rfq(db, rfq_id, vendor_data)
            if not rfq_vendor:
                raise HTTPException(status_code=404, detail="RFQ vendor association not found")
            return RFQVendorsResponse.model_validate(rfq_vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error removing vendor from RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def update_rfq_vendors(
        self, 
        rfq_id: UUID, 
        vendors_data: RFQVendorsUpdate, 
        db: Session = Depends(get_db)
    ) -> RFQVendorsResponse:
        """
        Update vendor associations for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            vendors_data: Updated vendor data
            db: Database session
            
        Returns:
            Updated RFQ vendor association response
        """
        try:
            rfq_vendor = self.service.update_rfq_vendors(db, rfq_id, vendors_data)
            if not rfq_vendor:
                raise HTTPException(status_code=404, detail="RFQ vendor association not found")
            return RFQVendorsResponse.model_validate(rfq_vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating RFQ vendors {rfq_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_rfq_vendor_association(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete RFQ vendor association.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            # Get the association first
            rfq_vendor = self.service.get_vendors_by_rfq(db, rfq_id)
            if not rfq_vendor:
                raise HTTPException(status_code=404, detail="RFQ vendor association not found")
            
            success = self.service.delete(db, rfq_vendor.id)
            if not success:
                raise HTTPException(status_code=404, detail="RFQ vendor association not found")
            return {"message": "RFQ vendor association deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting RFQ vendor association {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
rfq_vendors_controller = RFQVendorsController()
