from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required, current_user
from functools import wraps
from app.extensions import db
from app.models import Quotation
from app.services.quotation_service import QuotationService
from app.services.soft_delete_service import SoftDeleteService
from app.services.audit_service import AuditService

quotations_bp = Blueprint('quotations', __name__)

def admin_required(f):
    """Decorator to restrict view access to Administrator roles only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Admin privilege required"}), 403
        return f(*args, **kwargs)
    return decorated_function

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
    """Calculates design cost metrics and persists a new quotation for a customer."""
    if current_user.role != 'customer' and current_user.role != 'admin':
        return jsonify({"error": "Unauthorized role access"}), 403
        
    data = request.get_json() or {}
    
    required = ['design_id', 'area_sqft', 'material_grade']
    missing = [f for f in required if f not in data or not str(data[f]).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
    design_id = str(data['design_id']).strip()
    area_sqft = data['area_sqft']
    material_grade = str(data['material_grade']).strip()
    
    customer_id = None
    if current_user.role == 'customer':
        if not current_user.customer:
            return jsonify({"error": "Only registered customers can save quotations"}), 403
        customer_id = current_user.customer.id
    elif current_user.role == 'admin':
        if 'customer_id' not in data or not str(data['customer_id']).strip():
            return jsonify({"error": "Missing required field: customer_id"}), 400
        customer_id = str(data['customer_id']).strip()
        
    try:
        # Generate calculation breakdown
        costs = QuotationService.calculate_costs(design_id, area_sqft, material_grade)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    try:
        # Save to DB
        quotation = Quotation(
            customer_id=customer_id,
            design_id=costs["design_id"],
            area_sqft=costs["area_sqft"],
            material_grade=costs["material_grade"],
            material_cost=costs["material_cost"],
            labour_cost=costs["labour_cost"],
            design_cost=costs["design_cost"],
            tax_amount=costs["tax_amount"],
            total_amount=costs["total_amount"],
            status="accepted" if current_user.role == "customer" else data.get("status", "pending")
        )
        db.session.add(quotation)
        db.session.commit()
        
        # Audit logging
        AuditService.log(current_user.id, "Quotation Created", f"Quotation ID {quotation.id} created with amount {quotation.total_amount}")
        
        # Email Notification (send fail-safely)
        try:
            from app.services.email_service import EmailService
            EmailService.send_quotation_generated(quotation, is_pdf=False)
        except Exception:
            pass
            
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
            "status": quotation.status,
            "created_at": quotation.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database transaction failed: {str(e)}"}), 500


@quotations_bp.route('/<string:quotation_id>', methods=['PUT'])
@login_required
@admin_required
def update_quotation(quotation_id):
    """Allows administrators to edit an existing quotation, re-calculating costs (Admin only)."""
    quotation = Quotation.query.filter_by(id=quotation_id, is_deleted=False).first()
    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404
        
    data = request.get_json() or {}
    
    try:
        # Determine if we need to re-calculate costs
        recalc_fields = ['design_id', 'area_sqft', 'material_grade']
        needs_recalc = any(f in data for f in recalc_fields)
        
        if needs_recalc:
            design_id = str(data.get('design_id', quotation.design_id)).strip()
            area_sqft = data.get('area_sqft', quotation.area_sqft)
            material_grade = str(data.get('material_grade', quotation.material_grade)).strip()
            
            costs = QuotationService.calculate_costs(design_id, area_sqft, material_grade)
            quotation.design_id = costs["design_id"]
            quotation.area_sqft = costs["area_sqft"]
            quotation.material_grade = costs["material_grade"]
            quotation.material_cost = costs["material_cost"]
            quotation.labour_cost = costs["labour_cost"]
            quotation.design_cost = costs["design_cost"]
            quotation.tax_amount = costs["tax_amount"]
            quotation.total_amount = costs["total_amount"]
        
        if 'customer_id' in data:
            quotation.customer_id = str(data['customer_id']).strip()
            
        if 'status' in data:
            # Validate status
            status = str(data['status']).strip()
            if status not in {'pending', 'accepted', 'rejected'}:
                return jsonify({"error": "Invalid quotation status"}), 400
            quotation.status = status

        db.session.commit()
        
        # Audit logging
        AuditService.log(current_user.id, "Quotation Updated", f"Quotation ID {quotation.id} fields updated by admin {current_user.email}")
        
        return jsonify({
            "message": "Quotation updated successfully",
            "quotation": {
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
                "status": quotation.status
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update quotation: {str(e)}"}), 500



@quotations_bp.route('', methods=['GET'])
@login_required
def get_quotations():
    """Lists quotations depending on user authorization with search, filtering and pagination support."""
    customer_id = None
    if current_user.role == 'customer':
        if not current_user.customer:
            return jsonify({"error": "Customer profile not found or inactive"}), 403
        customer_id = current_user.customer.id
    elif current_user.role != 'admin':
        return jsonify({"error": "Unauthorized role access"}), 403
        
    page_param = request.args.get('page')
    per_page_param = request.args.get('per_page')
    
    filters = {
        'material_grade': request.args.get('material_grade'),
        'min_amount': request.args.get('min_amount'),
        'max_amount': request.args.get('max_amount')
    }
    
    try:
        results = QuotationService.search_quotations(
            user_role=current_user.role,
            customer_id=customer_id,
            filters=filters,
            page_param=page_param,
            per_page_param=per_page_param
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    response_items = []
    for q in results["items"]:
        response_items.append({
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
        
    return jsonify({
        "page": results["page"],
        "per_page": results["per_page"],
        "total": results["total"],
        "pages": results["pages"],
        "items": response_items
    }), 200


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


@quotations_bp.route('/<string:quotation_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_quotation(quotation_id):
    """Soft deletes a quotation record logically from system operations (Admin only)."""
    try:
        SoftDeleteService.soft_delete_record(Quotation, quotation_id)
        return jsonify({"message": "Quotation deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete quotation: {str(e)}"}), 500


@quotations_bp.route('/<string:quotation_id>/restore', methods=['PUT'])
@login_required
@admin_required
def restore_quotation(quotation_id):
    """Recovers a logically soft-deleted quotation record back to active operations (Admin only)."""
    try:
        SoftDeleteService.restore_record(Quotation, quotation_id)
        return jsonify({"message": "Quotation restored successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to restore quotation: {str(e)}"}), 500


@quotations_bp.route('/<string:quotation_id>/pdf', methods=['GET'])
@login_required
def download_quotation_pdf(quotation_id):
    """Generates and returns the downloadable PDF format for a specific quotation."""
    quotation = Quotation.query.filter_by(id=quotation_id, is_deleted=False).first()
    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404

    # Access control verification
    if current_user.role != 'admin':
        if not current_user.customer or quotation.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403

    try:
        from app.services.pdf_service import PDFService
        pdf_buffer = PDFService.generate_quotation_pdf(quotation)
        
        # Audit logging
        AuditService.log(current_user.id, "PDF Generated", f"PDF generated for Quotation ID {quotation.id}")
        
        # Email Notification
        from app.services.email_service import EmailService
        EmailService.send_quotation_generated(quotation, is_pdf=True)

        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"quotation_{quotation.id}.pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

