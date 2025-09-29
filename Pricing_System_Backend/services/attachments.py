"""
Attachments service for managing file attachments.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging
import os
import shutil
from pathlib import Path

from services.base import BaseService
from models.attachments import Attachments
from schemas.attachments import AttachmentsCreate, AttachmentsUpdate, AttachmentsUpload
from utils.error_handler import DatabaseError, NotFoundError, ValidationError
from config.settings import settings

logger = logging.getLogger(__name__)


class AttachmentsService(BaseService[Attachments]):
    """Service for managing attachments."""
    
    def __init__(self):
        super().__init__(Attachments)
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(exist_ok=True)
    
    def create_attachment(self, db: Session, attachment_data: AttachmentsCreate) -> Attachments:
        """
        Create a new attachment.
        
        Args:
            db: Database session
            attachment_data: Attachment creation data
            
        Returns:
            Created attachment instance
        """
        try:
            # Validate RFQ exists
            from models.general_purchase_rfq import GeneralPurchaseRFQ
            rfq = db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.id == attachment_data.rfq_id).first()
            if not rfq:
                raise ValidationError("RFQ not found", context={"rfq_id": str(attachment_data.rfq_id)})
            
            # Validate vendor exists if provided
            if attachment_data.vendor_id:
                from models.vendors import Vendors
                vendor = db.query(Vendors).filter(Vendors.id == attachment_data.vendor_id).first()
                if not vendor:
                    raise ValidationError("Vendor not found", context={"vendor_id": str(attachment_data.vendor_id)})
            
            attachment_dict = attachment_data.model_dump()
            return self.create(db, attachment_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating attachment: {str(e)}")
            raise DatabaseError("Failed to create attachment", context={"error": str(e)})
    
    def upload_file(self, db: Session, file_content: bytes, filename: str, upload_data: AttachmentsUpload) -> Attachments:
        """
        Upload a file and create attachment record.
        
        Args:
            db: Database session
            file_content: File content as bytes
            filename: Original filename
            upload_data: Upload metadata
            
        Returns:
            Created attachment instance
        """
        try:
            # Validate file size
            if len(file_content) > settings.MAX_FILE_SIZE:
                raise ValidationError("File size exceeds maximum allowed size", context={"size": len(file_content), "max_size": settings.MAX_FILE_SIZE})
            
            # Generate unique filename
            file_extension = Path(filename).suffix
            unique_filename = f"{UUID()}{file_extension}"
            file_path = self.upload_dir / unique_filename
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            # Create attachment record
            attachment_data = AttachmentsCreate(
                rfq_id=upload_data.rfq_id,
                vendor_id=upload_data.vendor_id,
                attachment_type=upload_data.attachment_type,
                file_name=filename,
                file_size=str(len(file_content)),
                mime_type=self._get_mime_type(file_extension)
            )
            
            attachment = self.create_attachment(db, attachment_data)
            
            # Update with file path
            self.update(db, attachment.id, {"file_path": str(file_path)})
            db.refresh(attachment)
            
            logger.info(f"Uploaded file {filename} for RFQ {upload_data.rfq_id}")
            return attachment
        except Exception as e:
            logger.error(f"Error uploading file {filename}: {str(e)}")
            raise DatabaseError("Failed to upload file", context={"filename": filename, "error": str(e)})
    
    def _get_mime_type(self, file_extension: str) -> str:
        """
        Get MIME type for file extension.
        
        Args:
            file_extension: File extension
            
        Returns:
            MIME type
        """
        mime_types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain'
        }
        return mime_types.get(file_extension.lower(), 'application/octet-stream')
    
    def get_attachments_by_rfq(self, db: Session, rfq_id: UUID) -> List[Attachments]:
        """
        Get attachments for an RFQ.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            List of attachments for the RFQ
        """
        try:
            return db.query(Attachments).filter(Attachments.rfq_id == rfq_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting attachments by RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to get attachments by RFQ", context={"rfq_id": str(rfq_id), "error": str(e)})
    
    def get_attachments_by_vendor(self, db: Session, vendor_id: UUID) -> List[Attachments]:
        """
        Get attachments by a vendor.
        
        Args:
            db: Database session
            vendor_id: Vendor ID
            
        Returns:
            List of attachments by the vendor
        """
        try:
            return db.query(Attachments).filter(Attachments.vendor_id == vendor_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting attachments by vendor {vendor_id}: {str(e)}")
            raise DatabaseError("Failed to get attachments by vendor", context={"vendor_id": str(vendor_id), "error": str(e)})
    
    def delete_attachment(self, db: Session, attachment_id: UUID) -> bool:
        """
        Delete an attachment and its file.
        
        Args:
            db: Database session
            attachment_id: Attachment ID
            
        Returns:
            True if deleted, False if not found
        """
        try:
            attachment = self.get(db, attachment_id)
            if not attachment:
                return False
            
            # Delete file if exists
            if attachment.file_path and os.path.exists(attachment.file_path):
                os.remove(attachment.file_path)
                logger.info(f"Deleted file {attachment.file_path}")
            
            # Delete database record
            return self.delete(db, attachment_id)
        except Exception as e:
            logger.error(f"Error deleting attachment {attachment_id}: {str(e)}")
            raise DatabaseError("Failed to delete attachment", context={"id": str(attachment_id), "error": str(e)})
    
    def get_file_content(self, db: Session, attachment_id: UUID) -> Optional[bytes]:
        """
        Get file content for an attachment.
        
        Args:
            db: Database session
            attachment_id: Attachment ID
            
        Returns:
            File content as bytes or None if not found
        """
        try:
            attachment = self.get(db, attachment_id)
            if not attachment or not attachment.file_path:
                return None
            
            if not os.path.exists(attachment.file_path):
                logger.warning(f"File not found: {attachment.file_path}")
                return None
            
            with open(attachment.file_path, "rb") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error getting file content for attachment {attachment_id}: {str(e)}")
            raise DatabaseError("Failed to get file content", context={"id": str(attachment_id), "error": str(e)})
