from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user, get_admin_user
from app.schemas.rfq import (
    RFQCreate,
    RFQUpdate,
    RFQResponse,
    RFQList,
    RFQItemCreate,
    QuoteData,
)
from app.schemas.quotation import QuotationCreate, QuotationItemCreate
from app.schemas.final_decision import (
    FinalDecisionCreate,
    FinalDecisionUpdate,
    FinalDecisionResponse,
    FinalDecisionWithDetails,
    FinalDecisionItemCreate,
)
from app.models.rfq import RFQ, RFQStatus
from app.models.rfq_item import RFQItem
from app.models.erp_item import ERPItem
from app.models.transport_item import TransportItem
from app.models.quotation import Quotation
from app.models.quotation_item import QuotationItem
from app.models.user import User, UserRole
from app.models.site import Site
from app.models.supplier import Supplier
from app.models.final_decision import FinalDecision
from app.models.final_decision_item import FinalDecisionItem
from app.core.exceptions import PermissionDenied, ResourceNotFound, ValidationError
from sqlalchemy import and_, func

router = APIRouter()


def generate_rfq_number(db: Session, site_code: str) -> str:
    """Generate unique RFQ number with GP prefix and site code using global sequence"""
    # Get the highest existing RFQ number across ALL sites (global sequence)
    last_rfq = db.query(RFQ).order_by(RFQ.id.desc()).first()

    if last_rfq and last_rfq.rfq_number is not None:
        # Extract global sequence number from any existing RFQ
        try:
            parts = last_rfq.rfq_number.split("-")
            if len(parts) == 3 and parts[0] == "GP":
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
    last_quotation = (
        db.query(Quotation)
        .filter(Quotation.quotation_number.like(f"{base_number}%"))
        .order_by(Quotation.id.desc())
        .first()
    )

    if last_quotation and last_quotation.quotation_number is not None:
        try:
            # Extract sequence number
            sequence_part = last_quotation.quotation_number.split("-")[-1]
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
    current_user: User = Depends(get_current_active_user),
):
    """Create new RFQ with items and optional quotations."""

    # ✅ Business rule validation: Total value must be > 0
    if rfq_data.total_value <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total value must be greater than 0",
        )

    # ✅ Validate site exists
    site = db.query(Site).filter(Site.id == rfq_data.site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid site ID"
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
        status=RFQStatus.PENDING,
    )
    db.add(db_rfq)
    db.flush()  # Get generated RFQ ID
    print(f"RFQ created with ID: {db_rfq.id}")

    # ✅ Add RFQ items and collect their IDs for quotation mapping
    rfq_item_ids = []  # Store RFQ item IDs in order for quotation mapping
    for item_data in rfq_data.items:
        if item_data.erp_item_id:
            erp_item = (
                db.query(ERPItem).filter(ERPItem.id == item_data.erp_item_id).first()
            )
            if erp_item:
                db_item = RFQItem(
                    rfq_id=db_rfq.id,
                    erp_item_id=item_data.erp_item_id,
                    transport_item_id=None,
                    item_code=erp_item.item_code,
                    description=erp_item.description,
                    specifications=erp_item.specifications,
                    unit_of_measure=erp_item.unit_of_measure,
                    required_quantity=item_data.required_quantity,
                    last_buying_price=item_data.last_buying_price,
                    last_vendor=item_data.last_vendor,
                )
                print(f"Adding RFQ item from ERP: {erp_item.item_code}")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"ERP item with ID {item_data.erp_item_id} not found",
                )
        elif hasattr(item_data, "transport_data") and item_data.transport_data:
            # Handle transport items
            transport_data = item_data.transport_data
            transport_item = TransportItem(
                from_location=transport_data.from_location,
                to_location=transport_data.to_location,
                vehicle_size=transport_data.vehicle_size,
                load=transport_data.load,
                dimensions=transport_data.dimensions,
                frequency=transport_data.frequency,
            )
            db.add(transport_item)
            db.flush()  # Get transport item ID

            db_item = RFQItem(
                rfq_id=db_rfq.id,
                erp_item_id=None,
                transport_item_id=transport_item.id,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                required_quantity=item_data.required_quantity,
                last_buying_price=item_data.last_buying_price,
                last_vendor=item_data.last_vendor,
            )
            print(f"Adding RFQ item from Transport: {item_data.item_code}")
        else:
            db_item = RFQItem(
                rfq_id=db_rfq.id,
                erp_item_id=None,
                transport_item_id=None,
                item_code=item_data.item_code,
                description=item_data.description,
                specifications=item_data.specifications,
                unit_of_measure=item_data.unit_of_measure,
                required_quantity=item_data.required_quantity,
                last_buying_price=item_data.last_buying_price,
                last_vendor=item_data.last_vendor,
            )
            print(f"Adding manual RFQ item: {item_data.item_code}")

        db.add(db_item)
        db.flush()  # Get the generated RFQ item ID
        rfq_item_ids.append(db_item.id)  # Store the ID for quotation mapping

    # ✅ Handle quotations if provided
    if rfq_data.quotes:
        print(f"Processing {len(rfq_data.quotes)} quotations")

        for quote_data in rfq_data.quotes:
            # Validate supplier exists
            supplier = (
                db.query(Supplier).filter(Supplier.id == quote_data.supplierId).first()
            )
            if not supplier:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Supplier with ID {quote_data.supplierId} not found",
                )

            # Calculate total from rates
            total_amount = sum(quote_data.rates.values())

            # Validate total amount is greater than 0
            if total_amount <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Total amount for quotation must be greater than 0. Current total: {total_amount}",
                )

            # Generate quotation number
            quotation_number = generate_quotation_number(
                db, rfq_number, str(supplier.vendor_code)
            )
            print(
                f"Creating quotation {quotation_number} for supplier {supplier.vendor_code}"
            )

            # Create and add quotation
            db_quotation = Quotation(
                rfq_id=db_rfq.id,
                supplier_id=quote_data.supplierId,
                quotation_number=quotation_number,
                total_amount=total_amount,
                currency=quote_data.footer.currency or rfq_data.currency,
                validity_days=30,
                delivery_days=0,
                transportation_freight=quote_data.footer.transportation_freight or 0.0,
                packing_charges=quote_data.footer.packing_charges or 0.0,
                delivery_lead_time=quote_data.footer.delivery_lead_time or 0,
                warranty=quote_data.footer.warranty,
                terms_conditions=quote_data.footer.remarks_of_quotation,
                comments=None,
            )
            db.add(db_quotation)
            db.flush()  # Get quotation ID
            print(f"Quotation added with ID: {db_quotation.id}")

            print(f"DEBUG: RFQ data: {rfq_data}")

            # Add quotation items - map rates to RFQ items from request data
            # Use the RFQ items from the original request data for mapping
            for index, rfq_item_data in enumerate(rfq_data.items):
                # Determine rate key based on item type
                if (
                    hasattr(rfq_item_data, "transport_data")
                    and rfq_item_data.transport_data
                ):
                    # For transport items, extract the numeric ID from item_code (format: TRANS_<id>)
                    rate_key = rfq_item_data.item_code.replace("TRANS_", "")
                else:
                    # For regular RFQ items, use the item_code directly
                    rate_key = str(rfq_item_data.item_code)

                print(f"DEBUG: Rate key: {rate_key}")
                print(f"DEBUG: Quote data: {quote_data.rates}")

                # Check if rate exists for this item
                if rate_key in map(str, quote_data.rates.keys()):
                    unit_price = quote_data.rates[int(rate_key)]
                    total_price = unit_price * rfq_item_data.required_quantity

                    # Create quotation item using actual RFQ item ID
                    quotation_item = QuotationItem(
                        quotation_id=db_quotation.id,
                        rfq_item_id=rfq_item_ids[index],  # Use actual RFQ item ID
                        item_code=rfq_item_data.item_code,
                        description=rfq_item_data.description,
                        specifications=rfq_item_data.specifications,
                        unit_of_measure=rfq_item_data.unit_of_measure,
                        quantity=rfq_item_data.required_quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        delivery_days=0,
                        notes=None,
                    )
                    db.add(quotation_item)
                    print(
                        f"Added quotation item for RFQ item {rfq_item_data.item_code} with unit price {unit_price}"
                    )
                else:
                    print(
                        f"Warning: No rate found for RFQ item at index {index+1} (item_code: {rfq_item_data.item_code}, rate_key: {rate_key})"
                    )

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
    current_user: User = Depends(get_current_active_user),
):
    """Get RFQs with filtering and pagination."""
    from sqlalchemy.orm import joinedload

    query = db.query(RFQ).options(joinedload(RFQ.user), joinedload(RFQ.site))

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
    format: Optional[str] = "frontend",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get specific RFQ by ID with quotations data."""
    from sqlalchemy.orm import joinedload

    # Query RFQ with all related data including quotations, items, suppliers, and final decisions
    rfq = (
        db.query(RFQ)
        .options(
            joinedload(RFQ.user),
            joinedload(RFQ.site),
            joinedload(RFQ.items).joinedload(RFQItem.transport_item),
            joinedload(RFQ.quotations).joinedload(Quotation.supplier),
            joinedload(RFQ.quotations).joinedload(Quotation.items),
            joinedload(RFQ.final_decisions).joinedload(FinalDecision.items),
        )
        .filter(RFQ.id == rfq_id)
        .first()
    )

    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    # Check permissions
    if (
        str(current_user.role) == UserRole.USER.value and rfq.user_id != current_user.id
    ):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")

    # Map commodity type for display and raw
    rfq_status_raw = str(rfq.status)
    rfq_status_display = {
        "RFQStatus.DRAFT": "Draft",
        "RFQStatus.PENDING": "Pending",
        "RFQStatus.APPROVED": "Approved",
        "RFQStatus.REJECTED": "Rejected",
        "RFQStatus.CANCELLED": "Cancelled",
    }.get(rfq_status_raw, rfq_status_raw.title())

    # Map commodity type for display and raw
    commodity_type_raw = str(rfq.commodity_type)

    commodity_type_key = commodity_type_raw.split(".")[1].upper()

    commodity_type_display = {
        "PROVIDED_DATA": "Provided Data",
        "SERVICE": "Service",
        "TRANSPORT": "Transport",
    }.get(commodity_type_key)

    # Build suppliers list for comprehensive response
    suppliers_list = []
    for q in rfq.quotations:
        supplier = q.supplier
        supplier_items = []
        for qi in q.items:
            supplier_items.append(
                {
                    "itemId": qi.rfq_item_id,
                    "unitPrice": qi.unit_price,
                    "totalPrice": qi.total_price,
                    "deliveryTime": (
                        f"{qi.delivery_days} days" if qi.delivery_days else None
                    ),
                    "warranty": q.warranty,
                    "notes": qi.notes,
                }
            )

        suppliers_list.append(
            {
                "id": supplier.id if supplier else q.supplier_id,
                "name": supplier.company_name if supplier else None,
                "contact": supplier.email if supplier else None,
                "rating": supplier.rating if supplier else None,
                "items": supplier_items,
                "totalQuote": q.total_amount,
                "attachments": [],
                "termsConditions": q.terms_conditions,
                "currency": q.currency,
                "warranty": q.warranty,
                "deliveryLeadTime": q.delivery_lead_time,
                "packagingCharges": q.packing_charges,
                "transportationFreight": q.transportation_freight,
            }
        )

    # Optional frontend-friendly format
    if format == "frontend":
        # RFQ items list for top-level items array
        items_for_frontend = []
        for item in rfq.items:
            item_payload = {
                "id": item.id,
                "item_code": item.item_code,
                "erp_item_id": item.erp_item_id,
                "description": item.description,
                "specifications": item.specifications,
                "quantity": item.required_quantity,
                "unitOfMeasure": item.unit_of_measure,
                "lastBuyingPrice": item.last_buying_price,
                "lastVendor": item.last_vendor,
            }
            # Attach transport details if present
            if item.transport_item is not None:
                item_payload["transportDetails"] = {
                    "fromLocation": item.transport_item.from_location,
                    "toLocation": item.transport_item.to_location,
                    "vehicleSize": item.transport_item.vehicle_size,
                    "load": item.transport_item.load,
                    "dimensions": item.transport_item.dimensions,
                    "frequency": item.transport_item.frequency,
                }
            items_for_frontend.append(item_payload)

        # Build final decisions data for frontend
        final_decisions_for_frontend = []
        if rfq.final_decisions:
            for final_decision in rfq.final_decisions:
                decision_items = []
                for item in final_decision.items:
                    decision_items.append({
                        "itemId": item.rfq_item_id,
                        "finalUnitPrice": item.final_unit_price,
                        "finalTotalPrice": item.final_total_price,
                        "supplierCode": item.supplier_code,
                        "supplierName": item.supplier_name,
                        "decisionNotes": item.decision_notes,
                    })
                
                final_decisions_for_frontend.append({
                    "id": final_decision.id,
                    "status": final_decision.status.value if final_decision.status else None,
                    "totalApprovedAmount": final_decision.total_approved_amount,
                    "approvalNotes": final_decision.approval_notes,
                    "rejectionReason": final_decision.rejection_reason,
                    "approvedAt": final_decision.approved_at.strftime("%Y-%m-%d %H:%M:%S") if final_decision.approved_at else None,
                    "items": decision_items,
                })

        payload = {
            "id": rfq.rfq_number,
            "title": rfq.title,
            "description": rfq.description,
            "requestedBy": rfq.user.full_name if rfq.user else None,
            "plant": getattr(rfq.site, "site_code", None) if rfq.site else None,
            "submittedDate": (
                rfq.created_at.strftime("%m/%d/%Y") if rfq.created_at else None
            ),
            "deadline": None,
            "deliveryLocation": None,
            "specialRequirements": None,
            "status": rfq_status_display,
            "statusRaw": rfq_status_raw,
            "submissionTime": (
                rfq.created_at.strftime("%Y-%m-%d %H:%M:%S") if rfq.created_at else None
            ),
            "commodityType": commodity_type_display,
            "commodityTypeRaw": commodity_type_raw,
            "totalValue": rfq.total_value,
            "currency": rfq.currency,
            "items": items_for_frontend,
            "suppliers": suppliers_list,
            "finalDecisions": final_decisions_for_frontend,
        }

        return JSONResponse(content=payload)

    # Create comprehensive RFQ response for standard format
    rfq_response = RFQResponse(
        id=rfq.id,
        rfq_number=rfq.rfq_number,
        title=rfq.title,
        description=rfq.description,
        commodity_type=rfq.commodity_type,
        total_value=rfq.total_value,
        currency=rfq.currency,
        status=rfq.status,
        user_id=rfq.user_id,
        site_id=rfq.site_id,
        created_at=rfq.created_at,
        updated_at=rfq.updated_at,
        items=rfq.items,
        quotations=rfq.quotations,
        user=rfq.user,
        site=rfq.site,
        # Additional comprehensive fields
        requested_by=rfq.user.full_name if rfq.user else None,
        plant=rfq.site.site_code if rfq.site else None,
        submitted_date=rfq.created_at.strftime("%m/%d/%Y") if rfq.created_at else None,
        deadline=None,  # Not stored in current schema
        delivery_location=None,  # Not stored in current schema
        special_requirements=None,  # Not stored in current schema
        submission_time=(
            rfq.created_at.strftime("%Y-%m-%d %H:%M:%S") if rfq.created_at else None
        ),
        commodity_type_raw=commodity_type_raw,
        suppliers=suppliers_list,
    )

    return rfq_response


@router.put("/{rfq_id}", response_model=RFQResponse)
def update_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()

    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    # Check permissions
    if (
        str(current_user.role) == UserRole.USER.value and rfq.user_id != current_user.id
    ):  # type: ignore
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
    db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)
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
    current_user: User = Depends(get_current_active_user),
):
    """Delete RFQ."""
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()

    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    # Check permissions
    if (
        str(current_user.role) == UserRole.USER.value and rfq.user_id != current_user.id
    ):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")

    # Check if RFQ can be deleted
    if rfq.status in [RFQStatus.APPROVED, RFQStatus.REJECTED]:
        raise ValidationError("Cannot delete approved/rejected RFQ")

    db.delete(rfq)
    db.commit()

    return {"message": "RFQ deleted successfully"}


@router.post("/{rfq_id}/final-decision", response_model=FinalDecisionResponse)
def create_final_decision(
    rfq_id: int,
    final_decision_data: FinalDecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """Create final decision for RFQ approval (Admin only)."""
    
    try:
        # Debug logging
        print(f"=== CREATE FINAL DECISION DEBUG ===")
        print(f"RFQ ID: {rfq_id}")
        print(f"Current User: {current_user.id}")
        print(f"Final Decision Data: {final_decision_data}")
        print(f"Final Decision Data Dict: {final_decision_data.dict()}")
        print(f"Status: {final_decision_data.status}")
        print(f"Items count: {len(final_decision_data.items)}")
        print(f"Items: {[item.dict() for item in final_decision_data.items]}")
        print(f"=== END DEBUG ===")
    except Exception as e:
        print(f"Error in debug logging: {e}")
        print(f"Raw final_decision_data: {final_decision_data}")
        raise HTTPException(status_code=422, detail=f"Invalid request data: {str(e)}")
    
    # Validate RFQ exists
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    print(f"RFQ found: {rfq.id}, Status: {rfq.status}")

    # Check if RFQ can be processed
    if rfq.status not in [RFQStatus.PENDING]:
        raise HTTPException(status_code=400, detail=f"Only pending RFQs can be processed for final decision. Current status: {rfq.status}")

    # Check if final decision already exists
    existing_decision = db.query(FinalDecision).filter(FinalDecision.rfq_id == rfq_id).first()
    if existing_decision:
        raise HTTPException(status_code=400, detail="Final decision already exists for this RFQ")

    # Validate items exist
    if not final_decision_data.items:
        raise HTTPException(status_code=400, detail="No items provided for final decision")
    
    rfq_item_ids = [item.rfq_item_id for item in final_decision_data.items]
    existing_items = db.query(RFQItem).filter(RFQItem.id.in_(rfq_item_ids)).all()
    if len(existing_items) != len(rfq_item_ids):
        missing_ids = set(rfq_item_ids) - set([item.id for item in existing_items])
        raise HTTPException(status_code=400, detail=f"RFQ items not found: {list(missing_ids)}")
    
    # Validate item data
    for item in final_decision_data.items:
        if item.final_unit_price < 0:
            raise HTTPException(status_code=400, detail=f"Invalid unit price for item {item.rfq_item_id}")
        if item.final_total_price < 0:
            raise HTTPException(status_code=400, detail=f"Invalid total price for item {item.rfq_item_id}")

    # Calculate total approved amount
    total_approved_amount = sum(item.final_total_price for item in final_decision_data.items)

    try:
        # Create final decision
        final_decision = FinalDecision(
            rfq_id=rfq_id,
            approved_by=current_user.id,
            status=final_decision_data.status,
            total_approved_amount=total_approved_amount,
            currency=final_decision_data.currency,
            approval_notes=final_decision_data.approval_notes,
            rejection_reason=final_decision_data.rejection_reason,
            approved_at=None if final_decision_data.status != "APPROVED" else db.query(func.now()).scalar(),
        )
        db.add(final_decision)
        db.flush()  # Get the ID
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating final decision: {str(e)}")

    try:
        # Create final decision items
        for item_data in final_decision_data.items:
            final_decision_item = FinalDecisionItem(
                final_decision_id=final_decision.id,
                rfq_item_id=item_data.rfq_item_id,
                selected_supplier_id=item_data.selected_supplier_id,
                selected_quotation_id=item_data.selected_quotation_id,
                final_unit_price=item_data.final_unit_price,
                final_total_price=item_data.final_total_price,
                supplier_code=item_data.supplier_code,
                supplier_name=item_data.supplier_name,
                decision_notes=item_data.decision_notes,
            )
            db.add(final_decision_item)

        # Update RFQ status based on final decision
        if final_decision_data.status == "APPROVED":
            rfq.status = RFQStatus.APPROVED.value  # type: ignore
        elif final_decision_data.status == "REJECTED":
            rfq.status = RFQStatus.REJECTED.value  # type: ignore

        db.commit()
        db.refresh(final_decision)

        return final_decision
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating final decision items: {str(e)}")


@router.get("/{rfq_id}/final-decision", response_model=FinalDecisionWithDetails)
def get_final_decision(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get final decision for RFQ."""
    from sqlalchemy.orm import joinedload
    
    # Check RFQ exists and permissions
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    # Check permissions
    if (
        str(current_user.role) == UserRole.USER.value and rfq.user_id != current_user.id
    ):  # type: ignore
        raise PermissionDenied("Access denied to this RFQ")

    # Get final decision
    final_decision = (
        db.query(FinalDecision)
        .options(
            joinedload(FinalDecision.items),
            joinedload(FinalDecision.approver),
        )
        .filter(FinalDecision.rfq_id == rfq_id)
        .first()
    )

    if not final_decision:
        raise HTTPException(status_code=404, detail="Final decision not found")

    # Build response with additional details
    response_data = {
        **final_decision.__dict__,
        "approver_name": final_decision.approver.full_name if final_decision.approver else None,
        "rfq_number": rfq.rfq_number,
        "rfq_title": rfq.title,
    }

    return FinalDecisionWithDetails(**response_data)


@router.put("/{rfq_id}/final-decision", response_model=FinalDecisionResponse)
def update_final_decision(
    rfq_id: int,
    final_decision_update: FinalDecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """Update final decision for RFQ (Admin only)."""
    
    # Get existing final decision
    final_decision = db.query(FinalDecision).filter(FinalDecision.rfq_id == rfq_id).first()
    if not final_decision:
        raise HTTPException(status_code=404, detail="Final decision not found")

    # Update fields
    for field, value in final_decision_update.dict(exclude_unset=True).items():
        setattr(final_decision, field, value)

    # Update approved_at timestamp if status changed to approved
    if final_decision_update.status == "APPROVED":
        final_decision.approved_at = db.query(func.now()).scalar()

    # Update RFQ status based on final decision
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if final_decision_update.status == "APPROVED":
        rfq.status = RFQStatus.APPROVED.value  # type: ignore
    elif final_decision_update.status == "REJECTED":
        rfq.status = RFQStatus.REJECTED.value  # type: ignore

    db.commit()
    db.refresh(final_decision)

    return final_decision


