"""Initial migration containing Crescent Chique Designs 2.0 tables

Revision ID: 0001
Revises: None
Create Date: 2026-06-13 22:45:00.000000

"""
# pyrefly: ignore [missing-import]
from alembic import op
# pyrefly: ignore [missing-import]
import sqlalchemy as sa

# Revision identifiers
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=191), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='customer'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email')
    )
    op.create_index('idx_users_email_deleted', 'users', ['email', 'is_deleted'])
    op.create_index('idx_users_role', 'users', ['role'])

    # 2. customers table
    op.create_table(
        'customers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_customers_user_id', onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_customers_user_id')
    )
    op.create_index('idx_customers_user_id', 'customers', ['user_id'])

    # 3. designs table
    op.create_table(
        'designs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('room_type', sa.String(length=100), nullable=False),
        sa.Column('style', sa.String(length=100), nullable=False),
        sa.Column('price_per_sqft', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('image_url', sa.String(length=512), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_designs_style_room', 'designs', ['style', 'room_type'])

    # 4. design_images table
    op.create_table(
        'design_images',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('design_id', sa.String(length=36), nullable=False),
        sa.Column('image_url', sa.String(length=512), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['design_id'], ['designs.id'], name='fk_design_images_design_id', onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_design_images_design_id', 'design_images', ['design_id'])

    # 5. appointments table
    op.create_table(
        'appointments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.Time(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('floor_plan_url', sa.String(length=512), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], name='fk_appointments_customer_id', onupdate='CASCADE', ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_appointments_customer_date', 'appointments', ['customer_id', 'appointment_date'])
    op.create_index('idx_appointments_status', 'appointments', ['status'])

    # 6. quotations table
    op.create_table(
        'quotations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('design_id', sa.String(length=36), nullable=True),
        sa.Column('area_sqft', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('material_grade', sa.String(length=50), nullable=False),
        sa.Column('material_cost', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('labour_cost', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('design_cost', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('pdf_url', sa.String(length=512), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], name='fk_quotations_customer_id', onupdate='CASCADE', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['design_id'], ['designs.id'], name='fk_quotations_design_id', onupdate='CASCADE', ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_quotations_customer_date', 'quotations', ['customer_id', 'created_at'])

    # 7. projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('customer_id', sa.String(length=36), nullable=False),
        sa.Column('quotation_id', sa.String(length=36), nullable=False),
        sa.Column('project_status', sa.String(length=50), nullable=False, server_default='Lead Created'),
        sa.Column('progress_percentage', sa.Numeric(precision=5, scale=2), nullable=False, server_default='0.00'),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('expected_completion', sa.Date(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], name='fk_projects_customer_id', onupdate='CASCADE', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['quotation_id'], ['quotations.id'], name='fk_projects_quotation_id', onupdate='CASCADE', ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('quotation_id', name='uq_projects_quotation_id')
    )
    op.create_index('idx_projects_customer_status', 'projects', ['customer_id', 'project_status'])
    op.create_index('idx_projects_expected_completion', 'projects', ['expected_completion'])

    # 8. leads table
    op.create_table(
        'leads',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('customer_id', sa.String(length=36), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=191), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='new'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], name='fk_leads_customer_id', onupdate='CASCADE', ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_leads_customer_id', 'leads', ['customer_id'])
    op.create_index('idx_leads_email_phone', 'leads', ['email', 'phone'])
    op.create_index('idx_leads_status', 'leads', ['status'])

    # 9. notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_notifications_user_id', onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_notifications_user_unread', 'notifications', ['user_id', 'is_read'])


def downgrade():
    op.drop_table('notifications')
    op.drop_table('leads')
    op.drop_table('projects')
    op.drop_table('quotations')
    op.drop_table('appointments')
    op.drop_table('design_images')
    op.drop_table('designs')
    op.drop_table('customers')
    op.drop_table('users')
