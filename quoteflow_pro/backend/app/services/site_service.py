from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate
from fastapi import HTTPException, status

class SiteService:
    @staticmethod
    def get_sites(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: bool = True
    ) -> List[Site]:
        """Get sites with filtering and pagination"""
        query = db.query(Site)
        
        if is_active is not None:
            query = query.filter(Site.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_site(db: Session, site_id: int) -> Optional[Site]:
        """Get specific site by ID"""
        return db.query(Site).filter(Site.id == site_id).first()
    
    @staticmethod
    def get_site_by_code(db: Session, site_code: str) -> Optional[Site]:
        """Get specific site by site code"""
        return db.query(Site).filter(Site.site_code == site_code).first()
    
    @staticmethod
    def create_site(db: Session, site_data: SiteCreate, user_id: int) -> Site:
        """Create new site with validation"""
        # Check if site code already exists
        existing_site = db.query(Site).filter(
            Site.site_code == site_data.site_code
        ).first()
        
        if existing_site:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Site code already exists"
            )
        
        # Create new site
        db_site = Site(
            site_code=site_data.site_code,
            site_name=site_data.site_name,
            location=site_data.location,
            address=site_data.address,
            contact_person=site_data.contact_person,
            contact_email=site_data.contact_email,
            contact_phone=site_data.contact_phone,
            is_active=True
        )
        db.add(db_site)
        db.commit()
        db.refresh(db_site)
        return db_site
    
    @staticmethod
    def update_site(
        db: Session,
        site_id: int,
        site_data: SiteUpdate,
        current_user: User
    ) -> Site:
        """Update site with validation"""
        site = SiteService.get_site(db, site_id)
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Site not found"
            )
        
        # Check if site code is being changed and if it already exists
        if site_data.site_code and site_data.site_code != site.site_code:
            existing_site = db.query(Site).filter(
                and_(
                    Site.site_code == site_data.site_code,
                    Site.id != site_id
                )
            ).first()
            
            if existing_site:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Site code already exists"
                )
        
        # Update fields
        for field, value in site_data.dict(exclude_unset=True).items():
            setattr(site, field, value)
        
        db.commit()
        db.refresh(site)
        return site
    
    @staticmethod
    def delete_site(db: Session, site_id: int, current_user: User) -> bool:
        """Soft delete site (Admin only)"""
        site = SiteService.get_site(db, site_id)
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Site not found"
            )
        
        # Check if site has associated RFQs
        rfq_count = db.query(Site).join(Site.rfqs).filter(Site.id == site_id).count()
        if rfq_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete site with associated RFQs"
            )
        
        # Soft delete by setting is_active to False
        site.is_active = False
        db.commit()
        return True
    
    @staticmethod
    def search_sites(
        db: Session,
        query: str,
        limit: int = 20
    ) -> List[Site]:
        """Search sites by name or code"""
        search_query = db.query(Site).filter(
            and_(
                Site.is_active == True,
                or_(
                    Site.site_code.ilike(f"%{query}%"),
                    Site.site_name.ilike(f"%{query}%"),
                    Site.location.ilike(f"%{query}%")
                )
            )
        )
        
        return search_query.limit(limit).all()
