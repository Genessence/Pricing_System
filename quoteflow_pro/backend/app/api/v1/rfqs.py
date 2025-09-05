from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.schemas.rfq import RFQCreate, RFQUpdate, RFQResponse, RFQList, RFQItemCreate, QuoteData
from app.schemas.quotation import QuotationCreate, QuotationItemCreate
from app.models.rfq import RFQ, RFQStatus
from app.models.rfq_item import RFQItem
from app.models.erp_item import ERPItem
from app.models.quotation import Quotation
from app.models.quotation_item import QuotationItem
from app.models.user import User, UserRole
from app.models.site import Site
from app.models.supplier import Supplier
from app.core.exceptions import PermissionDenied, ResourceNotFound, ValidationError
from sqlalchemy import and_

router = APIRouter()

def generate_rfq_number(db: Session, site_code: str) -> str:
    """Generate unique RFQ number with GP prefix and site code using global sequence"""
    # Get the highest existing RFQ number across ALL sites (global sequence)
    last_rfq = db.query(RFQ).order_by(RFQ.id.desc()).first()
    
    if last_rfq and last_rfq.rfq_number is not None:
        # Extract global sequence number from any existing RFQ
        try:
            parts = last_rfq.rfq_number.split('-')
            if len(parts) == 3 and parts[0] == 'GP':
                last_sequence = int(parts[2])
                next_sequence = last_sequence + 1
            else:
                next_sequence = 1
        except (IndexError, ValueError):
            next_sequence = 1
    else:
        next_sequence = 1
    
    return f"GP-{site_code}-{next_sequence:03d}"

def generate_quotation_number(db: Session, rfq_number: str, supplier_code: str) -> str:
    """Generate unique quotation number based on RFQ number and supplier"""
    # Format: Q-{RFQ_NUMBER}-{SUPPLIER_CODE}-{SEQUENCE}
    base_number = f"Q-{rfq_number}-{supplier_code}"
    
    # Get the highest existing quotation number for this RFQ and supplier
    last_quotation = db.query(Quotation).filter(
        Quotation.quotation_number.like(f"{base_number}%")
    ).order_by(Quotation.id.desc()).first()
    
    if last_quotation and last_quotation.quotation_number is not None:
        try:
            # Extract sequence number
            sequence_part = last_quotation.quotation_number.split('-')[-1]
            next_sequence = int(sequence_part) + 1
        except (IndexError, ValueError):
            next_sequence = 1
    else:
        next_sequence = 1
    
    return f"{base_number}-{next_sequence:03d}"

