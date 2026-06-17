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
        source="Instagram",
        status="new"
    )
    lead2 = Lead(
        id=str(uuid.uuid4()),
        customer_id=customer_profile_id, # Registered Customer inquiry
        name="John Doe",
        email="john.doe@gmail.com",
        phone="+919876543210",
        requirements="Need a quote revision for adding a kitchen wardrobe to the existing living room project layout.",
        source="Referral",
        status="qualified"
    )
    lead3 = Lead(
        id=str(uuid.uuid4()),
        customer_id=None,
        name="Michael Green",
        email="michael.green@yahoo.com",
        phone="+919811122233",
        requirements="Villa renovation project matching classic scandinavian look.",
        source="Houzz",
        status="contacted"
    )
    lead4 = Lead(
        id=str(uuid.uuid4()),
        customer_id=None,
        name="Sarah Connor",
        email="sarah.c@gmail.com",
        phone="+919922334455",
        requirements="Commercial office space interior consultation.",
        source="Google Search",
        status="lost"
    )
    lead5 = Lead(
        id=str(uuid.uuid4()),
        customer_id=None,
        name="David Beckham",
        email="david.b@gmail.com",
        phone="+919933445566",
        requirements="Premium duplex penthouse design concept in Mumbai.",
        source="Website",
        status="qualified"
    )
    db.session.add_all([lead1, lead2, lead3, lead4, lead5])
    db.session.flush()

