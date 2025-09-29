"""
Attachments controller for managing file attachments.
"""

from typing import List, Optional
from fastapi import HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from config.database import get_db
from services.attachments import AttachmentsService
from schemas.attachments import AttachmentsCreate, AttachmentsUpdate, AttachmentsResponse, AttachmentsListResponse, AttachmentsUpload
from controllers.base import BaseController

logger = logging.getLogger(__name__)


class AttachmentsController(BaseController):
    """Controller for managing attachments."""
    
    def __init__(self):
        self.service = AttachmentsService()
        super().__init__(self.service, AttachmentsResponse)
    
    def create_attachment(
        self, 
        attachment_data: AttachmentsCreate, 
        db: Session = Depends(get_db)
    ) -> AttachmentsResponse:
        """
        Create a new attachment.
        
        Args:
            attachment_data: Attachment creation data
            db: Database session
            
        Returns:
            Created attachment response
        """
        try:
            attachment = self.service.create_attachment(db, attachment_data)
            return AttachmentsResponse.model_validate(attachment)
        except Exception as e:
            logger.error(f"Error creating attachment: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def upload_file(
        self, 
        file: UploadFile = File(...),
        rfq_id: UUID = Query(..., description="RFQ ID"),
        vendor_id: Optional[UUID] = Query(None, description="Vendor ID"),
        attachment_type: Optional[str] = Query(None, description="Attachment type"),
        db: Session = Depends(get_db)
    ) -> AttachmentsResponse:
        """
        Upload a file and create attachment record.
        
        Args:
            file: Uploaded file
            rfq_id: RFQ ID
            vendor_id: Vendor ID (optional)
            attachment_type: Attachment type (optional)
            db: Database session
            
        Returns:
            Created attachment response
        """
        try:
            # Read file content
            file_content = file.file.read()
            
            # Create upload data
            upload_data = AttachmentsUpload(
                rfq_id=rfq_id,
                vendor_id=vendor_id,
                attachment_type=attachment_type
            )
            
            attachment = self.service.upload_file(db, file_content, file.filename, upload_data)
            return AttachmentsResponse.model_validate(attachment)
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_attachment(
        self, 
        attachment_id: UUID, 
        db: Session = Depends(get_db)
    ) -> AttachmentsResponse:
        """
        Get an attachment by ID.
        
        Args:
            attachment_id: Attachment ID
            db: Database session
            
        Returns:
            Attachment response
        """
        try:
            attachment = self.service.get(db, attachment_id)
            if not attachment:
                raise HTTPException(status_code=404, detail="Attachment not found")
            return AttachmentsResponse.model_validate(attachment)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting attachment {attachment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_attachments_by_rfq(
        self, 
        rfq_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[AttachmentsListResponse]:
        """
        Get attachments for an RFQ.
        
        Args:
            rfq_id: RFQ ID
            db: Database session
            
        Returns:
            List of attachments for the RFQ
        """
        try:
            attachments = self.service.get_attachments_by_rfq(db, rfq_id)
            return [AttachmentsListResponse.model_validate(attachment) for attachment in attachments]
        except Exception as e:
            logger.error(f"Error getting attachments by RFQ {rfq_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_attachments_by_vendor(
        self, 
        vendor_id: UUID, 
        db: Session = Depends(get_db)
    ) -> List[AttachmentsListResponse]:
        """
        Get attachments by a vendor.
        
        Args:
            vendor_id: Vendor ID
            db: Database session
            
        Returns:
            List of attachments by the vendor
        """
        try:
            attachments = self.service.get_attachments_by_vendor(db, vendor_id)
            return [AttachmentsListResponse.model_validate(attachment) for attachment in attachments]
        except Exception as e:
            logger.error(f"Error getting attachments by vendor {vendor_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def download_file(
        self, 
        attachment_id: UUID, 
        db: Session = Depends(get_db)
    ) -> bytes:
        """
        Download file content for an attachment.
        
        Args:
            attachment_id: Attachment ID
            db: Database session
            
        Returns:
            File content as bytes
        """
        try:
            file_content = self.service.get_file_content(db, attachment_id)
            if file_content is None:
                raise HTTPException(status_code=404, detail="File not found")
            return file_content
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error downloading file for attachment {attachment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def update_attachment(
        self, 
        attachment_id: UUID, 
        attachment_data: AttachmentsUpdate, 
        db: Session = Depends(get_db)
    ) -> AttachmentsResponse:
        """
        Update an attachment.
        
        Args:
            attachment_id: Attachment ID
            attachment_data: Attachment update data
            db: Database session
            
        Returns:
            Updated attachment response
        """
        try:
            attachment = self.service.update(db, attachment_id, attachment_data.model_dump(exclude_unset=True))
            if not attachment:
                raise HTTPException(status_code=404, detail="Attachment not found")
            return AttachmentsResponse.model_validate(attachment)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating attachment {attachment_id}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def delete_attachment(
        self, 
        attachment_id: UUID, 
        db: Session = Depends(get_db)
    ) -> dict:
        """
        Delete an attachment and its file.
        
        Args:
            attachment_id: Attachment ID
            db: Database session
            
        Returns:
            Success message
        """
        try:
            success = self.service.delete_attachment(db, attachment_id)
            if not success:
                raise HTTPException(status_code=404, detail="Attachment not found")
            return {"message": "Attachment deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting attachment {attachment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


# Create controller instance
attachments_controller = AttachmentsController()
