import os
import sys

# Inject parent path to resolve application factory context lookup
sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)
from app import create_app
from app.models import db, User, Customer, Design, DesignImage, Appointment, Quotation, Project, Lead, Notification, File, AuditLog

# Import modular seed functions
from scripts.seed_users import seed_users
from scripts.seed_customers import seed_customers
from scripts.seed_designs import seed_designs
from scripts.seed_appointments import seed_appointments
from scripts.seed_quotations import seed_quotations
from scripts.seed_projects import seed_projects
from scripts.seed_leads import seed_leads
from scripts.seed_notifications import seed_notifications
from scripts.seed_files import seed_files
from scripts.seed_audit_logs import seed_audit_logs

def seed_database():
    """Orchestrates database seeding sequence.
    
    Purges existing records in reverse dependency order and calls individual 
    seed modules in their dependency flow sequence.
    """
    print("Initializing Database Seeding Sequence...")
    
    # 1. Clear existing data in correct dependency order
    print("Purging existing records...")
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
    
    # Commit deletions to clear foreign keys cleanly
    db.session.commit()
    print("Purge completed successfully.")

    # 2. Execute modular seed modules passing IDs to preserve relationships
    print("Executing User seed...")
    admin_id, customer_user_id = seed_users()
    
    print("Executing Customer seed...")
    customer_profile_id = seed_customers(customer_user_id)
    
    print("Executing Designs portfolio seed...")
    design_scandi_id, design_industrial_id, design_luxury_id = seed_designs()
    
    print("Executing Consultation Appointments seed...")
    seed_appointments(customer_profile_id)
    
    print("Executing Cost Quotations seed...")
    quote_id = seed_quotations(customer_profile_id, design_scandi_id)
    
    print("Executing Projects tracking seed...")
    seed_projects(customer_profile_id, quote_id)
    
    print("Executing Leads inquiries seed...")
    seed_leads(customer_profile_id)
    
    print("Executing Alerts Notifications seed...")
    seed_notifications(customer_profile_id)
    
    print("Executing Files metadata seed...")
    seed_files(customer_profile_id)
    
    print("Executing Audit Logs seed...")
    seed_audit_logs(admin_id, customer_user_id)
    
    # Commit final transaction
    db.session.commit()
    print("Database seeding process completed successfully!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_database()
