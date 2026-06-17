import setup_paths
import uuid
from app.models import db, File

def seed_files(customer_profile_id):
    """Seeds customer uploaded file record metadata.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
    """
    customer_file = File(
        id=str(uuid.uuid4()),
        customer_id=customer_profile_id,
        filename="Worli_Apartment_Floorplan.pdf",
        file_url="/static/uploads/files/worli_flat_402.pdf",
        file_type="pdf"
    )
    db.session.add(customer_file)
    db.session.flush()