@router.post("/", response_model=RFQResponse)
def create_rfq(
    rfq_data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create new RFQ with items and optional quotations."""

    # ✅ Business rule validation: Total value must be > 0
    if rfq_data.total_value <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total value must be greater than 0"
        )

    # ✅ Validate site exists
    site = db.query(Site).filter(Site.id == rfq_data.site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid site ID"
        )

    # ✅ Generate unique RFQ number using site code
    rfq_number = generate_rfq_number(db, str(site.site_code))
    print(f"Creating RFQ with number: {rfq_number}")

    # ✅ Create and add RFQ to DB
    db_rfq = RFQ(
        rfq_number=rfq_number,
        title=rfq_data.title,
        description=rfq_data.description,
        commodity_type=rfq_data.commodity_type,
        total_value=rfq_data.total_value,
        currency=rfq_data.currency,
        user_id=current_user.id,
        site_id=rfq_data.site_id,
        status=RFQStatus.PENDING
    )
    db.add(db_rfq)
    db.flush()  # Get generated RFQ ID
    print(f"RFQ created with ID: {db_rfq.id}")

    # ✅ Add RFQ items
    for item_data in rfq_data.items:
        if item_data.erp_item_id:
            erp_item = db.query(ERPItem).filter(ERPItem.id == item_data.erp_item_id).first()
            if erp_item:
                db_item = RFQItem(
                    rfq_id=db_rfq.id,
                    erp_item_id=item_data.erp_item_id,
                    item_code=erp_item.item_code,
                    description=erp_item.description,
                    specifications=erp_item.specifications,
                    unit_of_measure=erp_item.unit_of_measure,
                    required_quantity=item_data.required_quantity,
                    last_buying_price=item_data.last_buying_price,
                    last_vendor=item_data.last_vendor
                )
                print(f"Adding RFQ item from ERP: {erp_item.item_code}")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"ERP item with ID {item_data.erp_item_id} not found"
                )
        else:
            db_item = RFQItem(
                rfq_id=db_rfq.id,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                required_quantity=item_data.required_quantity,
                last_buying_price=item_data.last_buying_price,
                last_vendor=item_data.last_vendor
            )
            print(f"Adding manual RFQ item: {item_data.item_code}")

        db.add(db_item)

    # ✅ Handle quotations if provided
    if rfq_data.quotes:
        print(f"Processing {len(rfq_data.quotes)} quotations")

        for quote_data in rfq_data.quotes:
            # Validate supplier exists
            supplier = db.query(Supplier).filter(Supplier.id == quote_data.supplierId).first()
            if not supplier:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Supplier with ID {quote_data.supplierId} not found"
                )

            # Calculate total from rates
            total_amount = sum(quote_data.rates.values())

            # Generate quotation number
            quotation_number = generate_quotation_number(db, rfq_number, str(supplier.vendor_code))
            print(f"Creating quotation {quotation_number} for supplier {supplier.vendor_code}")

            # Create and add quotation
            db_quotation = Quotation(
                rfq_id=db_rfq.id,
                supplier_id=quote_data.supplierId,
                quotation_number=quotation_number,
                total_amount=total_amount,
                currency=quote_data.footer.currency or rfq_data.currency,
                validity_days=30,
                delivery_days=0,
                terms_conditions=quote_data.footer.remarks_of_quotation,
                comments=f"Delivery: {quote_data.footer.delivery_lead_time or 'N/A'}, "
                         f"Packing: {quote_data.footer.packing_charges or 'N/A'}, "
                         f"Transport: {quote_data.footer.transportation_freight or 'N/A'}, "
                         f"Warranty: {quote_data.footer.warranty or 'N/A'}"
            )
            db.add(db_quotation)
            db.flush()  # Get quotation ID
            print(f"Quotation added with ID: {db_quotation.id}")

            # Add quotation items
            for rfq_item in db_rfq.items:
                if rfq_item.id in quote_data.rates:
                    unit_price = quote_data.rates[rfq_item.id]
                    total_price = unit_price * rfq_item.required_quantity

                    db_quotation_item = QuotationItem(
                        quotation_id=db_quotation.id,
                        rfq_item_id=rfq_item.id,
                        item_code=rfq_item.item_code,
                        description=rfq_item.description,
                        specifications=rfq_item.specifications,
                        unit_of_measure=rfq_item.unit_of_measure,
                        quantity=rfq_item.required_quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        delivery_days=0,
                        notes=None
                    )
                    db.add(db_quotation_item)
                    print(f"Added quote item for RFQ item ID {rfq_item.id} with unit price {unit_price}")

    # ✅ Commit everything to the database
    db.commit()
    print(f"RFQ and related records committed to the database.")

    # ✅ Refresh and attach user/site for response
    db.refresh(db_rfq)
    db_rfq.user = current_user
    db_rfq.site = site

    return db_rfq


@router.get("/", response_model=List[RFQList])
def get_rfqs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    commodity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get RFQs with filtering and pagination."""
    from sqlalchemy.orm import joinedload
    
    query = db.query(RFQ).options(
        joinedload(RFQ.user),
        joinedload(RFQ.site)
    )
    
    # Apply role-based filtering
    if str(current_user.role) == UserRole.USER.value:
        query = query.filter(RFQ.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(RFQ.status == status)
    if commodity_type:
        query = query.filter(RFQ.commodity_type == commodity_type)
    
    rfqs = query.offset(skip).limit(limit).all()
    return rfqs

@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific RFQ by ID."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (str(current_user.role) == UserRole.USER.value and 
        rfq.user_id != current_user.id):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")
    
    return rfq

@router.put("/{rfq_id}", response_model=RFQResponse)
def update_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (str(current_user.role) == UserRole.USER.value and 
        rfq.user_id != current_user.id):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")
    
    # Check if RFQ can be updated
    if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
        raise ValidationError("Cannot update approved/rejected RFQ")
    
    # Update fields
    for field, value in rfq_data.dict(exclude_unset=True).items():
        setattr(rfq, field, value)
    
    db.commit()
    db.refresh(rfq)
    
    return rfq

@router.delete("/clear-test-data")
def clear_test_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Clear all test RFQ data (Admin only, for testing purposes)."""
    # Clear all test RFQ data
    db.query(RFQ).delete()
    db.commit()
    return {"message": "Test data cleared successfully"}

@router.delete("/{rfq_id}")
def delete_rfq(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if (str(current_user.role) == UserRole.USER.value and 
        rfq.user_id != current_user.id):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")
    
    # Check if RFQ can be deleted
    if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
        raise ValidationError("Cannot delete approved/rejected RFQ")
    
    db.delete(rfq)
    db.commit()
    
    return {"message": "RFQ deleted successfully"}

@router.post("/{rfq_id}/approve")
def approve_rfq(
    rfq_id: int,
    comments: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Approve RFQ (Admin only)."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if str(rfq.status) != RFQStatus.PENDING.value:
        raise ValidationError("Only pending RFQs can be approved")
    
    # Update status
    rfq.status = RFQStatus.APPROVED.value  # type: ignore
    
    db.commit()
    db.refresh(rfq)
    
    return {"message": "RFQ approved successfully", "rfq": rfq}
