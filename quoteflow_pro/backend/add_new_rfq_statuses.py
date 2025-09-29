#!/usr/bin/env python3
"""
Script to add new RFQ statuses to the database
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from sqlalchemy import text


def add_new_rfq_statuses():
    """Add new RFQ statuses to the database"""
    try:
        db = next(get_db())

        # Add new enum values to the existing enum type
        print("🔄 Adding new RFQ statuses to database...")

        # For PostgreSQL, we need to alter the enum type
        db.execute(
            text("ALTER TYPE rfqstatus ADD VALUE IF NOT EXISTS 'admin_approved'")
        )
        db.execute(
            text("ALTER TYPE rfqstatus ADD VALUE IF NOT EXISTS 'super_admin_approved'")
        )

        db.commit()
        print("✅ New RFQ statuses added successfully!")

        # Verify the enum values
        result = db.execute(text("SELECT unnest(enum_range(NULL::rfqstatus))"))
        enum_values = [row[0] for row in result.fetchall()]
        print(f"📋 Current RFQ status enum values: {enum_values}")

    except Exception as e:
        print(f"❌ Error adding RFQ statuses: {e}")
        return False
    finally:
        db.close()

    return True


if __name__ == "__main__":
    print("🔧 Adding New RFQ Statuses...")
    success = add_new_rfq_statuses()
    if success:
        print("\n🎉 RFQ statuses updated successfully!")
        print("New statuses available:")
        print("  - admin_approved")
        print("  - super_admin_approved")
    else:
        print("\n❌ Failed to add RFQ statuses")
