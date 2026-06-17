import setup_paths
import uuid
from decimal import Decimal
from app.models import db, Quotation

def seed_quotations(customer_profile_id, design_scandi_id):
    """Seeds quotation records.
    
    Args:
        customer_profile_id (str): The Customer profile UUID.
        design_scandi_id (str): The Scandinavian Design UUID.
        
    Returns:
        str: quote_id
    """
    area = Decimal("800.00")
    design_rate = Decimal("250.00")
    material_multiplier = Decimal("1500.00")
    
    mat_cost = area * material_multiplier
    lab_cost = mat_cost * Decimal("0.30")
    des_cost = area * design_rate
    subtotal = mat_cost + lab_cost + des_cost
    tax = subtotal * Decimal("0.18")
    total = subtotal + tax

    quote_id = str(uuid.uuid4())
    quotation = Quotation(
        id=quote_id,
        customer_id=customer_profile_id,
        design_id=design_scandi_id,
        area_sqft=area,
        material_grade="Premium",
        material_cost=mat_cost,
        labour_cost=lab_cost,
        design_cost=des_cost,
        tax_amount=tax,
        total_amount=total,
        pdf_url="/static/uploads/quotations/quote_scandi_mumbai_800.pdf",
        status="accepted"
    )

    # Seed a second, pending quotation
    area2 = Decimal("1200.00")
    design_rate2 = Decimal("250.00")
    material_multiplier2 = Decimal("2500.00") # Luxury grade
    
    mat_cost2 = area2 * material_multiplier2
    lab_cost2 = mat_cost2 * Decimal("0.30")
    des_cost2 = area2 * design_rate2
    subtotal2 = mat_cost2 + lab_cost2 + des_cost2
    tax2 = subtotal2 * Decimal("0.18")
    total2 = subtotal2 + tax2

    quote_id2 = str(uuid.uuid4())
    quotation2 = Quotation(
        id=quote_id2,
        customer_id=customer_profile_id,
        design_id=design_scandi_id,
        area_sqft=area2,
        material_grade="Luxury",
        material_cost=mat_cost2,
        labour_cost=lab_cost2,
        design_cost=des_cost2,
        tax_amount=tax2,
        total_amount=total2,
        pdf_url="/static/uploads/quotations/quote_luxury_mumbai_1200.pdf",
        status="pending"
    )

    db.session.add_all([quotation, quotation2])
    db.session.flush()
    return quote_id

