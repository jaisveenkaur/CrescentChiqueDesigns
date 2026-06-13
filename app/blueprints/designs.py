from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from decimal import Decimal
from app.extensions import db
from app.models import Design, DesignImage

designs_bp = Blueprint('designs', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function


@designs_bp.route('', methods=['GET'])
def get_designs():
    """Fetches non-deleted design portfolio entries filterable by style and room_type parameters."""
    style_filter = request.args.get('style')
    room_filter = request.args.get('room_type')
    
    query = Design.query.filter_by(is_deleted=False)
    
    if style_filter:
        query = query.filter(Design.style.ilike(style_filter.strip()))
    if room_filter:
        query = query.filter(Design.room_type.ilike(room_filter.strip()))
        
    designs = query.all()
    
    response = []
    for d in designs:
        response.append({
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "room_type": d.room_type,
            "style": d.style,
            "price_per_sqft": float(d.price_per_sqft),
            "image_url": d.image_url
        })
    return jsonify(response), 200


@designs_bp.route('/<string:design_id>', methods=['GET'])
def get_design(design_id):
    """Fetches individual design details and all mapped sub-images."""
    design = Design.query.filter_by(id=design_id, is_deleted=False).first()
    if not design:
        return jsonify({"error": "Design portfolio entry not found"}), 404
        
    sub_images = []
    for img in design.images:
        if not img.is_deleted:
            sub_images.append({
                "id": img.id,
                "image_url": img.image_url,
                "is_primary": img.is_primary
            })
            
    response = {
        "id": design.id,
        "title": design.title,
        "description": design.description,
        "room_type": design.room_type,
        "style": design.style,
        "price_per_sqft": float(design.price_per_sqft),
        "image_url": design.image_url,
        "sub_images": sub_images,
        "created_at": design.created_at.isoformat()
    }
    return jsonify(response), 200


@designs_bp.route('', methods=['POST'])
@login_required
@admin_required
def create_design():
    """Creates a new design portfolio item with primary and optional secondary images."""
    data = request.get_json() or {}
    
    required = ['title', 'description', 'room_type', 'style', 'price_per_sqft', 'image_url']
    missing = [f for f in required if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    try:
        price = Decimal(str(data['price_per_sqft']))
        if price <= 0:
            return jsonify({"error": "price_per_sqft must be a positive decimal"}), 400
    except ValueError:
        return jsonify({"error": "Invalid price_per_sqft format"}), 400
        
    try:
        # Create Design Entry
        design = Design(
            title=data['title'].strip(),
            description=data['description'].strip(),
            room_type=data['room_type'].strip(),
            style=data['style'].strip(),
            price_per_sqft=price,
            image_url=data['image_url'].strip()
        )
        db.session.add(design)
        db.session.flush() # Secure ID for mapping sub-images
        
        # Automatically add the primary image to sub-images list
        primary_image = DesignImage(
            design_id=design.id,
            image_url=data['image_url'].strip(),
            is_primary=True
        )
        db.session.add(primary_image)
        
        # Process optional extra design sub-images list
        extra_images = data.get('extra_images', [])
        for img_url in extra_images:
            if str(img_url).strip():
                sec_image = DesignImage(
                    design_id=design.id,
                    image_url=str(img_url).strip(),
                    is_primary=False
                )
                db.session.add(sec_image)
                
        db.session.commit()
        
        return jsonify({
            "message": "Design portfolio entry created successfully",
            "design": {
                "id": design.id,
                "title": design.title,
                "room_type": design.room_type,
                "style": design.style,
                "price_per_sqft": float(design.price_per_sqft)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save design portfolio entry: {str(e)}"}), 500


@designs_bp.route('/<string:design_id>', methods=['PUT'])
@login_required
@admin_required
def update_design(design_id):
    """Modifies an existing design portfolio record's attributes."""
    design = Design.query.filter_by(id=design_id, is_deleted=False).first()
    if not design:
        return jsonify({"error": "Design portfolio entry not found"}), 404
        
    data = request.get_json() or {}
    
    try:
        if 'title' in data and str(data['title']).strip():
            design.title = data['title'].strip()
        if 'description' in data and str(data['description']).strip():
            design.description = data['description'].strip()
        if 'room_type' in data and str(data['room_type']).strip():
            design.room_type = data['room_type'].strip()
        if 'style' in data and str(data['style']).strip():
            design.style = data['style'].strip()
        if 'image_url' in data and str(data['image_url']).strip():
            design.image_url = data['image_url'].strip()
            
        if 'price_per_sqft' in data:
            price = Decimal(str(data['price_per_sqft']))
            if price <= 0:
                return jsonify({"error": "price_per_sqft must be a positive decimal"}), 400
            design.price_per_sqft = price
            
        db.session.commit()
        return jsonify({
            "message": "Design portfolio entry updated successfully",
            "design": {
                "id": design.id,
                "title": design.title,
                "room_type": design.room_type,
                "style": design.style,
                "price_per_sqft": float(design.price_per_sqft)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to modify design entry: {str(e)}"}), 500


@designs_bp.route('/<string:design_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_design(design_id):
    """Soft deletes a design portfolio entry and all linked sub-images."""
    design = Design.query.filter_by(id=design_id, is_deleted=False).first()
    if not design:
        return jsonify({"error": "Design portfolio entry not found"}), 404
        
    try:
        design.soft_delete()
        
        # Cascade soft-deletion to all sub-images
        for img in design.images:
            if not img.is_deleted:
                img.soft_delete()
                
        db.session.commit()
        return jsonify({"message": "Design portfolio entry soft-deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete design entry: {str(e)}"}), 500
