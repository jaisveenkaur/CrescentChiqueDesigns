from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from functools import wraps
from app.extensions import db
from app.models import Appointment, Customer

appointments_bp = Blueprint('appointments', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@appointments_bp.route('', methods=['POST'])
@login_required
def create_appointment():
    """Schedules a new consultation appointment slot for the logged-in customer."""
    # Ensure active user is a customer with an initialized profile
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can book appointments"}), 403
        
    data = request.get_json() or {}
    
    required = ['appointment_date', 'appointment_time']
    missing = [f for f in required if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    try:
        # Parse date and time parameters
        appt_date = datetime.strptime(data['appointment_date'].strip(), '%Y-%m-%d').date()
        # Parse HH:MM or HH:MM:SS format
        time_str = data['appointment_time'].strip()
        if len(time_str.split(':')) == 2:
            appt_time = datetime.strptime(time_str, '%H:%M').time()
        else:
            appt_time = datetime.strptime(time_str, '%H:%M:%S').time()
            
        if appt_date < datetime.utcnow().date():
            return jsonify({"error": "Cannot schedule consultations in the past"}), 400
            
    except ValueError:
        return jsonify({"error": "Invalid format. Date must be YYYY-MM-DD and Time must be HH:MM or HH:MM:SS"}), 400
        
    try:
        appointment = Appointment(
            customer_id=current_user.customer.id,
            appointment_date=appt_date,
            appointment_time=appt_time,
            status='pending',
            requirements=data.get('requirements', '').strip() or None,
            floor_plan_url=data.get('floor_plan_url', '').strip() or None
        )
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            "message": "Appointment scheduled successfully",
            "appointment": {
                "id": appointment.id,
                "appointment_date": appointment.appointment_date.isoformat(),
                "appointment_time": appointment.appointment_time.isoformat(),
                "status": appointment.status
            }
        }), 201
        
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to book appointment"}), 500


@appointments_bp.route('', methods=['GET'])
@login_required
def get_appointments():
    """Lists appointments depending on role authorization (admins see all, customers see their own)."""
    if current_user.role == 'admin':
        appointments = Appointment.query.filter_by(is_deleted=False).all()
    elif current_user.role == 'customer' and current_user.customer:
        appointments = Appointment.query.filter_by(
            customer_id=current_user.customer.id, 
            is_deleted=False
        ).all()
    else:
        return jsonify({"error": "Unauthorized role access"}), 403
        
    response = []
    for a in appointments:
        response.append({
            "id": a.id,
            "customer_id": a.customer_id,
            "appointment_date": a.appointment_date.isoformat(),
            "appointment_time": a.appointment_time.isoformat(),
            "status": a.status,
            "requirements": a.requirements,
            "floor_plan_url": a.floor_plan_url
        })
    return jsonify(response), 200


@appointments_bp.route('/<string:appointment_id>/status', methods=['PUT'])
@login_required
@admin_required
def update_status(appointment_id):
    """Modifies the status of a scheduled consultation slot (Admin only)."""
    appointment = Appointment.query.filter_by(id=appointment_id, is_deleted=False).first()
    if not appointment:
        return jsonify({"error": "Appointment slot not found"}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status', '').strip().lower()
    
    allowed = {'pending', 'confirmed', 'completed', 'cancelled'}
    if new_status not in allowed:
        return jsonify({"error": f"Invalid status value. Must be one of: {allowed}"}), 400
        
    try:
        appointment.status = new_status
        db.session.commit()
        return jsonify({
            "message": "Appointment status modified successfully",
            "appointment": {
                "id": appointment.id,
                "status": appointment.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to modify appointment status: {str(e)}"}), 500

@appointments_bp.route('/<string:appointment_id>', methods=['DELETE'])
@login_required
def cancel_appointment(appointment_id):

    appointment = Appointment.query.filter_by(
        id=appointment_id,
        is_deleted=False
    ).first()

    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    if current_user.role != "admin":
        if appointment.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized"}), 403

    appointment.status = "cancelled"

    db.session.commit()

    return jsonify({
        "message": "Appointment cancelled successfully"
    }), 200

    