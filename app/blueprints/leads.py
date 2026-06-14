from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.extensions import db
from app.models import Lead
from app.services.lead_service import LeadService

leads_bp = Blueprint('leads', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@leads_bp.route('', methods=['POST'])
@login_required
def create_lead():
    """Allows a registered customer to create a new service inquiry lead."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can create leads"}), 403
        
    data = request.get_json() or {}
    
    required = ['name', 'email', 'phone']
    missing = [field for field in required if field not in data or not str(data[field]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    name = data['name']
    email = data['email']
    phone = data['phone']
    requirements = data.get('requirements')
    
    try:
        clean_name, clean_email, clean_phone, clean_reqs = LeadService.validate_lead_creation(
            name, email, phone, requirements
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    try:
        lead = Lead(
            customer_id=current_user.customer.id,
            name=clean_name,
            email=clean_email,
            phone=clean_phone,
            requirements=clean_reqs,
            status='new'
        )
        db.session.add(lead)
        db.session.commit()
        
        return jsonify({
            "message": "Lead created successfully",
            "lead": {
                "id": lead.id,
                "customer_id": lead.customer_id,
                "name": lead.name,
                "email": lead.email,
                "phone": lead.phone,
                "requirements": lead.requirements,
                "status": lead.status,
                "created_at": lead.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create lead: {str(e)}"}), 500


@leads_bp.route('', methods=['GET'])
@login_required
def get_leads():
    """Fetches lead entries (admins see all leads, customers see only their own leads)."""
    if current_user.role == 'admin':
        leads = Lead.query.filter_by(is_deleted=False).all()
    elif current_user.role == 'customer' and current_user.customer:
        leads = Lead.query.filter_by(
            customer_id=current_user.customer.id, 
            is_deleted=False
        ).all()
    else:
        return jsonify({"error": "Unauthorized role access"}), 403
        
    response = []
    for lead in leads:
        response.append({
            "id": lead.id,
            "customer_id": lead.customer_id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "requirements": lead.requirements,
            "status": lead.status,
            "created_at": lead.created_at.isoformat()
        })
    return jsonify(response), 200


@leads_bp.route('/<string:lead_id>', methods=['GET'])
@login_required
def get_lead_details(lead_id):
    """Retrieves full details of a specific lead, verifying user permissions."""
    lead = Lead.query.filter_by(id=lead_id, is_deleted=False).first()
    if not lead:
        return jsonify({"error": "Lead not found"}), 404
        
    # Access control check
    if current_user.role != 'admin':
        if not current_user.customer or lead.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403
            
    return jsonify({
        "id": lead.id,
        "customer_id": lead.customer_id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "requirements": lead.requirements,
        "status": lead.status,
        "created_at": lead.created_at.isoformat(),
        "updated_at": lead.updated_at.isoformat()
    }), 200


@leads_bp.route('/<string:lead_id>/status', methods=['PUT'])
@login_required
@admin_required
def update_lead_status(lead_id):
    """Modifies the status of a specific lead (Admin only)."""
    lead = Lead.query.filter_by(id=lead_id, is_deleted=False).first()
    if not lead:
        return jsonify({"error": "Lead not found"}), 404
        
    data = request.get_json() or {}
    if 'status' not in data or not str(data['status']).strip():
        return jsonify({"error": "Missing required field: status"}), 400
        
    new_status = data['status']
    
    try:
        clean_status = LeadService.validate_lead_status(new_status)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    try:
        lead.status = clean_status
        db.session.commit()
        
        return jsonify({
            "message": "Lead status updated successfully",
            "lead": {
                "id": lead.id,
                "status": lead.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update lead status: {str(e)}"}), 500
