from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.extensions import db
from app.models import Project
from app.services.project_note_service import ProjectNoteService
from app.services.audit_service import AuditService

project_notes_bp = Blueprint('project_notes', __name__)

def admin_required(f):
    """Decorator to restrict access to Admin users only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@project_notes_bp.route('/<string:project_id>/notes', methods=['POST'])
@login_required
@admin_required
def add_project_note(project_id):
    """Creates a new note for the target project (Admin only)."""
    project = Project.query.filter_by(id=project_id, is_deleted=False).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    data = request.get_json() or {}
    if 'note' not in data:
        return jsonify({"error": "Missing required field: note"}), 400
        
    note_text = data['note']
    try:
        note_record = ProjectNoteService.create_note(
            project_id=project_id,
            note_text=note_text,
            user_id=current_user.id
        )
        
        # Audit logging
        AuditService.log(
            user_id=current_user.id,
            action="Project Note Added",
            details=f"Project ID {project.id} note added by admin {current_user.email}"
        )
        
        return jsonify({
            "message": "Project note added successfully",
            "note": {
                "id": note_record.id,
                "note": note_record.note,
                "created_at": note_record.created_at.isoformat()
            }
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add project note: {str(e)}"}), 500


@project_notes_bp.route('/<string:project_id>/notes', methods=['GET'])
@login_required
def get_project_notes(project_id):
    """Retrieves all notes associated with a project (Admin or project owner Customer)."""
    project = Project.query.filter_by(id=project_id, is_deleted=False).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    # Access control verification
    if current_user.role != 'admin':
        if not current_user.customer or project.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403
            
    try:
        notes = ProjectNoteService.get_notes_for_project(project_id)
        
        # Audit logging
        AuditService.log(
            user_id=current_user.id,
            action="Project Notes Viewed",
            details=f"Project ID {project.id} notes viewed by {current_user.role} {current_user.email}"
        )
        
        response_data = [
            {
                "note": n.note,
                "created_at": n.created_at.isoformat()
            } for n in notes
        ]
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve project notes: {str(e)}"}), 500
