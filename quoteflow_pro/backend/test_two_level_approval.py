#!/usr/bin/env python3
"""
Test script for two-level approval system
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models.user import User, UserRole
from app.models.rfq import RFQ, RFQStatus
from app.models.final_decision import FinalDecision


def test_two_level_approval():
    """Test the two-level approval system"""
    db = next(get_db())
    try:
        print("🔍 Testing Two-Level Approval System")
        print("=" * 50)

        # 1. Check super_admin user
        superadmin = db.query(User).filter(User.username == "superadmin").first()
        if superadmin:
            print(
                f"✅ Super admin user found: {superadmin.username} (Role: {superadmin.role})"
            )
        else:
            print("❌ Super admin user not found!")
            return

        # 2. Check RFQ statuses
        print(f"\n📊 RFQ Status Counts:")
        for status in RFQStatus:
            count = db.query(RFQ).filter(RFQ.status == status).count()
            print(f"  - {status.value}: {count}")

        # 3. Check admin-approved RFQs (waiting for super admin)
        admin_approved_rfqs = (
            db.query(RFQ).filter(RFQ.status == RFQStatus.ADMIN_APPROVED).all()
        )
        print(
            f"\n🔍 Admin-Approved RFQs (waiting for super admin): {len(admin_approved_rfqs)}"
        )

        for rfq in admin_approved_rfqs:
            final_decision = (
                db.query(FinalDecision).filter(FinalDecision.rfq_id == rfq.id).first()
            )
            if final_decision:
                print(f"  - RFQ {rfq.rfq_number}: {rfq.title}")
                print(f"    Amount: {final_decision.total_approved_amount}")
                print(f"    Status: {final_decision.status}")

        # 4. Check super admin approved RFQs
        super_admin_approved_rfqs = (
            db.query(RFQ).filter(RFQ.status == RFQStatus.SUPER_ADMIN_APPROVED).all()
        )
        print(f"\n🔍 Super Admin-Approved RFQs: {len(super_admin_approved_rfqs)}")

        for rfq in super_admin_approved_rfqs:
            print(f"  - RFQ {rfq.rfq_number}: {rfq.title}")

        # 5. Test super admin filtering query
        print(f"\n🔍 Testing Super Admin Filter Query:")
        query = db.query(RFQ).join(FinalDecision, RFQ.id == FinalDecision.rfq_id)
        query = query.filter(
            RFQ.status == RFQStatus.ADMIN_APPROVED,
            FinalDecision.status == "APPROVED",
            FinalDecision.total_approved_amount > 200000,
        )
        filtered_rfqs = query.all()

        print(f"📊 RFQs visible to super admin: {len(filtered_rfqs)}")
        for rfq in filtered_rfqs:
            final_decision = (
                db.query(FinalDecision).filter(FinalDecision.rfq_id == rfq.id).first()
            )
            print(
                f"  - RFQ {rfq.rfq_number}: {rfq.title} (Amount: {final_decision.total_approved_amount if final_decision else 'N/A'})"
            )

        print(f"\n✅ Two-level approval system test completed!")

    except Exception as e:
        print(f"❌ Error during test: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    test_two_level_approval()
