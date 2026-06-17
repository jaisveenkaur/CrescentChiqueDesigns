import setup_paths
import uuid
from app.models import db, Lead

def seed_leads(customer_profile_id):
    """Seeds incoming lead inquiries.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
    """
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
    db.session.flush()
