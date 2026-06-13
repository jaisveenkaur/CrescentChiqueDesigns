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
    """Lists files according to user role (admins see all files, customers see only their own uploads)."""
    if current_user.role == 'admin':
        files = File.query.filter_by(is_deleted=False).all()
    elif current_user.role == 'customer' and current_user.customer:
        files = File.query.filter_by(
            customer_id=current_user.customer.id, 
            is_deleted=False
        ).all()
    else:
        return jsonify({"error": "Unauthorized role access"}), 403
        
    response = []
    for f in files:
        response.append({
            "id": f.id,
            "customer_id": f.customer_id,
            "filename": f.filename,
            "file_url": f.file_url,
            "file_type": f.file_type,
            "uploaded_at": f.uploaded_at.isoformat()
        })
    return jsonify(response), 200


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
