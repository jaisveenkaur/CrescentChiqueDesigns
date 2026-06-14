import uuid
from datetime import datetime, timedelta
from app.models import db, AuditLog

def seed_audit_logs(admin_id, customer_user_id):
    """Seeds sample audit log records for the system logs query module.
    
    Args:
        admin_id (str): The Administrator user UUID.
        customer_user_id (str): The Customer user UUID.
    """
    base_time = datetime.utcnow() - timedelta(days=2)
    
    logs = [
        # Admin Actions
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=admin_id,
            action="User Login",
            details="User admin@crescentchique.com logged in",
            timestamp=base_time
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=admin_id,
            action="Lead Status Updated",
            details="Lead ID b0fe7b21-1eac-48db-86f9-348321d62946 status updated to qualified",
            timestamp=base_time + timedelta(hours=2)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=admin_id,
            action="Appointment Updated",
            details="Appointment ID f5c1810-74be-4f40-b302-39048aabc401 status updated to confirmed",
            timestamp=base_time + timedelta(hours=4)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=admin_id,
            action="Project Status Updated",
            details="Project ID e256ea9b-3ab1-4356-aea9-6e4ead0d2a79 status updated to Execution (progress: 45.0%)",
            timestamp=base_time + timedelta(hours=6)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=admin_id,
            action="User Logout",
            details="User admin@crescentchique.com logged out",
            timestamp=base_time + timedelta(hours=8)
        ),
        
        # Customer Actions (John Doe)
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="User Login",
            details="User john.doe@gmail.com logged in",
            timestamp=base_time + timedelta(hours=10)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="Appointment Created",
            details="Appointment ID f5c1810-74be-4f40-b302-39048aabc401 scheduled for 2026-06-25 14:30:00",
            timestamp=base_time + timedelta(hours=11)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="Quotation Created",
            details="Quotation ID e421d0f2-dbda-417b-84eb-6660b7293eb4 created with amount 2076800.00",
            timestamp=base_time + timedelta(hours=12)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="PDF Generated",
            details="PDF generated for Quotation ID e421d0f2-dbda-417b-84eb-6660b7293eb4",
            timestamp=base_time + timedelta(hours=12, minutes=5)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="File Uploaded",
            details="File ID 94e5e83c-4870-4ec4-bd67-6e08bd5cfcdb uploaded. Filename: Worli_Apartment_Floorplan.pdf",
            timestamp=base_time + timedelta(hours=13)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="Lead Created",
            details="Lead ID b0fe7b21-1eac-48db-86f9-348321d62946 created for customer customer_profile_id",
            timestamp=base_time + timedelta(hours=14)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="Notification Marked Read",
            details="Notification ID c1a2d0f2-dbda-417b-84eb-6660b7293eb9 marked as read",
            timestamp=base_time + timedelta(hours=15)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=customer_user_id,
            action="User Logout",
            details="User john.doe@gmail.com logged out",
            timestamp=base_time + timedelta(hours=16)
        )
    ]
    
    for log in logs:
        db.session.add(log)
    db.session.flush()
