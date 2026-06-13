from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Quotation
from app.services.quotation_service import QuotationService

quotations_bp = Blueprint('quotations', __name__)

@quotations_bp.route('/generate', methods=['POST'])
def generate_quotation():
    """Generates cost estimations on-the-fly without database persistence."""
    data = request.get_json() or {}
    
    required = ['design_id', 'area_sqft', 'material_grade']
    missing = [f for f in required if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    design_id = str(data['design_id']).strip()
    area_sqft = data['area_sqft']
    material_grade = str(data['material_grade']).strip()
    
    try:
        costs = QuotationService.calculate_costs(design_id, area_sqft, material_grade)
        return jsonify({
            "material_cost": float(costs["material_cost"]),
            "labour_cost": float(costs["labour_cost"]),
            "design_cost": float(costs["design_cost"]),
            "tax_amount": float(costs["tax_amount"]),
            "total_amount": float(costs["total_amount"])
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal estimation failure: {str(e)}"}), 500


@quotations_bp.route('', methods=['POST'])
@login_required
def save_quotation():
    """Calculates design cost metrics and persists a new quotation for the logged-in customer."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can save quotations"}), 403
        
    data = request.get_json() or {}
    
    required = ['design_id', 'area_sqft', 'material_grade']
    missing = [f for f in required if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    design_id = str(data['design_id']).strip()
    area_sqft = data['area_sqft']
    material_grade = str(data['material_grade']).strip()
    
    try:
        # Generate calculation breakdown
        costs = QuotationService.calculate_costs(design_id, area_sqft, material_grade)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    try:
        # Save to DB
        quotation = Quotation(
            customer_id=current_user.customer.id,
            design_id=costs["design_id"],
            area_sqft=costs["area_sqft"],
            material_grade=costs["material_grade"],
            material_cost=costs["material_cost"],
            labour_cost=costs["labour_cost"],
            design_cost=costs["design_cost"],
            tax_amount=costs["tax_amount"],
            total_amount=costs["total_amount"]
        )
        db.session.add(quotation)
        db.session.commit()
        
        return jsonify({
            "id": quotation.id,
            "customer_id": quotation.customer_id,
            "design_id": quotation.design_id,
            "area_sqft": float(quotation.area_sqft),
            "material_grade": quotation.material_grade,
            "material_cost": float(quotation.material_cost),
            "labour_cost": float(quotation.labour_cost),
            "design_cost": float(quotation.design_cost),
            "tax_amount": float(quotation.tax_amount),
            "total_amount": float(quotation.total_amount),
            "created_at": quotation.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database transaction failed: {str(e)}"}), 500


@quotations_bp.route('', methods=['GET'])
@login_required
def get_quotations():
    """Lists quotations depending on user authorization (admins see all, customers see their own)."""
    if current_user.role == 'admin':
        quotations = Quotation.query.filter_by(is_deleted=False).all()
    elif current_user.role == 'customer' and current_user.customer:
        quotations = Quotation.query.filter_by(
            customer_id=current_user.customer.id,
            is_deleted=False
        ).all()
    else:
        return jsonify({"error": "Unauthorized role access"}), 403
        
    response = []
    for q in quotations:
        response.append({
            "id": q.id,
            "customer_id": q.customer_id,
            "design_id": q.design_id,
            "area_sqft": float(q.area_sqft),
            "material_grade": q.material_grade,
            "material_cost": float(q.material_cost),
            "labour_cost": float(q.labour_cost),
            "design_cost": float(q.design_cost),
            "tax_amount": float(q.tax_amount),
            "total_amount": float(q.total_amount),
            "created_at": q.created_at.isoformat()
        })
    return jsonify(response), 200


@quotations_bp.route('/<string:quotation_id>', methods=['GET'])
@login_required
def get_quotation_details(quotation_id):
    """Retrieves detailed fields of a single quotation, ensuring ownership matches."""
    quotation = Quotation.query.filter_by(id=quotation_id, is_deleted=False).first()
    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404
        
    # Access control verification
    if current_user.role != 'admin':
        if not current_user.customer or quotation.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403
            
    response = {
        "id": quotation.id,
        "customer_id": quotation.customer_id,
        "design_id": quotation.design_id,
        "area_sqft": float(quotation.area_sqft),
        "material_grade": quotation.material_grade,
        "material_cost": float(quotation.material_cost),
        "labour_cost": float(quotation.labour_cost),
        "design_cost": float(quotation.design_cost),
        "tax_amount": float(quotation.tax_amount),
        "total_amount": float(quotation.total_amount),
        "created_at": quotation.created_at.isoformat()
    }
    return jsonify(response), 200
