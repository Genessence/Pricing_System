#!/usr/bin/env python3

import sys

sys.path.append(".")

from app.database import SessionLocal
from app.models.rfq import RFQ
from sqlalchemy.orm import joinedload
from app.models.rfq_item import RFQItem
from app.models.quotation import Quotation
from app.models.quotation_item import QuotationItem


def test_rfq_query():
    """Test the RFQ query that's failing in the GET endpoint"""
    db = SessionLocal()
    try:
        print("Testing RFQ query for ID 69...")

        # Test basic RFQ query first
        rfq_basic = db.query(RFQ).filter(RFQ.id == 69).first()
        print(f"Basic RFQ query result: {rfq_basic}")

        if not rfq_basic:
            print("RFQ with ID 69 not found")
            return

        # Test with joinedload for user
        print("Testing with user joinedload...")
        rfq_with_user = (
            db.query(RFQ).options(joinedload(RFQ.user)).filter(RFQ.id == 69).first()
        )
        print(f"RFQ with user: {rfq_with_user}")

        # Test with site joinedload
        print("Testing with site joinedload...")
        rfq_with_site = (
            db.query(RFQ).options(joinedload(RFQ.site)).filter(RFQ.id == 69).first()
        )
        print(f"RFQ with site: {rfq_with_site}")

        # Test with items joinedload
        print("Testing with items joinedload...")
        rfq_with_items = (
            db.query(RFQ).options(joinedload(RFQ.items)).filter(RFQ.id == 69).first()
        )
        print(f"RFQ with items: {rfq_with_items}")
        if rfq_with_items:
            print(f"Items count: {len(rfq_with_items.items)}")

        # Test with transport_item joinedload
        print("Testing with transport_item joinedload...")
        rfq_with_transport = (
            db.query(RFQ)
            .options(joinedload(RFQ.items).joinedload(RFQItem.transport_item))
            .filter(RFQ.id == 69)
            .first()
        )
        print(f"RFQ with transport items: {rfq_with_transport}")

        # Test with quotations joinedload
        print("Testing with quotations joinedload...")
        rfq_with_quotations = (
            db.query(RFQ)
            .options(joinedload(RFQ.quotations))
            .filter(RFQ.id == 69)
            .first()
        )
        print(f"RFQ with quotations: {rfq_with_quotations}")
        if rfq_with_quotations:
            print(f"Quotations count: {len(rfq_with_quotations.quotations)}")

        # Test the full query that's failing
        print("Testing full query...")
        rfq_full = (
            db.query(RFQ)
            .options(
                joinedload(RFQ.user),
                joinedload(RFQ.site),
                joinedload(RFQ.items).joinedload(RFQItem.transport_item),
                joinedload(RFQ.quotations).joinedload(Quotation.supplier),
                joinedload(RFQ.quotations).joinedload(Quotation.items),
            )
            .filter(RFQ.id == 69)
            .first()
        )
        print(f"Full query result: {rfq_full}")

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_rfq_query()
