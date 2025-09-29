"""
Attachment routes for managing file attachments.
"""

from fastapi import APIRouter, Query, Path, UploadFile, File, Response
from typing import List, Optional
from uuid import UUID

from controllers.attachments import attachments_controller
from schemas.attachments import AttachmentsCreate, AttachmentsUpdate, AttachmentsResponse, AttachmentsListResponse

router = APIRouter()


@router.post("/", response_model=AttachmentsResponse, status_code=201)
async def create_attachment(attachment_data: AttachmentsCreate):
    """Create a new attachment."""
    return attachments_controller.create_attachment(attachment_data)


@router.post("/upload", response_model=AttachmentsResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    rfq_id: UUID = Query(..., description="RFQ ID"),
    vendor_id: Optional[UUID] = Query(None, description="Vendor ID"),
    attachment_type: Optional[str] = Query(None, description="Attachment type")
):
    """Upload a file and create attachment record."""
    return attachments_controller.upload_file(file, rfq_id, vendor_id, attachment_type)


@router.get("/", response_model=List[AttachmentsListResponse])
async def get_attachments(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return")
):
    """Get multiple attachments."""
    return attachments_controller.get_multi(skip=skip, limit=limit)


@router.get("/rfq/{rfq_id}", response_model=List[AttachmentsListResponse])
async def get_attachments_by_rfq(rfq_id: UUID = Path(..., description="RFQ ID")):
    """Get attachments for an RFQ."""
    return attachments_controller.get_attachments_by_rfq(rfq_id)


@router.get("/vendor/{vendor_id}", response_model=List[AttachmentsListResponse])
async def get_attachments_by_vendor(vendor_id: UUID = Path(..., description="Vendor ID")):
    """Get attachments by a vendor."""
    return attachments_controller.get_attachments_by_vendor(vendor_id)


@router.get("/{attachment_id}", response_model=AttachmentsResponse)
async def get_attachment(attachment_id: UUID = Path(..., description="Attachment ID")):
    """Get an attachment by ID."""
    return attachments_controller.get_attachment(attachment_id)


@router.get("/{attachment_id}/download")
async def download_file(attachment_id: UUID = Path(..., description="Attachment ID")):
    """Download file content for an attachment."""
    file_content = attachments_controller.download_file(attachment_id)
    return Response(content=file_content, media_type="application/octet-stream")


@router.put("/{attachment_id}", response_model=AttachmentsResponse)
async def update_attachment(
    attachment_data: AttachmentsUpdate,
    attachment_id: UUID = Path(..., description="Attachment ID")
):
    """Update an attachment."""
    return attachments_controller.update_attachment(attachment_id, attachment_data)


@router.delete("/{attachment_id}")
async def delete_attachment(attachment_id: UUID = Path(..., description="Attachment ID")):
    """Delete an attachment and its file."""
    return attachments_controller.delete_attachment(attachment_id)
