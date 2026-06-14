from flask import Blueprint, jsonify
# pyrefly: ignore [missing-import]
from flask_login import login_required, current_user
from app.services.timeline_service import TimelineService

timeline_bp = Blueprint('timeline', __name__)

@timeline_bp.route('', methods=['GET'])
@login_required
def get_timeline():
    """Fetches the chronological activity history timeline for the logged-in customer."""
    # Guard: only customer role with active profiles can query timeline
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can access their timeline"}), 403

    events = TimelineService.get_customer_timeline(current_user.customer.id)
    return jsonify({
        "total_events": len(events),
        "items": events
    }), 200
