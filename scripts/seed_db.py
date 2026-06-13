import os
import sys

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)
from app import create_app
import uuid
from datetime import datetime, date, time
from decimal import Decimal
# pyrefly: ignore [missing-import]
from werkzeug.security import generate_password_hash



# pyrefly: ignore [missing-import]
from flask import Flask
from app.models import db, User, Customer, Design, DesignImage, Appointment, Quotation, Project, Lead, Notification



def seed_database():
    print("Initializing Database Seeding Sequence...")
    
    # 1. Clear existing data (in dependency order)
    print("Purging existing records...")
    Notification.query.delete()
    Lead.query.delete()
    Project.query.delete()
    Quotation.query.delete()
    Appointment.query.delete()
    DesignImage.query.delete()
    Design.query.delete()
    Customer.query.delete()
    User.query.delete()
    
    # Commit deletion
    db.session.commit()
    print("Purge completed successfully.")

    # 2. Seed Users & Profiles
    print("Seeding administrative and customer user accounts...")
    
    # Admin User
    admin_id = str(uuid.uuid4())
    admin_user = User(
        id=admin_id,
        name="Chief Administrator",
        email="admin@crescentchique.com",
        password_hash=generate_password_hash("CCAdmin2026!"), # Secure hashing wrapper
        role="admin"
    )
    db.session.add(admin_user)
    
    # Customer User
    customer_user_id = str(uuid.uuid4())
    customer_user = User(
        id=customer_user_id,
        name="John Doe",
        email="john.doe@gmail.com",
        password_hash=generate_password_hash("JohnDoe2026!"),
        role="customer"
    )
    db.session.add(customer_user)
    db.session.flush() # Secure child foreign keys
    
    # Customer Profile details
    customer_profile_id = str(uuid.uuid4())
    customer_profile = Customer(
        id=customer_profile_id,
        user_id=customer_user_id,
        phone="+919876543210",
        address="Apartment 402, Sea Breeze Wing B, Worli",
        city="Mumbai",
        state="Maharashtra"
    )
    db.session.add(customer_profile)
    db.session.flush()
    print("Users successfully seeded.")

    # 3. Seed Designs & Images
    print("Seeding design portfolio catalog...")
    
    # Design 1: Scandinavian Living Room
    design_scandi_id = str(uuid.uuid4())
    design_scandi = Design(
        id=design_scandi_id,
        title="Minimalist Scandinavian Living Room",
        description="Clean linear designs, natural timber highlights, functional spacing, and neutral color palettes.",
        room_type="Living Room",
        style="Scandinavian",
        price_per_sqft=Decimal("250.00"),
        image_url="/static/images/portfolio/scandi_living_primary.jpg"
    )
    db.session.add(design_scandi)
    
    # Design 2: Industrial Kitchen
    design_industrial_id = str(uuid.uuid4())
    design_industrial = Design(
        id=design_industrial_id,
        title="Industrial Loft Kitchen",
        description="Exposed brick wall accents, matte black cabinetry, industrial piping shelves, and polished concrete countertops.",
        room_type="Kitchen",
        style="Industrial",
        price_per_sqft=Decimal("320.00"),
        image_url="/static/images/portfolio/industrial_kitchen_primary.jpg"
    )
    db.session.add(design_industrial)

    # Design 3: Modern Luxury Bedroom
    design_luxury_id = str(uuid.uuid4())
    design_luxury = Design(
        id=design_luxury_id,
        title="Modern Luxury Bedroom Suite",
        description="Plush velvet customized headboard panels, integrated cove lighting systems, and dynamic walk-in glass wardrobes.",
        room_type="Bedroom",
        style="Luxury",
        price_per_sqft=Decimal("450.00"),
        image_url="/static/images/portfolio/luxury_bedroom_primary.jpg"
    )
    db.session.add(design_luxury)
    db.session.flush()

    # Seed Sub-Images for Designs
    img_scandi_1 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_scandi_id,
        image_url="/static/images/portfolio/scandi_living_alt1.jpg",
        is_primary=False
    )
    img_scandi_2 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_scandi_id,
        image_url="/static/images/portfolio/scandi_living_primary.jpg",
        is_primary=True
    )
    img_industrial_1 = DesignImage(
        id=str(uuid.uuid4()),
        design_id=design_industrial_id,
        image_url="/static/images/portfolio/industrial_kitchen_primary.jpg",
        is_primary=True
    )
    db.session.add_all([img_scandi_1, img_scandi_2, img_industrial_1])
    db.session.flush()
    print("Portfolios successfully seeded.")

    # 4. Seed Appointments
    print("Seeding customer consultation appointments...")
    appt_id = str(uuid.uuid4())
    appointment = Appointment(
        id=appt_id,
        customer_id=customer_profile_id,
        appointment_date=date(2026, 6, 25),
        appointment_time=time(14, 30, 0),
        status="confirmed",
        requirements="Need spatial rearrangement ideas for the living room, specifically wanting to accommodate a bookshelf.",
        floor_plan_url="/static/uploads/floorplans/worli_flat_402.pdf"
    )
    db.session.add(appointment)
    db.session.flush()

    # 5. Seed Quotations
    print("Seeding quotation records...")
    
    # Financial breakdown calculations
    # 800 sq ft, Premium Grade, referencing Scandinavian Living Room
    area = Decimal("800.00")
    design_rate = Decimal("250.00") # price_per_sqft from Scandi design
    material_multiplier = Decimal("1500.00") # Premium grade rate
    
    mat_cost = area * material_multiplier       # 800 * 1500 = 1,200,000
    lab_cost = mat_cost * Decimal("0.30")      # 30% of 1.2M = 360,000
    des_cost = area * design_rate              # 800 * 250 = 200,000
    subtotal = mat_cost + lab_cost + des_cost  # 1,760,000
    tax = subtotal * Decimal("0.18")           # 18% GST of 1.76M = 316,800
    total = subtotal + tax                     # 2,076,800

    quote_id = str(uuid.uuid4())
    quotation = Quotation(
        id=quote_id,
        customer_id=customer_profile_id,
        design_id=design_scandi_id,
        area_sqft=area,
        material_grade="Premium",
        material_cost=mat_cost,
        labour_cost=lab_cost,
        design_cost=des_cost,
        tax_amount=tax,
        total_amount=total,
        pdf_url="/static/uploads/quotations/quote_scandi_mumbai_800.pdf"
    )
    db.session.add(quotation)
    db.session.flush()

    # 6. Seed Projects
    print("Seeding active project trackers...")
    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        customer_id=customer_profile_id,
        quotation_id=quote_id,
        project_status="Execution",
        progress_percentage=Decimal("45.00"),
        start_date=date(2026, 6, 1),
        expected_completion=date(2026, 8, 15)
    )
    db.session.add(project)
    db.session.flush()

    # 7. Seed Leads
    print("Seeding system incoming lead inquiries...")
    lead1 = Lead(
        id=str(uuid.uuid4()),
        customer_id=None, # Guest Lead
        name="Jane Smith",
        email="jane.smith@gmail.com",
        phone="+919822233344",
        requirements="Looking for space-efficient modular kitchen pricing for a small apartment balcony layout.",
        status="new"
    )
    lead2 = Lead(
        id=str(uuid.uuid4()),
        customer_id=customer_profile_id, # Registered Customer inquiry
        name="John Doe",
        email="john.doe@gmail.com",
        phone="+919876543210",
        requirements="Need a quote revision for adding a kitchen wardrobe to the existing living room project layout.",
        status="qualified"
    )
    db.session.add_all([lead1, lead2])

    # 8. Seed Notifications
    print("Seeding customer notifications alerts...")
    notification = Notification(
        id=str(uuid.uuid4()),
        user_id=customer_user_id,
        title="Project Stage Updated",
        message="Great news! Your living room project has successfully transitioned to the 'Execution' phase. Track progress on your dashboard.",
        is_read=False
    )
    db.session.add(notification)

    # Commit all changes to the database
    db.session.commit()
    print("Database seeding process completed successfully!")

if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        seed_database()
