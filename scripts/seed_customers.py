import setup_paths
import uuid
from app.models import db, Customer

def seed_customers(customer_user_id):
    """Seeds the customer workspace profile record.
    
    Args:
        customer_user_id (str): The User UUID this profile relates to.
        
    Returns:
        str: customer_profile_id
    """
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
    return customer_profile_id
