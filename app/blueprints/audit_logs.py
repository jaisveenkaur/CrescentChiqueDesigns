from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.services.audit_service import AuditService

audit_logs_bp = Blueprint('audit_logs', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@audit_logs_bp.route('', methods=['GET'])
@login_required
@admin_required
def get_audit_logs():
    """Fetches paginated list of system audit log entries (Admin only)."""
    page_param = request.args.get('page')
    per_page_param = request.args.get('per_page')
    
    filters = {
        'action': request.args.get('action'),
        'user_id': request.args.get('user_id')
    }
    
    try:
        results = AuditService.search_logs(
            filters=filters,
            page_param=page_param,
            per_page_param=per_page_param
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    response_items = []
    for item in results["items"]:
        response_items.append({
            "id": item.id,
            "user_id": item.user_id,
            "action": item.action,
            "details": item.details,
            "timestamp": item.timestamp.isoformat()
        })
        
    return jsonify({
        "page": results["page"],
        "per_page": results["per_page"],
        "total": results["total"],
        "pages": results["pages"],
        "items": response_items
    }), 200
