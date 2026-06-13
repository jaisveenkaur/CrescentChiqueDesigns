"""create notifications table

Revision ID: cdbd36e42317
Revises: 0001
Create Date: 2026-06-14 02:38:52.636109

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cdbd36e42317'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notifications',
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ['customer_id'],
            ['customers.id'],
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():  
    op.drop_table('notifications')

