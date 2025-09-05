from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.supplier import Supplier, SupplierStatus, SupplierCategory
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from fastapi import HTTPException, status

class SupplierService:
    @staticmethod
    def get_suppliers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[SupplierCategory] = None,
        status: Optional[SupplierStatus] = None,
        is_active: bool = True
    ) -> List[Supplier]:
        """Get suppliers with filtering and pagination"""
        query = db.query(Supplier)
        
        if category:
            query = query.filter(Supplier.category == category)
        if status:
            query = query.filter(Supplier.status == status)
        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_supplier(db: Session, supplier_id: int) -> Optional[Supplier]:
        """Get specific supplier by ID"""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    @staticmethod
    def search_suppliers(
        db: Session,
        query: str,
        category: Optional[SupplierCategory] = None,
        limit: int = 20
    ) -> List[Supplier]:
        """Search suppliers by name, contact person, or email"""
        search_query = db.query(Supplier).filter(
            and_(
                Supplier.is_active == True,
                or_(
                    Supplier.company_name.ilike(f"%{query}%"),
                    Supplier.contact_person.ilike(f"%{query}%"),
                    Supplier.email.ilike(f"%{query}%")
                )
            )
        )
        
        if category:
            search_query = search_query.filter(Supplier.category == category)
        
        return search_query.limit(limit).all()
    
    @staticmethod
    def create_supplier(db: Session, supplier_data: SupplierCreate, user_id: int) -> Supplier:
        """Create new supplier with validation"""
        # Check if email already exists
        existing_supplier = db.query(Supplier).filter(
            Supplier.email == supplier_data.email
        ).first()
        
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier with this email already exists"
            )
        
        # Create new supplier
        db_supplier = Supplier(
            name=supplier_data.name,
            vendor_code=supplier_data.vendor_code,
            company_name=supplier_data.company_name,
            contact_person=supplier_data.contact_person,
            email=supplier_data.email,
            phone=supplier_data.phone,
            address=supplier_data.address,
            city=supplier_data.city,
            state=supplier_data.state,
            country=supplier_data.country,
            postal_code=supplier_data.postal_code,
            tax_id=supplier_data.tax_id,
            gst_number=supplier_data.gst_number,
            category=supplier_data.category,
            notes=supplier_data.notes,
            status=SupplierStatus.PENDING_APPROVAL,
            is_active=True
        )
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    
    @staticmethod
    def update_supplier(
        db: Session,
        supplier_id: int,
        supplier_data: SupplierUpdate,
        current_user: User
    ) -> Supplier:
        """Update supplier with validation"""
        supplier = SupplierService.get_supplier(db, supplier_id)
        
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        # Check if email is being changed and if it already exists
        if supplier_data.email and supplier_data.email != supplier.email:
            existing_supplier = db.query(Supplier).filter(
                and_(
                    Supplier.email == supplier_data.email,
                    Supplier.id != supplier_id
                )
            ).first()
            
            if existing_supplier:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Supplier with this email already exists"
                )
        
        # Update fields
        for field, value in supplier_data.dict(exclude_unset=True).items():
            setattr(supplier, field, value)
        
        db.commit()
        db.refresh(supplier)
        return supplier
    
    @staticmethod
    def delete_supplier(db: Session, supplier_id: int, current_user: User) -> bool:
        """Soft delete supplier"""
        supplier = SupplierService.get_supplier(db, supplier_id)
        
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        # Check if supplier has associated quotations
        quotation_count = db.query(Supplier).join(Supplier.quotations).filter(Supplier.id == supplier_id).count()
        if quotation_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete supplier with associated quotations"
            )
        
        # Soft delete by setting is_active to False
        supplier.is_active = False  # type: ignore
        db.commit()
        return True
    
    @staticmethod
    def approve_supplier(db: Session, supplier_id: int, current_user: User) -> Supplier:
        """Approve supplier (Admin only)"""
        supplier = SupplierService.get_supplier(db, supplier_id)
        
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        if str(supplier.status) != SupplierStatus.PENDING_APPROVAL.value:  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending suppliers can be approved"
            )
        
        supplier.status = SupplierStatus.ACTIVE.value  # type: ignore
        db.commit()
        db.refresh(supplier)
        return supplier
    
    @staticmethod
    def reject_supplier(db: Session, supplier_id: int, current_user: User, reason: Optional[str] = None) -> Supplier:
        """Reject supplier (Admin only)"""
        supplier = SupplierService.get_supplier(db, supplier_id)
        
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        if str(supplier.status) != SupplierStatus.PENDING_APPROVAL.value:  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending suppliers can be rejected"
            )
        
        supplier.status = SupplierStatus.INACTIVE.value  # type: ignore
        if reason:
            supplier.notes = f"Rejected: {reason}"  # type: ignore
        db.commit()
        db.refresh(supplier)
        return supplier
