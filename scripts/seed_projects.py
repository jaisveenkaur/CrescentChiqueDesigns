import setup_paths
import uuid
from datetime import date
from decimal import Decimal
from app.models import db, Project

def seed_projects(customer_profile_id, quote_id):
    """Seeds active project trackers.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
        quote_id (str): The Quotation UUID.
        
    Returns:
        str: project_id
    """
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
    return project_id
