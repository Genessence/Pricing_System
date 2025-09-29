"""
Site routes for managing company locations.
"""

from fastapi import APIRouter, Query, Path
from typing import List, Optional
from uuid import UUID

from controllers.sites import sites_controller
from schemas.sites import SitesCreate, SitesUpdate, SitesResponse, SitesListResponse

router = APIRouter()


@router.post("/", response_model=SitesResponse, status_code=201)
async def create_site(site_data: SitesCreate):
    """Create a new site."""
    return sites_controller.create_site(site_data)


@router.get("/", response_model=List[SitesListResponse])
async def get_sites(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status")
):
    """Get multiple sites with optional filtering."""
    return sites_controller.get_sites(skip=skip, limit=limit, is_active=is_active)


@router.get("/active", response_model=List[SitesListResponse])
async def get_active_sites():
    """Get all active sites."""
    return sites_controller.get_active_sites()


@router.get("/{site_id}", response_model=SitesResponse)
async def get_site(site_id: UUID = Path(..., description="Site ID")):
    """Get a site by ID."""
    return sites_controller.get_site(site_id)


@router.get("/code/{code}", response_model=SitesResponse)
async def get_site_by_code(code: str = Path(..., description="Site code")):
    """Get a site by code."""
    return sites_controller.get_site_by_code(code)


@router.put("/{site_id}", response_model=SitesResponse)
async def update_site(
    site_id: UUID = Path(..., description="Site ID"),
    site_data: SitesUpdate = None
):
    """Update a site."""
    return sites_controller.update_site(site_id, site_data)


@router.delete("/{site_id}")
async def delete_site(site_id: UUID = Path(..., description="Site ID")):
    """Delete a site."""
    return sites_controller.delete_site(site_id)
