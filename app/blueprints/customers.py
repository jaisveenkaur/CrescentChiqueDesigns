from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.extensions import db
from app.models import Customer

customers_bp = Blueprint('customers', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@customers_bp.route('', methods=['GET'])
@login_required
@admin_required
def get_customers():
    """Retrieves registered customer profiles with dynamic membership tier lookup."""
    customers = Customer.query.filter_by(is_deleted=False).all()
    
    response_items = []
    for c in customers:
        user = c.user
        if not user or user.is_deleted:
            continue
            
        # Determine tier dynamically from saved quotation grades, default to 'Premium'
        tier = 'Premium'
        if c.quotations:
            grades = [q.material_grade for q in c.quotations if not q.is_deleted]
            if 'Luxury' in grades:
                tier = 'Luxury'
            elif 'Premium' in grades:
                tier = 'Premium'
            elif 'Economy' in grades:
                tier = 'Economy'
                
        response_items.append({
            "id": c.id,
            "name": user.name,
            "email": user.email,
            "phone": c.phone,
            "address": c.address or "",
            "city": c.city,
            "state": c.state,
            "registered_at": c.created_at.isoformat(),
            "tier": tier
        })
        
    return jsonify(response_items), 200
