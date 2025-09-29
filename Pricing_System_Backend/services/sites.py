"""
Sites service for managing company locations.
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging

from services.base import BaseService
from models.sites import Sites
from schemas.sites import SitesCreate, SitesUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError

logger = logging.getLogger(__name__)


class SitesService(BaseService[Sites]):
    """Service for managing sites."""
    
    def __init__(self):
        super().__init__(Sites)
    
    def create_site(self, db: Session, site_data: SitesCreate) -> Sites:
        """
        Create a new site.
        
        Args:
            db: Database session
            site_data: Site creation data
            
        Returns:
            Created site instance
        """
        try:
            # Check if site code already exists
            existing_site = db.query(Sites).filter(Sites.code == site_data.code).first()
            if existing_site:
                raise ValidationError("Site code already exists", context={"code": site_data.code})
            
            site_dict = site_data.model_dump()
            return self.create(db, site_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating site: {str(e)}")
            raise DatabaseError("Failed to create site", context={"error": str(e)})
    
    def get_site_by_code(self, db: Session, code: str) -> Optional[Sites]:
        """
        Get site by code.
        
        Args:
            db: Database session
            code: Site code
            
        Returns:
            Site instance or None if not found
        """
        try:
            return db.query(Sites).filter(Sites.code == code).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting site by code {code}: {str(e)}")
            raise DatabaseError("Failed to get site by code", context={"code": code, "error": str(e)})
    
    def update_site(self, db: Session, site_id: UUID, site_data: SitesUpdate) -> Optional[Sites]:
        """
        Update a site.
        
        Args:
            db: Database session
            site_id: Site ID
            site_data: Site update data
            
        Returns:
            Updated site instance
        """
        try:
            # Check if code is being updated and if it conflicts
            if site_data.code:
                existing_site = db.query(Sites).filter(
                    Sites.code == site_data.code,
                    Sites.id != site_id
                ).first()
                if existing_site:
                    raise ValidationError("Site code already exists", context={"code": site_data.code})
            
            update_data = site_data.model_dump(exclude_unset=True)
            return self.update(db, site_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating site {site_id}: {str(e)}")
            raise DatabaseError("Failed to update site", context={"id": str(site_id), "error": str(e)})
    
    def get_active_sites(self, db: Session) -> List[Sites]:
        """
        Get all active sites.
        
        Args:
            db: Database session
            
        Returns:
            List of active sites
        """
        try:
            return db.query(Sites).filter(Sites.is_active == True).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting active sites: {str(e)}")
            raise DatabaseError("Failed to get active sites", context={"error": str(e)})
    
    def increment_rfq_counter(self, db: Session, site_code: str) -> int:
        """
        Increment and return the next RFQ sitewise ID for a site.
        
        Args:
            db: Database session
            site_code: Site code
            
        Returns:
            Next RFQ sitewise ID
        """
        try:
            site = self.get_site_by_code(db, site_code)
            if not site:
                raise NotFoundError("Site not found", context={"code": site_code})
            
            # Update the counter using SQLAlchemy update
            from sqlalchemy import update
            current_counter = int(site.last_rfq_sitewise_id)
            new_counter = current_counter + 1
            
            stmt = update(Sites).where(Sites.code == site_code).values(last_rfq_sitewise_id=new_counter)
            db.execute(stmt)
            db.commit()
            
            logger.info(f"Incremented RFQ counter for site {site_code} to {new_counter}")
            return new_counter
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error incrementing RFQ counter for site {site_code}: {str(e)}")
            raise DatabaseError("Failed to increment RFQ counter", context={"code": site_code, "error": str(e)})
