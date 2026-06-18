import setup_paths
import uuid
import random
from datetime import datetime, timedelta, date, time
from decimal import Decimal
from werkzeug.security import generate_password_hash
from app import create_app
from app.models import (
    db, User, Customer, Design, DesignImage, Appointment,
    Quotation, Project, Lead, Notification, File, AuditLog, ProjectNote
)
from scripts.seed_designs import seed_designs

def random_date_in_last_6_months(base_date=None):
    """Generates a random datetime in the last 6 months relative to the base date."""
    if base_date is None:
        base_date = datetime(2026, 6, 18, 15, 0, 0)
    start_date = base_date - timedelta(days=180)
    delta = base_date - start_date
    int_delta = (delta.days * 24 * 3600) + delta.seconds
    random_second = random.randrange(int_delta)
    return start_date + timedelta(seconds=random_second)

def seed_realistic_database():
    print("=== STARTING REALISTIC DATABASE SEEDING ===")

    # 1. Purge existing database tables
    print("Purging existing records in correct order...")
    ProjectNote.query.delete()
    AuditLog.query.delete()
    Notification.query.delete()
    File.query.delete()
    Lead.query.delete()
    Project.query.delete()
    Quotation.query.delete()
    Appointment.query.delete()
    DesignImage.query.delete()
    Design.query.delete()
    Customer.query.delete()
    User.query.delete()
    db.session.commit()
    print("Database purged.")

    # 2. Seed Admin User
    admin_id = str(uuid.uuid4())
    admin_user = User(
        id=admin_id,
        name="Chief Administrator",
        email="admin@crescentchique.com",
        password_hash=generate_password_hash("CCAdmin2026!"),
        role="admin"
    )
    db.session.add(admin_user)

    # 3. Seed 25 Customer Users
    print("Seeding 25 customer users...")
    customer_profiles = []
    customer_users = []

    names = [
        "John Doe", "Amit Sharma", "Priya Patel", "Rahul Verma", "Sneha Gupta",
        "Vikram Malhotra", "Anjali Deshmukh", "Rajesh Iyer", "Deepika Padukone",
        "Ranveer Singh", "Karan Johar", "Alia Bhatt", "Varun Dhawan",
        "Siddharth Malhotra", "Katrina Kaif", "Vicky Kaushal", "Priyanka Chopra",
        "Nick Jonas", "Anushka Sharma", "Virat Kohli", "Kareena Kapoor",
        "Saif Ali Khan", "Hrithik Roshan", "Tiger Shroff", "Disha Patani"
    ]

    emails = [
        "john.doe@gmail.com", "amit.sharma@gmail.com", "priya.patel@gmail.com", "rahul.verma@gmail.com", "sneha.gupta@gmail.com",
        "vikram.m@gmail.com", "anjali.d@gmail.com", "rajesh.iyer@gmail.com", "deepika.p@gmail.com",
        "ranveer.s@gmail.com", "karan.j@gmail.com", "alia.b@gmail.com", "varun.d@gmail.com",
        "siddharth.m@gmail.com", "katrina.k@gmail.com", "vicky.k@gmail.com", "priyanka.c@gmail.com",
        "nick.j@gmail.com", "anushka.s@gmail.com", "virat.k@gmail.com", "kareena.k@gmail.com",
        "saif.a@gmail.com", "hrithik.r@gmail.com", "tiger.s@gmail.com", "disha.p@gmail.com"
    ]

    cities_states = [
        ("Mumbai", "Maharashtra"),
        ("Pune", "Maharashtra"),
        ("Delhi", "Delhi"),
        ("Bangalore", "Karnataka"),
        ("Hyderabad", "Telangana"),
        ("Chennai", "Tamil Nadu"),
    ]

    addresses = [
        "Flat 402, Sea Breeze Wing B, Worli",
        "12B, Orchid Greens, Koregaon Park",
        "A-88, Defence Colony",
        "104, Royal Palms, Indiranagar",
        "Plot 45, Jubilee Hills",
        "Apartment 7G, Ocean Crest, ECR",
        "502, Crescent Manor, Bandra",
        "1201, Sterling Heights, Juhu",
        "89, Green Glen Layout, HSR Layout",
        "B-304, Shanti Niketan",
    ]

    for i in range(25):
        user_id = str(uuid.uuid4())
        cust_id = str(uuid.uuid4())
        
        # Determine unique email (fallback if list run out)
        email = emails[i] if i < len(emails) else f"customer{i}@example.com"
        name = names[i] if i < len(names) else f"Customer {i}"
        
        # Password for all standard seeded customers is JohnDoe2026! (or custom if needed, but JohnDoe2026! matches the seed file login details)
        password = "JohnDoe2026!"
        
        user = User(
            id=user_id,
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            role="customer",
            created_at=random_date_in_last_6_months()
        )
        db.session.add(user)
        customer_users.append(user)
        
        city, state = random.choice(cities_states)
        address = random.choice(addresses) + f", {city}"
        
        cust = Customer(
            id=cust_id,
            user_id=user_id,
            phone=f"+91{random.randint(7000000000, 9999999999)}",
            address=address,
            city=city,
            state=state,
            created_at=user.created_at
        )
        db.session.add(cust)
        customer_profiles.append(cust)

    db.session.flush()
    print(f"Seeded 25 Customer users.")

    # 4. Seed Design concepts portfolio
    print("Seeding designs portfolio...")
    design_scandi_id, design_industrial_id, design_luxury_id = seed_designs()
    design_ids = [design_scandi_id, design_industrial_id, design_luxury_id]
    
    # Fetch price maps
    designs_list = Design.query.all()
    design_price_map = {d.id: d.price_per_sqft for d in designs_list}
    print("Designs seeded.")

    # 5. Seed 30 Quotations
    # Ensure we have at least 20 "accepted" status quotations to link to projects later
    print("Seeding 30 cost quotations...")
    quotations = []
    
    statuses = ['accepted'] * 20 + ['pending'] * 5 + ['rejected'] * 5
    random.shuffle(statuses) # Shuffle status distribution
    
    material_rates = {
        'Economy': Decimal('1000.00'),
        'Premium': Decimal('1500.00'),
        'Luxury': Decimal('2500.00')
    }

    for i in range(30):
        quote_id = str(uuid.uuid4())
        customer = random.choice(customer_profiles)
        design_id = random.choice(design_ids)
        
        area_sqft = Decimal(str(random.randint(600, 3500)))
        material_grade = random.choice(['Economy', 'Premium', 'Luxury'])
        
        # Cost derivations
        mat_cost = area_sqft * material_rates[material_grade]
        lab_cost = mat_cost * Decimal('0.30')
        des_cost = area_sqft * design_price_map[design_id]
        
        subtotal = mat_cost + lab_cost + des_cost
        tax_amount = subtotal * Decimal('0.18')
        total_amount = subtotal + tax_amount
        
        created_at = random_date_in_last_6_months(base_date=customer.created_at + timedelta(days=90))
        if created_at > datetime(2026, 6, 18, 15, 0, 0):
            created_at = datetime(2026, 6, 18, 15, 0, 0)
        
        quote = Quotation(
            id=quote_id,
            customer_id=customer.id,
            design_id=design_id,
            area_sqft=area_sqft,
            material_grade=material_grade,
            material_cost=mat_cost,
            labour_cost=lab_cost,
            design_cost=des_cost,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status=statuses[i],
            pdf_url=f"/static/uploads/quotations/quote_{quote_id}.pdf",
            created_at=created_at
        )
        db.session.add(quote)
        quotations.append(quote)

    db.session.flush()
    print("Seeded 30 Quotations.")

    # 6. Seed 20 Projects
    # We must link projects to customers and quotations.
    # Take 20 of the 'accepted' quotations.
    print("Seeding 20 projects...")
    accepted_quotations = [q for q in quotations if q.status == 'accepted']
    
    # In case there are slightly fewer due to random status generation overrides, force update
    if len(accepted_quotations) < 20:
        needed = 20 - len(accepted_quotations)
        non_accepted = [q for q in quotations if q.status != 'accepted']
        for i in range(min(needed, len(non_accepted))):
            non_accepted[i].status = 'accepted'
        db.session.flush()
        accepted_quotations = [q for q in quotations if q.status == 'accepted']

    # Select exactly 20 accepted quotations to turn into projects
    project_quotations = accepted_quotations[:20]
    
    project_statuses = ['Lead Created', 'Quotation Approved', 'Design Finalized', 'Procurement', 'Execution', 'Quality Check', 'Completed']

    for i in range(20):
        proj_id = str(uuid.uuid4())
        quote = project_quotations[i]
        
        status = random.choice(project_statuses)
        
        # Match progress to status realistically
        if status == 'Lead Created':
            progress = random.randint(0, 10)
        elif status == 'Quotation Approved':
            progress = random.randint(10, 20)
        elif status == 'Design Finalized':
            progress = random.randint(20, 35)
        elif status == 'Procurement':
            progress = random.randint(35, 50)
        elif status == 'Execution':
            progress = random.randint(50, 80)
        elif status == 'Quality Check':
            progress = random.randint(80, 95)
        else: # Completed
            progress = 100
            
        start_date = quote.created_at.date() + timedelta(days=random.randint(5, 15))
        expected_completion = start_date + timedelta(days=random.randint(60, 150))
        
        proj = Project(
            id=proj_id,
            customer_id=quote.customer_id,
            quotation_id=quote.id,
            project_status=status,
            progress_percentage=progress,
            start_date=start_date,
            expected_completion=expected_completion,
            created_at=quote.created_at + timedelta(days=2)
        )
        db.session.add(proj)
        
        # Add 1-2 ProjectNotes for each project to increase realism
        for note_idx in range(random.randint(1, 2)):
            note_id = str(uuid.uuid4())
            note_texts = [
                "Initial site measurements taken. Structure is ready for design finalizing.",
                "Client approved the design layout concept revisions. Commencing material procurement.",
                "Procurement completed. Cabinetry fabrication started at the local facility.",
                "Execution phase commenced. Carpentry work active on-site.",
                "Quality check audit conducted by structural supervisor. Minor snag list prepared.",
                "Renovation completed. Handover inspection scheduled with client next Tuesday."
            ]
            note = ProjectNote(
                id=note_id,
                project_id=proj_id,
                note=random.choice(note_texts),
                created_by=admin_id,
                created_at=datetime.combine(start_date, time(10, 0)) + timedelta(days=random.randint(2, 40))
            )
            db.session.add(note)

    db.session.flush()
    print("Seeded 20 Projects and associated Project Notes.")

    # 7. Seed 40 Leads
    # We want 20 guest leads (customer_id = None) and 20 registered customer leads.
    print("Seeding 40 marketing leads...")
    lead_names = [
        "Priyal Sharma", "Gaurav Sen", "Ishaan Kapoor", "Meera Nair", "Aravind Swamy",
        "Riya Sen", "Devendra Fadnavis", "Nisha Rawal", "Arjun Rampal", "Shilpa Shetty",
        "Kriti Sanon", "Ayushmann Khurrana", "Rajkumar Rao", "Yami Gautam", "Bobby Deol",
        "Sunny Deol", "Sanjay Dutt", "Jackie Shroff", "Anil Kapoor", "Sonam Kapoor",
        "Kriti Kharbanda", "Pulkit Samrat", "Taapsee Pannu", "Bhumi Pednekar", "Rajkumar Rao",
        "Kartik Aaryan", "Sara Ali Khan", "Janhvi Kapoor", "Ishaan Khatter", "Ananya Panday",
        "Aditya Roy Kapur", "Shraddha Kapoor", "Tiger Shroff", "Nupur Sanon", "Rohit Saraf",
        "Prajakta Koli", "Bhuvan Bam", "Ashish Chanchlani", "Carry Minati", "Ranveer Allahbadia"
    ]
    
    lead_emails = [
        f"lead{i}@example.com" for i in range(40)
    ]
    
    sources = ['Website', 'Instagram', 'Referral', 'Houzz', 'Google', 'Other']
    lead_statuses = ['new', 'contacted', 'qualified', 'lost']
    
    lead_requirements = [
        "Need modular kitchen layout and cost breakdown for 2BHK flat.",
        "Balcony landscape design with premium artificial turf seating layout.",
        "Renovation estimate for master bedroom glass wardrobe and king bed design.",
        "Living room television wall panel unit with integrated backlighting.",
        "Duplex villa comprehensive interior design package consultation.",
        "Study room work-from-home desk setup with wood paneling accents.",
        "Kids bedroom bunk bed and play zone structural layout requirements.",
        "Dining room bar cabinet unit with glass shelving and wine racks.",
        "Foyer shoe cabinet and accent lighting decor plan.",
        "Office workspace design layout for 10 structural seating layouts."
    ]

    for i in range(40):
        lead_id = str(uuid.uuid4())
        
        # 20 leads linked to registered customer, 20 guest leads
        customer_id = None
        name = lead_names[i]
        email = lead_emails[i]
        
        if i < 20:
            cust = customer_profiles[i]
            customer_id = cust.id
            name = cust.user.name
            email = cust.user.email

        created_at = random_date_in_last_6_months()
        
        lead = Lead(
            id=lead_id,
            customer_id=customer_id,
            name=name,
            email=email,
            phone=f"+91{random.randint(7000000000, 9999999999)}",
            requirements=random.choice(lead_requirements),
            source=random.choice(sources),
            status=random.choice(lead_statuses),
            created_at=created_at
        )
        db.session.add(lead)

    db.session.flush()
    print("Seeded 40 Leads.")

    # 8. Seed 50 Notifications
    print("Seeding 50 user notifications...")
    notification_titles = [
        "Project Stage Transitioned", "New Estimation Ready", "Design Conceptualization Approved",
        "Document Verified", "Consultation Booked Successfully", "Revised Layout Proposal Added",
        "Payment Processed", "Site Inspection Scheduled"
    ]
    
    notification_messages = [
        "Your interior renovation project has successfully transitioned to the next stage. Check details on your dashboard tracker.",
        "A revised cost quotation has been finalized for your review. Check Finance -> Quotations to download the PDF breakdown.",
        "The Scandinavian concept blueprints have been uploaded by the architect. Download floorplans in your files center.",
        "We have received and approved your floor plan upload file. A consultant is reviewing your structural specifications.",
        "Your initial consultation session is confirmed. We will reach out on phone to finalize scheduling details.",
        "Check your alerts center! A new design proposal highlight was generated for your property area.",
        "Great news! Your booking slot has been approved. Looking forward to designing your spatial luxury.",
        "A site supervisor is assigned to your project address. Inspection is scheduled next Monday at 10 AM."
    ]

    for i in range(50):
        notif_id = str(uuid.uuid4())
        customer = random.choice(customer_profiles)
        
        idx = random.randint(0, len(notification_titles) - 1)
        created_at = random_date_in_last_6_months(base_date=customer.created_at + timedelta(days=30))
        if created_at > datetime(2026, 6, 18, 15, 0, 0):
            created_at = datetime(2026, 6, 18, 15, 0, 0)
            
        notif = Notification(
            id=notif_id,
            customer_id=customer.id,
            title=notification_titles[idx],
            message=notification_messages[idx],
            is_read=random.choice([True, False]),
            created_at=created_at
        )
        db.session.add(notif)

    db.session.flush()
    print("Seeded 50 Notifications.")

    # 9. Seed 25 Appointments
    print("Seeding 25 consultation appointments...")
    appt_requirements = [
        "Need wood panel layout concepts for study room.",
        "Planning to remodel modular kitchen. Space constraints details will be discussed.",
        "Master bedroom wardrobe styling preferences and custom vanity mirrors.",
        "Full apartment layout audit. Budget friendly Scandinavian styles preferred.",
        "Need a TV panel unit with marble accents and led stripes.",
        "False ceiling design consultation with modular spotlights layout."
    ]

    for i in range(25):
        appt_id = str(uuid.uuid4())
        customer = random.choice(customer_profiles)
        
        # Generate date (from 3 months ago to 3 months ahead)
        appt_date = date(2026, 6, 18) + timedelta(days=random.randint(-90, 90))
        appt_time = time(random.randint(10, 18), random.choice([0, 30]), 0)
        
        status = random.choice(['pending', 'confirmed', 'completed', 'cancelled'])
        
        created_at = random_date_in_last_6_months(base_date=customer.created_at + timedelta(days=10))
        if created_at > datetime(2026, 6, 18, 15, 0, 0):
            created_at = datetime(2026, 6, 18, 15, 0, 0)
            
        appt = Appointment(
            id=appt_id,
            customer_id=customer.id,
            appointment_date=appt_date,
            appointment_time=appt_time,
            status=status,
            requirements=random.choice(appt_requirements),
            floor_plan_url=f"/static/uploads/floorplans/floorplan_{appt_id}.pdf" if random.choice([True, False]) else None,
            created_at=created_at
        )
        db.session.add(appt)

    db.session.flush()
    print("Seeded 25 Appointments.")

    # 10. Seed 100 Audit Logs
    print("Seeding 100 system audit logs...")
    actions = [
        ("User Login", "User {email} logged in successfully"),
        ("User Logout", "User {email} logged out"),
        ("Lead Created", "Lead ID {id} created for customer {cust_id}"),
        ("Lead Status Updated", "Lead ID {id} status updated to {val}"),
        ("Quotation Created", "Quotation ID {id} created with amount {val}"),
        ("Quotation Updated", "Quotation ID {id} updated to status {val}"),
        ("Project Status Updated", "Project ID {id} progress updated to {val}%"),
        ("PDF Generated", "PDF generated for Quotation ID {id}"),
        ("File Uploaded", "File ID {id} uploaded by customer. Filename: Floorplan_{id}.pdf"),
        ("Notification Marked Read", "Notification ID {id} marked as read")
    ]

    all_user_ids = [admin_id] + [u.id for u in customer_users]
    user_email_map = {u.id: u.email for u in [admin_user] + customer_users}

    for i in range(100):
        log_id = str(uuid.uuid4())
        user_id = random.choice(all_user_ids)
        email = user_email_map[user_id]
        
        action_type, details_template = random.choice(actions)
        
        # Populate dynamic template values
        rand_id = str(uuid.uuid4())
        val_str = str(random.choice([10, 25, 45, 80, 100, 250000, 6500000]))
        
        details = details_template.format(
            email=email,
            id=rand_id[:8],
            cust_id=rand_id[:8],
            val=val_str
        )
        
        timestamp = random_date_in_last_6_months()
        
        log = AuditLog(
            id=log_id,
            user_id=user_id,
            action=action_type,
            details=details,
            timestamp=timestamp
        )
        db.session.add(log)

    db.session.flush()
    print("Seeded 100 Audit Logs.")

    # 11. Commit final database seed changes
    db.session.commit()
    print("=== SEEDING COMPLETED SUCCESSFULLY ===")

    # 12. Print Summary Report
    print("\n--- DATABASE SEEDING SUMMARY REPORT ---")
    print(f"Users created: {User.query.count()}")
    print(f"Customers created: {Customer.query.count()}")
    print(f"Designs seeded: {Design.query.count()}")
    print(f"Design Images seeded: {DesignImage.query.count()}")
    print(f"Quotations created: {Quotation.query.count()}")
    print(f"Projects created: {Project.query.count()}")
    print(f"Project Notes logged: {ProjectNote.query.count()}")
    print(f"Leads created: {Lead.query.count()}")
    print(f"Notifications created: {Notification.query.count()}")
    print(f"Appointments created: {Appointment.query.count()}")
    print(f"Audit Logs created: {AuditLog.query.count()}")
    print("---------------------------------------")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_realistic_database()
