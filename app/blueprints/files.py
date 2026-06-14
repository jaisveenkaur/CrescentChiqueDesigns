from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import File
from app.services.file_service import FileService

files_bp = Blueprint('files', __name__)

@files_bp.route('/upload', methods=['POST'])
@login_required
def upload_file():
    """Validates and uploads a file to static storage, registering it in the database for the active customer."""
    if current_user.role != 'customer' or not current_user.customer:
        return jsonify({"error": "Only registered customers can upload files"}), 403
        
    # Check if file object resides in request
    if 'file' not in request.files:
        return jsonify({"error": "No file parameter in request"}), 400
        
    file_obj = request.files['file']
    
    try:
        # Save and validate via the service layer
        upload_details = FileService.validate_and_save(file_obj, current_user.customer.id)
        
        # Persist File record in the database
        db_file = File(
            customer_id=current_user.customer.id,
            filename=upload_details["filename"],
            file_url=upload_details["file_url"],
            file_type=upload_details["file_type"]
        )
        db.session.add(db_file)
        db.session.commit()
        
        return jsonify({
            "id": db_file.id,
            "customer_id": db_file.customer_id,
            "filename": db_file.filename,
            "file_url": db_file.file_url,
            "file_type": db_file.file_type,
            "uploaded_at": db_file.uploaded_at.isoformat()
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to persist file record: {str(e)}"}), 500


@files_bp.route('', methods=['GET'])
@login_required
def get_files():
    """Lists files according to user role with search, filtering and pagination support."""
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
        'file_type': request.args.get('file_type'),
        'filename': request.args.get('filename')
    }
    
    try:
        results = FileService.search_files(
            user_role=current_user.role,
            customer_id=customer_id,
            filters=filters,
            page_param=page_param,
            per_page_param=per_page_param
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    response_items = []
    for f in results["items"]:
        response_items.append({
            "id": f.id,
            "customer_id": f.customer_id,
            "filename": f.filename,
            "file_url": f.file_url,
            "file_type": f.file_type,
            "uploaded_at": f.uploaded_at.isoformat()
        })
        
    return jsonify({
        "page": results["page"],
        "per_page": results["per_page"],
        "total": results["total"],
        "pages": results["pages"],
        "items": response_items
    }), 200


@files_bp.route('/<string:file_id>', methods=['GET'])
@login_required
def get_file_details(file_id):
    """Retrieves metadata properties of a single file object, checking access authorization."""
    file_record = File.query.filter_by(id=file_id, is_deleted=False).first()
    if not file_record:
        return jsonify({"error": "File record not found"}), 404
        
    # Verify user permissions
    if current_user.role != 'admin':
        if not current_user.customer or file_record.customer_id != current_user.customer.id:
            return jsonify({"error": "Unauthorized view access"}), 403
            
    return jsonify({
        "id": file_record.id,
        "customer_id": file_record.customer_id,
        "filename": file_record.filename,
        "file_url": file_record.file_url,
        "file_type": file_record.file_type,
        "uploaded_at": file_record.uploaded_at.isoformat()
    }), 200
