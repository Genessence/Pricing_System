"""
Sites controller for managing company locations.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.sites import SitesService
from schemas.sites import SitesCreate, SitesUpdate, SitesResponse, SitesListResponse
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class SitesController(BaseController):
    """Controller for managing sites."""
    
    def __init__(self):
        self.service = SitesService()
        super().__init__(self.service, SitesResponse)
    
    def create_site(
        self, 
        site_data: SitesCreate, 
        db: Session = Depends(get_db)
    ) -> SitesResponse:
        """
        Create a new site.
        
        Args:
            site_data: Site creation data
            db: Database session
            
        Returns:
            Created site response
        """
        try:
            site = self.service.create_site(db, site_data)
            return SitesResponse.model_validate(site)
        except Exception as e:
            logger.error(f"Error creating site: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_site(
        self, 
        site_id: UUID, 
        db: Session = Depends(get_db)
    ) -> SitesResponse:
        """
        Get a site by ID.
        
        Args:
            site_id: Site ID
            db: Database session
            
        Returns:
            Site response
        """
        try:
            site = self.service.get(db, site_id)
            if not site:
                raise HTTPException(status_code=404, detail="Site not found")
            return SitesResponse.model_validate(site)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting site {site_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_site_by_code(
        self, 
        code: str, 
        db: Session = Depends(get_db)
    ) -> SitesResponse:
        """
        Get a site by code.
        
        Args:
            code: Site code
            db: Database session
            
        Returns:
            Site response
        """
        try:
            site = self.service.get_site_by_code(db, code)
            if not site:
                raise HTTPException(status_code=404, detail="Site not found")
            return SitesResponse.model_validate(site)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting site by code {code}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_sites(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
        is_active: Optional[bool] = Query(None, description="Filter by active status"),
        db: Session = Depends(get_db)
    ) -> List[SitesListResponse]:
        """
        Get multiple sites with optional filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status
            db: Database session
            
        Returns:
            List of site responses
        """
        try:
            filters = {}
            if is_active is not None:
                filters["is_active"] = is_active
            
            sites = self.service.get_multi(db, skip=skip, limit=limit, filters=filters)
            return [SitesListResponse.model_validate(site) for site in sites]
        except Exception as e:
            logger.error(f"Error getting sites: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_active_sites(
        self, 
        db: Session = Depends(get_db)
    ) -> List[SitesListResponse]:
        """
        Get all active sites.
        
        Args:
            db: Database session
            
        Returns:
            List of active sites
        """
        try:
            sites = self.service.get_active_sites(db)
            return [SitesListResponse.model_validate(site) for site in sites]
        except Exception as e:
            logger.error(f"Error getting active sites: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_site(
        self, 
        site_id: UUID, 
        site_data: SitesUpdate, 
        db: Session = Depends(get_db)
    ) -> SitesResponse:
        """
        Update a site.
        
        Args:
            site_id: Site ID
            site_data: Site update data
            db: Database session
            
        Returns:
            Updated site response
        """
        try:
            site = self.service.update_site(db, site_id, site_data)
            if not site:
                raise HTTPException(status_code=404, detail="Site not found")
            return SitesResponse.model_validate(site)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating site {site_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_site(
        self, 
        site_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete a site.
        
        Args:
            site_id: Site ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete(db, site_id)
            if not success:
                raise HTTPException(status_code=404, detail="Site not found")
            return {"message": "Site deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting site {site_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
sites_controller = SitesController()
