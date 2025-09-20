"""Add APD field to RFQ table

Revision ID: add_apd_field_to_rfq
Revises: add_transport_items
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_apd_field_to_rfq"
down_revision = "add_transport_items"
branch_labels = None
depends_on = None


def upgrade():
    # Add APD field to RFQ table
    op.add_column(
        "rfqs", sa.Column("apd_number", sa.String(50), default="", nullable=True)
    )


def downgrade():
    # Remove APD field from RFQ table
    op.drop_column("rfqs", "apd_number")
