import uuid
# pyrefly: ignore [missing-import]
from werkzeug.security import generate_password_hash
from app.models import db, User

def seed_users():
    """Seeds administrative and customer user accounts.
    
    Returns:
        tuple: (admin_id, customer_user_id)
    """
    admin_id = str(uuid.uuid4())
    admin_user = User(
        id=admin_id,
        name="Chief Administrator",
        email="admin@crescentchique.com",
        password_hash=generate_password_hash("CCAdmin2026!"),
        role="admin"
    )
    db.session.add(admin_user)
    
    customer_user_id = str(uuid.uuid4())
    customer_user = User(
        id=customer_user_id,
        name="John Doe",
        email="john.doe@gmail.com",
        password_hash=generate_password_hash("JohnDoe2026!"),
        role="customer"
    )
    db.session.add(customer_user)
    db.session.flush()
    
    return admin_id, customer_user_id
