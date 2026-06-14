import uuid
from datetime import date, time
from app.models import db, Appointment

def seed_appointments(customer_profile_id):
    """Seeds customer consultation appointments.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
        
    Returns:
        str: appt_id
    """
    appt_id = str(uuid.uuid4())
    appointment = Appointment(
        id=appt_id,
        customer_id=customer_profile_id,
        appointment_date=date(2026, 6, 25),
        appointment_time=time(14, 30, 0),
        status="confirmed",
        requirements="Need spatial rearrangement ideas for the living room, specifically wanting to accommodate a bookshelf.",
        floor_plan_url="/static/uploads/floorplans/worli_flat_402.pdf"
    )
    db.session.add(appointment)
    db.session.flush()
    return appt_id
