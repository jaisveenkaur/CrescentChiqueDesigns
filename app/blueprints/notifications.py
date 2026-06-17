from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Notification
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@login_required
def get_notifications():
    """Fetches non-deleted notifications associated with the logged-in customer."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can access notifications"}), 403
        
    notifications = Notification.query.filter_by(
        customer_id=current_user.customer.id,
        is_deleted=False
    ).order_by(Notification.created_at.desc()).all()
    
    response = []
    for n in notifications:
        response.append({
            "id": n.id,
            "customer_id": n.customer_id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "updated_at": n.updated_at.isoformat()
        })
    return jsonify(response), 200


@notifications_bp.route('/<string:notification_id>', methods=['GET'])
@login_required
def get_notification_details(notification_id):
    """Retrieves full details of a single notification, validating client ownership."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can access notifications"}), 403
        
    notification = Notification.query.filter_by(
        id=notification_id,
        customer_id=current_user.customer.id,
        is_deleted=False
    ).first()
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    return jsonify({
        "id": notification.id,
        "customer_id": notification.customer_id,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
        "updated_at": notification.updated_at.isoformat()
    }), 200


@notifications_bp.route('/<string:notification_id>/read', methods=['PUT'])
@login_required
def mark_notification_read(notification_id):
    """Sets a customer notification's read state to True."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can modify notifications"}), 403
        
    try:
        # Business logic validation via the service layer
        notification = NotificationService.mark_as_read(notification_id, current_user.customer.id)
        db.session.commit()
        
        # Audit logging
        AuditService.log(current_user.id, "Notification Marked Read", f"Notification ID {notification.id} marked as read")
        
        return jsonify({
            "message": "Notification marked as read successfully",
            "notification": {
                "id": notification.id,
                "is_read": notification.is_read
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to mark notification as read: {str(e)}"}), 500


def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@notifications_bp.route('', methods=['POST'])
@login_required
@admin_required
def create_notification():
    """Allows administrators to broadcast custom alert notifications to specific customers."""
    data = request.get_json() or {}
    customer_id = data.get('customer_id')
    title = data.get('title')
    message = data.get('message')
    
    if not customer_id or not title or not message:
        return jsonify({"error": "Missing required fields: customer_id, title, message"}), 400
        
    try:
        from app.models import Customer
        cust = Customer.query.filter_by(id=customer_id, is_deleted=False).first()
        if not cust:
            return jsonify({"error": "Target customer profile not found"}), 404
            
        n = Notification(
            customer_id=customer_id,
            title=title.strip(),
            message=message.strip(),
            is_read=False
        )
        db.session.add(n)
        db.session.commit()
        
        # Audit logging
        AuditService.log(
            current_user.id,
            "Notification Broadcasted",
            f"Notification ID {n.id} sent to customer {customer_id}"
        )
        
        return jsonify({
            "message": "Notification dispatched successfully",
            "notification": {
                "id": n.id,
                "customer_id": n.customer_id,
                "title": n.title,
                "message": n.message
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to dispatch notification: {str(e)}"}), 500
