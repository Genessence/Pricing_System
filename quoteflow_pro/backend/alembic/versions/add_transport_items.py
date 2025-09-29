"""Add transport items table

Revision ID: add_transport_items
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_transport_items"
down_revision = None  # Update this to the latest revision
branch_labels = None
depends_on = None


def upgrade():
    # Create transport_items table
    op.create_table(
        "transport_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("from_location", sa.String(length=200), nullable=False),
        sa.Column("to_location", sa.String(length=200), nullable=False),
        sa.Column("vehicle_size", sa.String(length=50), nullable=False),
        sa.Column("load", sa.String(length=200), nullable=True),
        sa.Column("dimensions", sa.String(length=100), nullable=True),
        sa.Column("frequency", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_transport_items_id"), "transport_items", ["id"], unique=False
    )

    # Add transport_item_id column to rfq_items table
    op.add_column(
        "rfq_items", sa.Column("transport_item_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_rfq_items_transport_item_id",
        "rfq_items",
        "transport_items",
        ["transport_item_id"],
        ["id"],
    )


def downgrade():
    # Remove foreign key and column
    op.drop_constraint(
        "fk_rfq_items_transport_item_id", "rfq_items", type_="foreignkey"
    )
    op.drop_column("rfq_items", "transport_item_id")

    # Drop transport_items table
    op.drop_index(op.f("ix_transport_items_id"), table_name="transport_items")
    op.drop_table("transport_items")
