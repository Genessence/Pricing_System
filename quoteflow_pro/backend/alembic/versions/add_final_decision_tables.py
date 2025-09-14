"""Add final decision tables

Revision ID: add_final_decision_tables
Revises: add_transport_items
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'add_final_decision_tables'
down_revision = 'add_transport_items'
branch_labels = None
depends_on = None


def upgrade():
    # Create final_decisions table
    op.create_table('final_decisions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rfq_id', sa.Integer(), nullable=False),
        sa.Column('approved_by', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='decisionstatus'), nullable=True),
        sa.Column('total_approved_amount', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('approval_notes', sa.Text(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['rfq_id'], ['rfqs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_final_decisions_id'), 'final_decisions', ['id'], unique=False)
    
    # Create final_decision_items table
    op.create_table('final_decision_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('final_decision_id', sa.Integer(), nullable=False),
        sa.Column('rfq_item_id', sa.Integer(), nullable=False),
        sa.Column('selected_supplier_id', sa.Integer(), nullable=True),
        sa.Column('selected_quotation_id', sa.Integer(), nullable=True),
        sa.Column('final_unit_price', sa.Float(), nullable=False),
        sa.Column('final_total_price', sa.Float(), nullable=False),
        sa.Column('supplier_code', sa.String(length=50), nullable=True),
        sa.Column('supplier_name', sa.String(length=200), nullable=True),
        sa.Column('decision_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['final_decision_id'], ['final_decisions.id'], ),
        sa.ForeignKeyConstraint(['rfq_item_id'], ['rfq_items.id'], ),
        sa.ForeignKeyConstraint(['selected_quotation_id'], ['quotations.id'], ),
        sa.ForeignKeyConstraint(['selected_supplier_id'], ['suppliers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_final_decision_items_id'), 'final_decision_items', ['id'], unique=False)


def downgrade():
    # Drop final_decision_items table
    op.drop_index(op.f('ix_final_decision_items_id'), table_name='final_decision_items')
    op.drop_table('final_decision_items')
    
    # Drop final_decisions table
    op.drop_index(op.f('ix_final_decisions_id'), table_name='final_decisions')
    op.drop_table('final_decisions')
    
    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS decisionstatus')
