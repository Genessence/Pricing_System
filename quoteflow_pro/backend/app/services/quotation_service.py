from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models.quotation import Quotation, QuotationStatus
from app.models.quotation_item import QuotationItem
from app.models.supplier import Supplier
from app.models.rfq import RFQ
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationUpdate
from fastapi import HTTPException, status
import uuid

class QuotationService:
    @staticmethod
    def generate_quotation_number() -> str:
        """Generate unique quotation number"""
        return f"QT-{uuid.uuid4().hex[:8].upper()}"
    
    @staticmethod
    def create_quotation(db: Session, quotation_data: QuotationCreate, user_id: int) -> Quotation:
        """Create new quotation with validation"""
        # Validate RFQ exists
        rfq = db.query(RFQ).filter(RFQ.id == quotation_data.rfq_id).first()
        if not rfq:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFQ not found"
            )
        
        # Validate supplier exists
        supplier = db.query(Supplier).filter(Supplier.id == quotation_data.supplier_id).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier not found"
            )
        
        # Check if supplier already quoted for this RFQ
        existing_quotation = db.query(Quotation).filter(
            and_(
                Quotation.rfq_id == quotation_data.rfq_id,
                Quotation.supplier_id == quotation_data.supplier_id
            )
        ).first()
        
        if existing_quotation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier has already quoted for this RFQ"
            )
        
        # Generate quotation number
        quotation_number = QuotationService.generate_quotation_number()
        
        # Create quotation
        db_quotation = Quotation(
            rfq_id=quotation_data.rfq_id,
            supplier_id=quotation_data.supplier_id,
            quotation_number=quotation_number,
            total_amount=quotation_data.total_amount,
            currency=quotation_data.currency,
            validity_days=quotation_data.validity_days,
            delivery_days=quotation_data.delivery_days,
            terms_conditions=quotation_data.terms_conditions,
            comments=quotation_data.comments,
            status=QuotationStatus.SUBMITTED
        )
        db.add(db_quotation)
        db.commit()
        db.refresh(db_quotation)
        
        # Create quotation items
        for item_data in quotation_data.items:
            quotation_item = QuotationItem(
                quotation_id=db_quotation.id,
                rfq_item_id=item_data.rfq_item_id,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.total_price,
                delivery_days=item_data.delivery_days,
                notes=item_data.notes
            )
            db.add(quotation_item)
        
        db.commit()
        db.refresh(db_quotation)
        return db_quotation
    
    @staticmethod
    def get_quotations(
        db: Session,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        rfq_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        status: Optional[QuotationStatus] = None
    ) -> List[Quotation]:
        """Get quotations with filtering"""
        query = db.query(Quotation)
        
        # Apply filters
        if rfq_id:
            query = query.filter(Quotation.rfq_id == rfq_id)
        if supplier_id:
            query = query.filter(Quotation.supplier_id == supplier_id)
        if status:
            query = query.filter(Quotation.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_quotation(db: Session, quotation_id: int, current_user: User) -> Optional[Quotation]:
        """Get specific quotation by ID"""
        return db.query(Quotation).filter(Quotation.id == quotation_id).first()
    
    @staticmethod
    def update_quotation(
        db: Session,
        quotation_id: int,
        quotation_data: QuotationUpdate,
        current_user: User
    ) -> Quotation:
        """Update quotation with validation"""
        quotation = QuotationService.get_quotation(db, quotation_id, current_user)
        
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        # Check if quotation can be updated
        if quotation.status in [QuotationStatus.APPROVED, QuotationStatus.REJECTED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update approved/rejected quotation"
            )
        
        # Update fields
        for field, value in quotation_data.dict(exclude_unset=True).items():
            setattr(quotation, field, value)
        
        db.commit()
        db.refresh(quotation)
        return quotation
    
    @staticmethod
    def approve_quotation(
        db: Session,
        quotation_id: int,
        approver_id: int,
        comments: str = None
    ) -> Quotation:
        """Approve quotation (Admin only)"""
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        if quotation.status != QuotationStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only submitted quotations can be approved"
            )
        
        # Update status
        quotation.status = QuotationStatus.APPROVED
        quotation.reviewed_by = approver_id
        quotation.reviewed_at = func.now()
        if comments:
            quotation.comments = comments
        
        db.commit()
        db.refresh(quotation)
        return quotation
    
    @staticmethod
    def reject_quotation(
        db: Session,
        quotation_id: int,
        approver_id: int,
        comments: str = None
    ) -> Quotation:
        """Reject quotation (Admin only)"""
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )
        
        if quotation.status != QuotationStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only submitted quotations can be rejected"
            )
        
        # Update status
        quotation.status = QuotationStatus.REJECTED
        quotation.reviewed_by = approver_id
        quotation.reviewed_at = func.now()
        if comments:
            quotation.comments = comments
        
        db.commit()
        db.refresh(quotation)
        return quotation
    
    @staticmethod
    def get_quotations_by_rfq(db: Session, rfq_id: int) -> List[Quotation]:
        """Get all quotations for a specific RFQ"""
        return db.query(Quotation).filter(Quotation.rfq_id == rfq_id).all()
    
    @staticmethod
    def compare_quotations(db: Session, rfq_id: int) -> dict:
        """Compare quotations for an RFQ"""
        quotations = QuotationService.get_quotations_by_rfq(db, rfq_id)
        
        if not quotations:
            return {"message": "No quotations found for this RFQ"}
        
        comparison = {
            "rfq_id": rfq_id,
            "total_quotations": len(quotations),
            "quotations": []
        }
        
        for quotation in quotations:
            quotation_data = {
                "id": quotation.id,
                "quotation_number": quotation.quotation_number,
                "supplier": {
                    "id": quotation.supplier.id,
                    "company_name": quotation.supplier.company_name
                },
                "total_amount": quotation.total_amount,
                "currency": quotation.currency,
                "delivery_days": quotation.delivery_days,
                "validity_days": quotation.validity_days,
                "status": quotation.status,
                "submitted_at": quotation.submitted_at
            }
            comparison["quotations"].append(quotation_data)
        
        # Sort by total amount
        comparison["quotations"].sort(key=lambda x: x["total_amount"])
        
        return comparison
