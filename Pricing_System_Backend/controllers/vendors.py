"""
Vendors controller for managing suppliers.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.vendors import VendorsService
from schemas.vendors import VendorsCreate, VendorsUpdate, VendorsResponse, VendorsListResponse
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class VendorsController(BaseController):
    """Controller for managing vendors."""
    
    def __init__(self):
        self.service = VendorsService()
        super().__init__(self.service, VendorsResponse)
    
    def create_vendor(
        self, 
        vendor_data: VendorsCreate, 
        db: Session = Depends(get_db)
    ) -> VendorsResponse:
        """
        Create a new vendor.
        
        Args:
            vendor_data: Vendor creation data
            db: Database session
            
        Returns:
            Created vendor response
        """
        try:
            vendor = self.service.create_vendor(db, vendor_data)
            return VendorsResponse.model_validate(vendor)
        except Exception as e:
            logger.error(f"Error creating vendor: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> VendorsResponse:
        """
        Get a vendor by ID.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            Vendor response
        """
        try:
            vendor = self.service.get(db, vendor_id)
            if not vendor:
                raise HTTPException(status_code=404, detail="Vendor not found")
            return VendorsResponse.model_validate(vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_vendor_by_code(
        self, 
        code: str, 
        db: Session = Depends(get_db)
    ) -> VendorsResponse:
        """
        Get a vendor by code.
        
        Args:
            code: Vendor code
            db: Database session
            
        Returns:
            Vendor response
        """
        try:
            vendor = self.service.get_vendor_by_code(db, code)
            if not vendor:
                raise HTTPException(status_code=404, detail="Vendor not found")
            return VendorsResponse.model_validate(vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting vendor by code {code}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_vendors(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        is_active: Optional[bool] = Query(None, description="Filter by active status"),
        status: Optional[str] = Query(None, description="Filter by status"),
        commodity_type: Optional[str] = Query(None, description="Filter by commodity type"),
        db: Session = Depends(get_db)
    ) -> List[VendorsListResponse]:
        """
        Get multiple vendors with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status
            status: Filter by status
            commodity_type: Filter by commodity type
            db: Database session
            
        Returns:
            List of vendor responses
        """
        try:
            filters = {}
            if is_active is not None:
                filters["is_active"] = is_active
            if status:
                filters["status"] = status
            if commodity_type:
                filters["providing_commodity_type"] = commodity_type
            
            vendors = self.service.get_multi(db, skip=skip, limit=limit, filters=filters)
            return [VendorsListResponse.model_validate(vendor) for vendor in vendors]
        except Exception as e:
            logger.error(f"Error getting vendors: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_vendors_by_commodity_type(
        self, 
        commodity_type: str, 
        db: Session = Depends(get_db)
    ) -> List[VendorsListResponse]:
        """
        Get vendors by commodity type.
        
        Args:
            commodity_type: Commodity type
            db: Database session
            
        Returns:
            List of vendors for the commodity type
        """
        try:
            vendors = self.service.get_vendors_by_commodity_type(db, commodity_type)
            return [VendorsListResponse.model_validate(vendor) for vendor in vendors]
        except Exception as e:
            logger.error(f"Error getting vendors by commodity type {commodity_type}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_active_vendors(
        self, 
        db: Session = Depends(get_db)
    ) -> List[VendorsListResponse]:
        """
        Get all active vendors.
        
        Args:
            db: Database session
            
        Returns:
            List of active vendors
        """
        try:
            vendors = self.service.get_active_vendors(db)
            return [VendorsListResponse.model_validate(vendor) for vendor in vendors]
        except Exception as e:
            logger.error(f"Error getting active vendors: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def search_vendors(
        self, 
        search_term: str = Query(..., description="Search term for name or code"),
        db: Session = Depends(get_db)
    ) -> List[VendorsListResponse]:
        """
        Search vendors by name or code.
        
        Args:
            search_term: Search term
            db: Database session
            
        Returns:
            List of matching vendors
        """
        try:
            vendors = self.service.search_vendors(db, search_term)
            return [VendorsListResponse.model_validate(vendor) for vendor in vendors]
        except Exception as e:
            logger.error(f"Error searching vendors: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_vendor(
        self, 
        vendor_id: UUID, 
        vendor_data: VendorsUpdate, 
        db: Session = Depends(get_db)
    ) -> VendorsResponse:
        """
        Update a vendor.
        
        Args:
            vendor_id: Vendor ID
            vendor_data: Vendor update data
            db: Database session
            
        Returns:
            Updated vendor response
        """
        try:
            vendor = self.service.update_vendor(db, vendor_id, vendor_data)
            if not vendor:
                raise HTTPException(status_code=404, detail="Vendor not found")
            return VendorsResponse.model_validate(vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def update_vendor_rating(
        self, 
        vendor_id: UUID, 
        rating: int = Query(..., ge=1, le=5, description="Rating between 1 and 5"),
        db: Session = Depends(get_db)
    ) -> VendorsResponse:
        """
        Update vendor rating.
        
        Args:
            vendor_id: Vendor ID
            rating: New rating (1-5)
            db: Database session
            
        Returns:
            Updated vendor response
        """
        try:
            vendor = self.service.update_vendor_rating(db, vendor_id, rating)
            if not vendor:
                raise HTTPException(status_code=404, detail="Vendor not found")
            return VendorsResponse.model_validate(vendor)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating vendor rating {vendor_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete a vendor.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, vendor_id)
            if not success:
                raise HTTPException(status_code=404, detail="Vendor not found")
            return {"message": "Vendor deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
vendors_controller = VendorsController()
