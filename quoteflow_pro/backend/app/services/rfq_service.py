from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.rfq import RFQ, RFQStatus
from app.models.rfq_item import RFQItem
from app.models.user import User, UserRole
from app.schemas.rfq import RFQCreate, RFQUpdate
from fastapi import HTTPException, status

class RFQService:
    @staticmethod
    def create_rfq(db: Session, rfq_data: RFQCreate, user_id: int) -> RFQ:
        """Create new RFQ with validation"""
        # Validate business rules
        if rfq_data.total_value <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total value must be greater than 0"
            )
        
        # Create RFQ
        db_rfq = RFQ(
            title=rfq_data.title,
            description=rfq_data.description,
            commodity_type=rfq_data.commodity_type,
            total_value=rfq_data.total_value,
            currency=rfq_data.currency,
            user_id=user_id,
            status=RFQStatus.DRAFT
        )
        db.add(db_rfq)
        db.commit()
        db.refresh(db_rfq)
        
        # Create RFQ items
        for item_data in rfq_data.items:
            rfq_item = RFQItem(
                rfq_id=db_rfq.id,
                erp_item_id=item_data.erp_item_id,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                required_quantity=item_data.required_quantity,
                last_buying_price=item_data.last_buying_price,
                last_vendor=item_data.last_vendor
            )
            db.add(rfq_item)
        
        db.commit()
        db.refresh(db_rfq)
        return db_rfq
    
    @staticmethod
    def get_rfqs(
        db: Session,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        commodity_type: Optional[str] = None
    ) -> List[RFQ]:
        """Get RFQs with role-based filtering"""
        query = db.query(RFQ)
        
        # Apply role-based filtering
        if current_user.role == UserRole.USER:
            query = query.filter(RFQ.user_id == current_user.id)
        
        # Apply filters
        if status:
            query = query.filter(RFQ.status == status)
        if commodity_type:
            query = query.filter(RFQ.commodity_type == commodity_type)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_rfq(db: Session, rfq_id: int, current_user: User) -> Optional[RFQ]:
        """Get specific RFQ with permission check"""
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        
        if not rfq:
            return None
        
        # Check permissions
        if (current_user.role == UserRole.USER and 
            rfq.user_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this RFQ"
            )
        
        return rfq
    
    @staticmethod
    def update_rfq(
        db: Session,
        rfq_id: int,
        rfq_data: RFQUpdate,
        current_user: User
    ) -> RFQ:
        """Update RFQ with validation"""
        rfq = RFQService.get_rfq(db, rfq_id, current_user)
        
        if not rfq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        # Check if RFQ can be updated
        if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update approved/rejected RFQ"
            )
        
        # Update fields
        for field, value in rfq_data.dict(exclude_unset=True).items():
            setattr(rfq, field, value)
        
        db.commit()
        db.refresh(rfq)
        return rfq
    
    @staticmethod
    def delete_rfq(db: Session, rfq_id: int, current_user: User) -> bool:
        """Delete RFQ"""
        rfq = RFQService.get_rfq(db, rfq_id, current_user)
        
        if not rfq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        # Check if RFQ can be deleted
        if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete approved/rejected RFQ"
            )
        
        db.delete(rfq)
        db.commit()
        return True
    
    @staticmethod
    def approve_rfq(
        db: Session,
        rfq_id: int,
        approver_id: int,
        comments: str
    ) -> RFQ:
        """Approve RFQ (Admin only)"""
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        
        if not rfq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        if rfq.status != RFQStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending RFQs can be approved"
            )
        
        # Update status
        rfq.status = RFQStatus.APPROVED
        
        db.commit()
        db.refresh(rfq)
        
        return rfq
