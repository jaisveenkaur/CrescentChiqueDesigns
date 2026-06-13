"""create files table

Revision ID: 385231415a05
Revises: cdbd36e42317
Create Date: 2026-06-14 02:57:09.673153

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '385231415a05'
down_revision = 'cdbd36e42317'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('files',
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_url', sa.String(length=512), nullable=False),
        sa.Column('file_type', sa.String(length=100), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('files')
