from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from functools import wraps
from app.services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function

def customer_required(f):
    """Decorator to restrict view access to Customer roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'customer':
            return jsonify({"error": "Customer privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@dashboard_bp.route('/admin', methods=['GET'])
@login_required
@admin_required
def get_admin_dashboard():
    """Retrieves aggregated operational system stats for administrators."""
    try:
        metrics = DashboardService.get_admin_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve admin dashboard metrics: {str(e)}"}), 500


@dashboard_bp.route('/customer', methods=['GET'])
@login_required
@customer_required
def get_customer_dashboard():
    """Retrieves customer-specific operational stats for their active workspace."""
    if not current_user.customer:
        return jsonify({"error": "Customer profile details not found. Please complete profile registration."}), 404
        
    try:
        metrics = DashboardService.get_customer_metrics(current_user.customer.id)
        return jsonify(metrics), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve customer dashboard metrics: {str(e)}"}), 500
