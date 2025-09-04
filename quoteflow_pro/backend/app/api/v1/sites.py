from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse, SiteList
from app.services.site_service import SiteService

router = APIRouter()

@router.get("/", response_model=List[SiteList])
async def get_sites(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get sites with filtering and pagination.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        is_active: Filter by active status
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of sites matching criteria
    """
    return SiteService.get_sites(db, skip, limit, is_active)

@router.get("/search", response_model=List[SiteList])
async def search_sites(
    q: str = Query(..., description="Search query for site code, name, or location"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search sites by code, name, or location.
    
    Args:
        q: Search query
        limit: Maximum number of results
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of matching sites
    """
    return SiteService.search_sites(db, q, limit)

@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get specific site by ID.
    
    Args:
        site_id: Site ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Site details
        
    Raises:
        HTTPException: If site not found
    """
    site = SiteService.get_site(db, site_id)
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    return site

@router.post("/", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Create new site (Admin only).
    
    Args:
        site_data: Site creation data
        db: Database session
        current_user: Admin user
        
    Returns:
        Created site details
        
    Raises:
        HTTPException: If site code already exists or validation fails
    """
    return SiteService.create_site(db, site_data, current_user.id)

@router.put("/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: int,
    site_data: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Update site (Admin only).
    
    Args:
        site_id: Site ID
        site_data: Site update data
        db: Database session
        current_user: Admin user
        
    Returns:
        Updated site details
        
    Raises:
        HTTPException: If site not found or validation fails
    """
    return SiteService.update_site(db, site_id, site_data, current_user)

@router.delete("/{site_id}")
async def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Delete site (Admin only).
    
    Args:
        site_id: Site ID
        db: Database session
        current_user: Admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If site not found or has associated RFQs
    """
    SiteService.delete_site(db, site_id, current_user)
    return {"message": "Site deleted successfully"}
