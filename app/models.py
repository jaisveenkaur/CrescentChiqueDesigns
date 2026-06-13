import uuid
from datetime import datetime
from decimal import Decimal
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Text, Integer, DECIMAL, Date, Time, Boolean, ForeignKey, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship, validates
# pyrefly: ignore [missing-import]
from flask_login import UserMixin
from app.extensions import db

class UUIDBase(db.Model):
    """Abstract base model to inject UUID keys, audit fields, and soft-delete capabilities."""
    __abstract__ = True
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    is_deleted = Column(Boolean, nullable=False, default=False)
    deleted_at = Column(DateTime, nullable=True, default=None)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def soft_delete(self):
        """Logically marks the record as deleted and sets the timestamp."""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()


class User(UUIDBase, UserMixin):
    """System access account credentials, role authorization, and session identification."""
    __tablename__ = 'users'
    
    name = Column(String(100), nullable=False)
    email = Column(String(191), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='customer')
    
    # Relationships
    customer = relationship('Customer', back_populates='user', uselist=False, cascade="all, delete-orphan")
    notifications = relationship('Notification', back_populates='user', cascade="all, delete-orphan")
    
    @validates('email')
    def validate_email(self, key, address):
        if not address or '@' not in address:
            raise ValueError("Invalid email format")
        return address.lower().strip()

    @validates('role')
    def validate_role(self, key, role_value):
        allowed_roles = {'customer', 'admin'}
        if role_value not in allowed_roles:
            raise ValueError(f"Role must be one of: {allowed_roles}")
        return role_value


class Customer(UUIDBase):
    """Extended customer workspace profile containing operational contact and location records."""
    __tablename__ = 'customers'
    
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='customer')
    appointments = relationship('Appointment', back_populates='customer', cascade="all, delete-orphan")
    quotations = relationship('Quotation', back_populates='customer', cascade="all, delete-orphan")
    projects = relationship('Project', back_populates='customer', cascade="all, delete-orphan")
    leads = relationship('Lead', back_populates='customer')


class Design(UUIDBase):
    """Predefined gallery portfolio item referencing layout types and square footage prices."""
    __tablename__ = 'designs'
    
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    room_type = Column(String(100), nullable=False)
    style = Column(String(100), nullable=False)
    price_per_sqft = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(String(512), nullable=False)
    
    # Relationships
    images = relationship('DesignImage', back_populates='design', cascade="all, delete-orphan")
    quotations = relationship('Quotation', back_populates='design')
    
    @validates('price_per_sqft')
    def validate_price(self, key, price):
        if price is None or Decimal(price) <= 0:
            raise ValueError("Price per square foot must be a positive number")
        return price


class DesignImage(UUIDBase):
    """Sub-images linked to a specific design. Supports one-to-many design visual showcases."""
    __tablename__ = 'design_images'
    
    design_id = Column(String(36), ForeignKey('designs.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    image_url = Column(String(512), nullable=False)
    is_primary = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    design = relationship('Design', back_populates='images')


class Appointment(UUIDBase):
    """Initial renovation project consultation slots scheduled by customers."""
    __tablename__ = 'appointments'
    
    customer_id = Column(String(36), ForeignKey('customers.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(String(50), nullable=False, default='pending')
    requirements = Column(Text, nullable=True)
    floor_plan_url = Column(String(512), nullable=True)
    
    # Relationships
    customer = relationship('Customer', back_populates='appointments')

    @validates('status')
    def validate_status(self, key, val):
        allowed_statuses = {'pending', 'confirmed', 'completed', 'cancelled'}
        if val not in allowed_statuses:
            raise ValueError(f"Invalid appointment status: {val}")
        return val


class Quotation(UUIDBase):
    """Financial estimate snapshots recording dimensions, materials, and taxes."""
    __tablename__ = 'quotations'
    
    customer_id = Column(String(36), ForeignKey('customers.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False)
    design_id = Column(String(36), ForeignKey('designs.id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True)
    area_sqft = Column(DECIMAL(10, 2), nullable=False)
    material_grade = Column(String(50), nullable=False)
    material_cost = Column(DECIMAL(12, 2), nullable=False)
    labour_cost = Column(DECIMAL(12, 2), nullable=False)
    design_cost = Column(DECIMAL(12, 2), nullable=False)
    tax_amount = Column(DECIMAL(12, 2), nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    pdf_url = Column(String(512), nullable=True)
    
    # Relationships
    customer = relationship('Customer', back_populates='quotations')
    design = relationship('Design', back_populates='quotations')
    project = relationship('Project', back_populates='quotation', uselist=False)

    @validates('material_grade')
    def validate_grade(self, key, grade):
        allowed_grades = {'Economy', 'Premium', 'Luxury'}
        if grade not in allowed_grades:
            raise ValueError(f"Invalid material grade: {grade}")
        return grade


class Project(UUIDBase):
    """Renovation execution progress dashboard tracking project milestones."""
    __tablename__ = 'projects'
    
    customer_id = Column(String(36), ForeignKey('customers.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False)
    quotation_id = Column(String(36), ForeignKey('quotations.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False, unique=True)
    project_status = Column(String(50), nullable=False, default='Lead Created')
    progress_percentage = Column(DECIMAL(5, 2), nullable=False, default=0.00)
    start_date = Column(Date, nullable=True)
    expected_completion = Column(Date, nullable=True)
    
    # Relationships
    customer = relationship('Customer', back_populates='projects')
    quotation = relationship('Quotation', back_populates='project')

    @validates('progress_percentage')
    def validate_progress(self, key, value):
        val = Decimal(value)
        if val < 0 or val > 100:
            raise ValueError("Progress percentage must be between 0 and 100")
        return value


class Lead(UUIDBase):
    """Renovation service inquiries capturing client requests and status updates."""
    __tablename__ = 'leads'
    
    customer_id = Column(String(36), ForeignKey('customers.id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(191), nullable=False)
    phone = Column(String(20), nullable=False)
    requirements = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default='new')
    
    # Relationships
    customer = relationship('Customer', back_populates='leads')

    @validates('status')
    def validate_status(self, key, value):
        allowed_statuses = {'new', 'contacted', 'qualified', 'lost'}
        if value not in allowed_statuses:
            raise ValueError(f"Invalid lead status: {value}")
        return value


class Notification(db.Model):
    """Transactional platform notifications pushing status alerts to specific users."""
    __tablename__ = 'notifications'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='notifications')
