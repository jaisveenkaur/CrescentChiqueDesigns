from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.extensions import db
from app.models import Project
from app.services.project_service import ProjectService

projects_bp = Blueprint('projects', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@projects_bp.route('', methods=['GET'])
@login_required
def get_projects():
    """Fetches non-deleted project entries filterable by role attributes (admins see all, customers see own)."""
    if current_user.role == 'admin':
        projects = Project.query.filter_by(is_deleted=False).all()
    elif current_user.role == 'customer' and current_user.customer:
        projects = Project.query.filter_by(
            customer_id=current_user.customer.id, 
            is_deleted=False
        ).all()
    else:
        return jsonify({"error": "Unauthorized role access"}), 403
        
    response = []
    for p in projects:
        response.append({
            "id": p.id,
            "quotation_id": p.quotation_id,
            "project_status": p.project_status,
            "progress_percentage": float(p.progress_percentage),
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "expected_completion": p.expected_completion.isoformat() if p.expected_completion else None
        })
    return jsonify(response), 200


@projects_bp.route('/<string:project_id>', methods=['GET'])
@login_required
def get_project_details(project_id):
    """Fetches full specifications for a single project, verifying ownership check filters."""
    project = Project.query.filter_by(id=project_id, is_deleted=False).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    # Access control verification check
    if current_user.role != 'admin':
        if not current_user.customer or project.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403
            
    return jsonify({
        "id": project.id,
        "customer_id": project.customer_id,
        "quotation_id": project.quotation_id,
        "project_status": project.project_status,
        "progress_percentage": float(project.progress_percentage),
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "expected_completion": project.expected_completion.isoformat() if project.expected_completion else None,
        "created_at": project.created_at.isoformat()
    }), 200


@projects_bp.route('/<string:project_id>/status', methods=['PUT'])
@login_required
@admin_required
def update_project_status(project_id):
    """Modifies the stage progress and milestone of a project (Admin only)."""
    project = Project.query.filter_by(id=project_id, is_deleted=False).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    data = request.get_json() or {}
    
    required = ['project_status', 'progress_percentage']
    missing = [f for f in required if f not in data or data[f] is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    status = str(data['project_status']).strip()
    progress = data['progress_percentage']
    
    try:
        # Validate properties using the service layer logic
        val_status, val_progress = ProjectService.validate_project_update(status, progress)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    try:
        project.project_status = val_status
        project.progress_percentage = val_progress
        
        # Committing transaction changes
        db.session.commit()
        
        return jsonify({
            "message": "Project status updated successfully",
            "project": {
                "id": project.id,
                "project_status": project.project_status,
                "progress_percentage": float(project.progress_percentage)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update project status: {str(e)}"}), 500
