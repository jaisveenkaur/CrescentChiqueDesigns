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


@customers_bp.route('/<string:customer_id>', methods=['GET'])
@login_required
@admin_required
def get_customer_details(customer_id):
    """Retrieves full profile details, projects, quotations, files, and notifications for a customer (Admin only)."""
    c = Customer.query.filter_by(id=customer_id, is_deleted=False).first()
    if not c:
        return jsonify({"error": "Customer not found"}), 404
        
    user = c.user
    if not user or user.is_deleted:
        return jsonify({"error": "Customer user profile is inactive or deleted"}), 404

    # Determine tier dynamically
    tier = 'Premium'
    if c.quotations:
        grades = [q.material_grade for q in c.quotations if not q.is_deleted]
        if 'Luxury' in grades:
            tier = 'Luxury'
        elif 'Premium' in grades:
            tier = 'Premium'
        elif 'Economy' in grades:
            tier = 'Economy'

    # 1. Projects
    projects_list = []
    for p in c.projects:
        if not p.is_deleted:
            projects_list.append({
                "id": p.id,
                "project_status": p.project_status,
                "progress_percentage": int(p.progress_percentage),
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "expected_completion": p.expected_completion.isoformat() if p.expected_completion else None,
                "created_at": p.created_at.isoformat()
            })

    # 2. Quotations
    quotations_list = []
    for q in c.quotations:
        if not q.is_deleted:
            quotations_list.append({
                "id": q.id,
                "design_id": q.design_id,
                "design_title": q.design.title if q.design else "Custom Concept",
                "area_sqft": float(q.area_sqft),
                "material_grade": q.material_grade,
                "total_amount": float(q.total_amount),
                "status": q.status,
                "created_at": q.created_at.isoformat()
            })

    # 3. Appointments
    appointments_list = []
    for a in c.appointments:
        if not a.is_deleted:
            appointments_list.append({
                "id": a.id,
                "appointment_date": a.appointment_date.isoformat(),
                "appointment_time": a.appointment_time.isoformat() if hasattr(a.appointment_time, 'isoformat') else str(a.appointment_time),
                "status": a.status,
                "requirements": a.requirements,
                "created_at": a.created_at.isoformat()
            })

    # 4. Files
    files_list = []
    for f in c.files:
        if not f.is_deleted:
            files_list.append({
                "id": f.id,
                "filename": f.filename,
                "file_type": f.file_type,
                "uploaded_at": f.uploaded_at.isoformat()
            })

    # 5. Notifications
    notifications_list = []
    for n in c.notifications:
        if not n.is_deleted:
            notifications_list.append({
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            })

    return jsonify({
        "profile": {
            "id": c.id,
            "name": user.name,
            "email": user.email,
            "phone": c.phone,
            "address": c.address or "",
            "city": c.city,
            "state": c.state,
            "registered_at": c.created_at.isoformat(),
            "tier": tier
        },
        "projects": projects_list,
        "quotations": quotations_list,
        "appointments": appointments_list,
        "files": files_list,
        "notifications": notifications_list
    }), 200

