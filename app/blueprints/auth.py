from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models import User, Customer

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registers a new customer account and creates their profile within a database transaction."""
    data = request.get_json() or {}
    
    # Required parameters validation
    required_fields = ['name', 'email', 'password', 'phone', 'city', 'state']
    missing = [f for f in required_fields if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    email = str(data['email']).lower().strip()
    
    # Check duplicate email
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 409
        
    try:
        # Create user account
        user = User(
            name=data['name'].strip(),
            email=email,
            password_hash=generate_password_hash(data['password']),
            role='customer'
        )
        db.session.add(user)
        db.session.flush() # Secure User ID for profile mapping
        
        # Create customer profile
        customer = Customer(
            user_id=user.id,
            phone=data['phone'].strip(),
            address=data.get('address', '').strip() or None,
            city=data['city'].strip(),
            state=data['state'].strip()
        )
        db.session.add(customer)
        db.session.commit()
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error during registration: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates credentials and establishes user session context."""
    data = request.get_json() or {}
    email = str(data.get('email', '')).lower().strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    user = User.query.filter_by(email=email, is_deleted=False).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    # Start session
    login_user(user, remember=data.get('remember', False))
    
    response = {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }
    return jsonify(response), 200


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Terminates active session context."""
    logout_user()
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    """Retrieves or modifies active user and profile details."""
    if request.method == 'GET':
        profile_data = {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
        
        # Pull extra details for customer roles
        if current_user.role == 'customer' and current_user.customer:
            profile_data.update({
                "phone": current_user.customer.phone,
                "address": current_user.customer.address,
                "city": current_user.customer.city,
                "state": current_user.customer.state
            })
            
        return jsonify(profile_data), 200
        
    # PUT request implementation
    data = request.get_json() or {}
    
    try:
        # Update core user attributes
        if 'name' in data and str(data['name']).strip():
            current_user.name = data['name'].strip()
            
        # Update customer profile attributes
        if current_user.role == 'customer' and current_user.customer:
            customer = current_user.customer
            if 'phone' in data and str(data['phone']).strip():
                customer.phone = data['phone'].strip()
            if 'address' in data:
                customer.address = data['address'].strip() or None
            if 'city' in data and str(data['city']).strip():
                customer.city = data['city'].strip()
            if 'state' in data and str(data['state']).strip():
                customer.state = data['state'].strip()
                
        db.session.commit()
        
        updated_data = {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role
            }
        }
        if current_user.role == 'customer' and current_user.customer:
            updated_data["user"].update({
                "phone": current_user.customer.phone,
                "address": current_user.customer.address,
                "city": current_user.customer.city,
                "state": current_user.customer.state
            })
        return jsonify(updated_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500
