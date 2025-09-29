"""
General Purchase RFQ controller for managing RFQ operations.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.general_purchase_rfq import GeneralPurchaseRFQService
from schemas.general_purchase_rfq import (
    GeneralPurchaseRFQCreate, GeneralPurchaseRFQUpdate, GeneralPurchaseRFQResponse, 
    GeneralPurchaseRFQListResponse, GeneralPurchaseRFQWithRelations, GeneralPurchaseRFQStatusUpdate
)
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class GeneralPurchaseRFQController(BaseController):
    """Controller for managing RFQs."""
    
    def __init__(self):
        self.service = GeneralPurchaseRFQService()
        super().__init__(self.service, GeneralPurchaseRFQResponse)
    
    def create_rfq(
        self, 
        rfq_data: GeneralPurchaseRFQCreate, 
        creator_id: UUID = Query(..., description="ID of the user creating the RFQ"),
        db: Session = Depends(get_db)
    ) -> GeneralPurchaseRFQResponse:
        """
        Create a new RFQ.
        
        Args:
            rfq_data: RFQ creation data
            creator_id: ID of the user creating the RFQ
            db: Database session
            
        Returns:
            Created RFQ response
        """
        try:
            rfq = self.service.create_rfq(db, rfq_data, creator_id)
            return GeneralPurchaseRFQResponse.model_validate(rfq)
        except Exception as e:
            logger.error(f"Error creating RFQ: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> GeneralPurchaseRFQResponse:
        """
        Get an RFQ by ID.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            RFQ response
        """
        try:
            rfq = self.service.get(db, rfq_id)
            if not rfq:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return GeneralPurchaseRFQResponse.model_validate(rfq)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_rfq_by_number(
        self, 
        rfq_number: str, 
        db: Session = Depends(get_db)
    ) -> GeneralPurchaseRFQResponse:
        """
        Get an RFQ by number.
        
        Args:
            rfq_number: RFQ number
            db: Database session
            
        Returns:
            RFQ response
        """
        try:
            rfq = self.service.get_rfq_by_number(db, rfq_number)
            if not rfq:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return GeneralPurchaseRFQResponse.model_validate(rfq)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting RFQ by number {rfq_number}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_rfqs(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        status: Optional[str] = Query(None, description="Filter by status"),
        commodity_type: Optional[str] = Query(None, description="Filter by commodity type"),
        site_code: Optional[str] = Query(None, description="Filter by site code"),
        created_by: Optional[UUID] = Query(None, description="Filter by creator"),
        db: Session = Depends(get_db)
    ) -> List[GeneralPurchaseRFQListResponse]:
        """
        Get multiple RFQs with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Filter by status
            commodity_type: Filter by commodity type
            site_code: Filter by site code
            created_by: Filter by creator
            db: Database session
            
        Returns:
            List of RFQ responses
        """
        try:
            filters = {}
            if status:
                filters["status"] = status
            if commodity_type:
                filters["commodity_type"] = commodity_type
            if site_code:
                filters["site_code"] = site_code
            if created_by:
                filters["created_by"] = created_by
            
            rfqs = self.service.get_multi(db, skip=skip, limit=limit, filters=filters)
            return [GeneralPurchaseRFQListResponse.model_validate(rfq) for rfq in rfqs]
        except Exception as e:
            logger.error(f"Error getting RFQs: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_rfqs_by_status(
        self, 
        status: str, 
        db: Session = Depends(get_db)
    ) -> List[GeneralPurchaseRFQListResponse]:
        """
        Get RFQs by status.
        
        Args:
            status: RFQ status
            db: Database session
            
        Returns:
            List of RFQs with the status
        """
        try:
            rfqs = self.service.get_rfqs_by_status(db, status)
            return [GeneralPurchaseRFQListResponse.model_validate(rfq) for rfq in rfqs]
        except Exception as e:
            logger.error(f"Error getting RFQs by status {status}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_rfqs_by_creator(
        self, 
        creator_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[GeneralPurchaseRFQListResponse]:
        """
        Get RFQs created by a user.
        
        Args:
            creator_id: Creator user ID
            db: Database session
            
        Returns:
            List of RFQs created by the user
        """
        try:
            rfqs = self.service.get_rfqs_by_creator(db, creator_id)
            return [GeneralPurchaseRFQListResponse.model_validate(rfq) for rfq in rfqs]
        except Exception as e:
            logger.error(f"Error getting RFQs by creator {creator_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_rfqs_by_site(
        self, 
        site_code: str, 
        db: Session = Depends(get_db)
    ) -> List[GeneralPurchaseRFQListResponse]:
        """
        Get RFQs for a specific site.
        
        Args:
            site_code: Site code
            db: Database session
            
        Returns:
            List of RFQs for the site
        """
        try:
            rfqs = self.service.get_rfqs_by_site(db, site_code)
            return [GeneralPurchaseRFQListResponse.model_validate(rfq) for rfq in rfqs]
        except Exception as e:
            logger.error(f"Error getting RFQs by site {site_code}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_rfq(
        self, 
        rfq_id: UUID, 
        rfq_data: GeneralPurchaseRFQUpdate, 
        db: Session = Depends(get_db)
    ) -> GeneralPurchaseRFQResponse:
        """
        Update an RFQ.
        
        Args:
            rfq_id: RFQ ID
            rfq_data: RFQ update data
            db: Database session
            
        Returns:
            Updated RFQ response
        """
        try:
            rfq = self.service.update(db, rfq_id, rfq_data.model_dump(exclude_unset=True))
            if not rfq:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return GeneralPurchaseRFQResponse.model_validate(rfq)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def update_rfq_status(
        self, 
        rfq_id: UUID, 
        status_data: GeneralPurchaseRFQStatusUpdate,
        approver_id: UUID = Query(..., description="ID of the user approving the RFQ"),
        db: Session = Depends(get_db)
    ) -> GeneralPurchaseRFQResponse:
        """
        Update RFQ status.
        
        Args:
            rfq_id: RFQ ID
            status_data: Status update data
            approver_id: ID of the user approving the RFQ
            db: Database session
            
        Returns:
            Updated RFQ response
        """
        try:
            rfq = self.service.update_rfq_status(db, rfq_id, status_data, approver_id)
            if not rfq:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return GeneralPurchaseRFQResponse.model_validate(rfq)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating RFQ status {rfq_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, rfq_id)
            if not success:
                raise HTTPException(status_code=404, detail="RFQ not found")
            return {"message": "RFQ deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
general_purchase_rfq_controller = GeneralPurchaseRFQController()
