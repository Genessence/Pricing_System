"""
General Purchase RFQ service for managing RFQ operations.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
import logging
from datetime import datetime

from services.base import BaseService
from models.general_purchase_rfq import GeneralPurchaseRFQ
from schemas.general_purchase_rfq import GeneralPurchaseRFQCreate, GeneralPurchaseRFQUpdate, GeneralPurchaseRFQStatusUpdate
from utils.error_handler import DatabaseError, NotFoundError, ValidationError
from services.sites import SitesService
from services.users import UsersService

logger = logging.getLogger(__name__)


class GeneralPurchaseRFQService(BaseService[GeneralPurchaseRFQ]):
    """Service for managing RFQs."""
    
    def __init__(self):
        super().__init__(GeneralPurchaseRFQ)
        self.sites_service = SitesService()
        self.users_service = UsersService()
    
    def create_rfq(self, db: Session, rfq_data: GeneralPurchaseRFQCreate, creator_id: UUID) -> GeneralPurchaseRFQ:
        """
        Create a new RFQ.
        
        Args:
            db: Database session
            rfq_data: RFQ creation data
            creator_id: ID of the user creating the RFQ
            
        Returns:
            Created RFQ instance
        """
        try:
            # Validate creator exists
            creator = self.users_service.get(db, creator_id)
            if not creator:
                raise ValidationError("Creator user not found", context={"creator_id": str(creator_id)})
            
            # Validate site exists if provided
            if rfq_data.site_code:
                site = self.sites_service.get_site_by_code(db, rfq_data.site_code)
                if not site:
                    raise ValidationError("Site not found", context={"site_code": rfq_data.site_code})
            
            # Generate RFQ number
            rfq_number = self._generate_rfq_number(db, rfq_data.site_code)
            
            # Get next sitewise ID
            sitewise_id = None
            if rfq_data.site_code:
                sitewise_id = self.sites_service.increment_rfq_counter(db, rfq_data.site_code)
            
            rfq_dict = rfq_data.model_dump()
            rfq_dict["rfq_number"] = rfq_number
            rfq_dict["created_by"] = creator_id
            rfq_dict["sitewise_id"] = sitewise_id
            
            return self.create(db, rfq_dict)
        except SQLAlchemyError as e:
            logger.error(f"Error creating RFQ: {str(e)}")
            raise DatabaseError("Failed to create RFQ", context={"error": str(e)})
    
    def _generate_rfq_number(self, db: Session, site_code: Optional[str]) -> str:
        """
        Generate unique RFQ number.
        
        Args:
            db: Database session
            site_code: Site code for the RFQ
            
        Returns:
            Generated RFQ number
        """
        try:
            # Get current year
            current_year = datetime.now().year
            
            # Generate base number
            if site_code:
                base_number = f"RFQ-{site_code}-{current_year}-"
            else:
                base_number = f"RFQ-{current_year}-"
            
            # Find the next sequential number
            existing_rfqs = db.query(GeneralPurchaseRFQ).filter(
                GeneralPurchaseRFQ.rfq_number.like(f"{base_number}%")
            ).all()
            
            # Get the highest number
            max_number = 0
            for rfq in existing_rfqs:
                try:
                    number_part = rfq.rfq_number.split("-")[-1]
                    number = int(number_part)
                    max_number = max(max_number, number)
                except (ValueError, IndexError):
                    continue
            
            # Generate next number
            next_number = max_number + 1
            rfq_number = f"{base_number}{next_number:04d}"
            
            logger.info(f"Generated RFQ number: {rfq_number}")
            return rfq_number
        except SQLAlchemyError as e:
            logger.error(f"Error generating RFQ number: {str(e)}")
            raise DatabaseError("Failed to generate RFQ number", context={"error": str(e)})
    
    def get_rfq_by_number(self, db: Session, rfq_number: str) -> Optional[GeneralPurchaseRFQ]:
        """
        Get RFQ by number.
        
        Args:
            db: Database session
            rfq_number: RFQ number
            
        Returns:
            RFQ instance or None if not found
        """
        try:
            return db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.rfq_number == rfq_number).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting RFQ by number {rfq_number}: {str(e)}")
            raise DatabaseError("Failed to get RFQ by number", context={"rfq_number": rfq_number, "error": str(e)})
    
    def update_rfq_status(self, db: Session, rfq_id: UUID, status_data: GeneralPurchaseRFQStatusUpdate, approver_id: UUID) -> Optional[GeneralPurchaseRFQ]:
        """
        Update RFQ status.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            status_data: Status update data
            approver_id: ID of the user approving the RFQ
            
        Returns:
            Updated RFQ instance
        """
        try:
            # Validate approver exists
            approver = self.users_service.get(db, approver_id)
            if not approver:
                raise ValidationError("Approver user not found", context={"approver_id": str(approver_id)})
            
            # Get current RFQ
            rfq = self.get(db, rfq_id)
            if not rfq:
                raise NotFoundError("RFQ not found", context={"id": str(rfq_id)})
            
            # Validate status transition
            self._validate_status_transition(rfq.status, status_data.status)
            
            update_data = status_data.model_dump(exclude_unset=True)
            update_data["approved_by"] = approver_id
            
            return self.update(db, rfq_id, update_data)
        except SQLAlchemyError as e:
            logger.error(f"Error updating RFQ status {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to update RFQ status", context={"id": str(rfq_id), "error": str(e)})
    
    def _validate_status_transition(self, current_status: str, new_status: str) -> None:
        """
        Validate RFQ status transition.
        
        Args:
            current_status: Current RFQ status
            new_status: New RFQ status
            
        Raises:
            ValidationError: If transition is not allowed
        """
        # Define allowed transitions
        allowed_transitions = {
            "DRAFT": ["PENDING_APPROVAL", "CANCELLED"],
            "PENDING_APPROVAL": ["APPROVED", "CANCELLED"],
            "APPROVED": ["SENT_TO_VENDORS", "CANCELLED"],
            "SENT_TO_VENDORS": ["QUOTATIONS_RECEIVED", "CANCELLED"],
            "QUOTATIONS_RECEIVED": ["EVALUATION", "CANCELLED"],
            "EVALUATION": ["AWARDED", "CANCELLED"],
            "AWARDED": ["CLOSED"],
            "CLOSED": [],  # Terminal state
            "CANCELLED": []  # Terminal state
        }
        
        if new_status not in allowed_transitions.get(current_status, []):
            raise ValidationError(
                f"Invalid status transition from {current_status} to {new_status}",
                context={"current_status": current_status, "new_status": new_status}
            )
    
    def get_rfqs_by_status(self, db: Session, status: str) -> List[GeneralPurchaseRFQ]:
        """
        Get RFQs by status.
        
        Args:
            db: Database session
            status: RFQ status
            
        Returns:
            List of RFQs with the status
        """
        try:
            return db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.status == status).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting RFQs by status {status}: {str(e)}")
            raise DatabaseError("Failed to get RFQs by status", context={"status": status, "error": str(e)})
    
    def get_rfqs_by_creator(self, db: Session, creator_id: UUID) -> List[GeneralPurchaseRFQ]:
        """
        Get RFQs created by a user.
        
        Args:
            db: Database session
            creator_id: Creator user ID
            
        Returns:
            List of RFQs created by the user
        """
        try:
            return db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.created_by == creator_id).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting RFQs by creator {creator_id}: {str(e)}")
            raise DatabaseError("Failed to get RFQs by creator", context={"creator_id": str(creator_id), "error": str(e)})
    
    def get_rfqs_by_site(self, db: Session, site_code: str) -> List[GeneralPurchaseRFQ]:
        """
        Get RFQs for a specific site.
        
        Args:
            db: Database session
            site_code: Site code
            
        Returns:
            List of RFQs for the site
        """
        try:
            return db.query(GeneralPurchaseRFQ).filter(GeneralPurchaseRFQ.site_code == site_code).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting RFQs by site {site_code}: {str(e)}")
            raise DatabaseError("Failed to get RFQs by site", context={"site_code": site_code, "error": str(e)})
    
    def calculate_total_value(self, db: Session, rfq_id: UUID) -> Optional[int]:
        """
        Calculate total value for an RFQ based on quotations.
        
        Args:
            db: Database session
            rfq_id: RFQ ID
            
        Returns:
            Total value or None if no quotations
        """
        try:
            # This would need to be implemented based on the quotation models
            # For now, return None as placeholder
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error calculating total value for RFQ {rfq_id}: {str(e)}")
            raise DatabaseError("Failed to calculate total value", context={"rfq_id": str(rfq_id), "error": str(e)})
