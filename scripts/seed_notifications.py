import setup_paths
import uuid
from app.models import db, Notification

def seed_notifications(customer_profile_id):
    """Seeds customer platform alert notifications.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
    """
    notification = Notification(
        id=str(uuid.uuid4()),
        customer_id=customer_profile_id,
        title="Project Stage Updated",
        message="Great news! Your living room project has successfully transitioned to the 'Execution' phase. Track progress on your dashboard.",
        is_read=False
    )
    db.session.add(notification)
    db.session.flush()
