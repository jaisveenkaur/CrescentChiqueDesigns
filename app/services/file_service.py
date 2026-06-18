import os
import uuid
from datetime import datetime, time
from werkzeug.utils import secure_filename
from flask import current_app
from app.models import File
from app.extensions import db

class FileService:
    """Provides business logic validations for file uploads, checking formats, sizes, and naming controls."""
    
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit as defined in TRD

    @classmethod
    def validate_pagination(cls, page_param, per_page_param):
        """Validates pagination parameters.
        
        Returns validated integers (page, per_page).
        Raises ValueError if validation fails.
        """
        try:
            page = int(page_param) if page_param is not None else 1
        except (ValueError, TypeError):
            raise ValueError("page parameter must be a valid integer")
        if page < 1:
            raise ValueError("page parameter must be at least 1")

        try:
            per_page = int(per_page_param) if per_page_param is not None else 10
        except (ValueError, TypeError):
            raise ValueError("per_page parameter must be a valid integer")
        if per_page < 1:
            raise ValueError("per_page parameter must be at least 1")
        if per_page > 100:
            raise ValueError("per_page parameter cannot exceed 100")

        return page, per_page

    @classmethod
    def allowed_file(cls, filename):
        """Helper to verify if a filename matches allowed extensions."""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_EXTENSIONS

    @classmethod
    def validate_and_save(cls, file_obj, customer_id):
        """Validates file types, sizes, and saves files to the static uploads directory.
        
        Returns a dictionary containing verified filename, file_url, and file_type extension.
        Raises ValueError if validation constraints are violated.
        """
        if not file_obj or not file_obj.filename:
            raise ValueError("No valid file provided")
            
        filename = file_obj.filename
        if not cls.allowed_file(filename):
            raise ValueError(f"Invalid file extension. Allowed extensions are: {cls.ALLOWED_EXTENSIONS}")
            
        # Verify file size boundaries safely
        file_obj.seek(0, os.SEEK_END)
        size = file_obj.tell()
        file_obj.seek(0) # Reset stream pointer
        
        if size > cls.MAX_FILE_SIZE:
            raise ValueError("File size exceeds maximum threshold limit of 10MB")
            
        # Sanitize name and prepend UUID to avoid server file namespace collisions
        sanitized_name = secure_filename(filename)
        ext = sanitized_name.rsplit('.', 1)[1].lower() if '.' in sanitized_name else 'dat'
        unique_name = f"{uuid.uuid4()}.{ext}"
        
        # Build uploads directory paths
        upload_folder = current_app.config.get(
            'UPLOAD_FOLDER',
            os.path.join(current_app.root_path, 'static', 'uploads')
        )
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_dest = os.path.join(upload_folder, unique_name)
        file_obj.save(file_dest)
        
        file_url = f"/static/uploads/{unique_name}"
        
        return {
            "filename": sanitized_name,
            "file_url": file_url,
            "file_type": ext
        }

    @classmethod
    def search_files(cls, user_role, customer_id, filters, page_param, per_page_param):
        """Applies filters, checks role boundaries, and paginates File queries.
        
        Returns a dictionary mapping paginated results.
        Raises ValueError if validation fails.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        
        query = File.query.filter(File.is_deleted == False)
        
        # Access control checks
        if user_role == 'admin':
            pass
        elif user_role == 'customer':
            query = query.filter(File.customer_id == customer_id)
        else:
            raise ValueError("Unauthorized role access")
            
        # Apply filters
        file_type = filters.get('file_type')
        if file_type:
            query = query.filter(File.file_type == str(file_type).strip().lower())
            
        filename = filters.get('filename')
        if filename:
            query = query.filter(File.filename.ilike(f"%{filename}%"))
            
        uploaded_after = filters.get('uploaded_after')
        if uploaded_after:
            try:
                dt_after = datetime.strptime(uploaded_after, "%Y-%m-%d")
            except (ValueError, TypeError):
                raise ValueError("uploaded_after must be in YYYY-MM-DD format")
            query = query.filter(File.uploaded_at >= dt_after)
            
        uploaded_before = filters.get('uploaded_before')
        if uploaded_before:
            try:
                dt_before = datetime.strptime(uploaded_before, "%Y-%m-%d")
                dt_before_end = datetime.combine(dt_before.date(), time.max)
            except (ValueError, TypeError):
                raise ValueError("uploaded_before must be in YYYY-MM-DD format")
            query = query.filter(File.uploaded_at <= dt_before_end)
            
        # Execute paginated query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(File.uploaded_at.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }

    @classmethod
    def download_file(cls, file_id, user_role, customer_id):
        """Verifies file record and checks permissions to return absolute file destination path.
        
        Raises ValueError, PermissionError, or FileNotFoundError.
        """
        file_record = File.query.filter_by(id=file_id, is_deleted=False).first()
        if not file_record:
            raise ValueError("File record not found")
            
        # Permission check
        if user_role != 'admin':
            if not customer_id or file_record.customer_id != customer_id:
                raise PermissionError("Unauthorized access to file")
                
        # Physical path resolution
        # file_url is e.g. "/static/uploads/<uuid>.<ext>"
        upload_folder = current_app.config.get(
            'UPLOAD_FOLDER',
            os.path.join(current_app.root_path, 'static', 'uploads')
        )
        filename = os.path.basename(file_record.file_url)
        filepath = os.path.join(upload_folder, filename)
        
        if not os.path.exists(filepath):
            raise FileNotFoundError("Physical file missing")
            
        return filepath

    @classmethod
    def soft_delete_file(cls, file_id, user_role, customer_id):
        """Logically marks the file record as soft-deleted after validating privileges.
        
        Raises ValueError or PermissionError.
        """
        file_record = File.query.filter_by(id=file_id).first()
        if not file_record:
            raise ValueError("File record not found")
            
        if file_record.is_deleted:
            raise ValueError("File record is already soft-deleted")
            
        # Permission check
        if user_role != 'admin':
            if not customer_id or file_record.customer_id != customer_id:
                raise PermissionError("Unauthorized delete access")
                
        file_record.is_deleted = True
        file_record.deleted_at = datetime.utcnow()
        db.session.commit()
        return file_record

    @classmethod
    def restore_file(cls, file_id, user_role):
        """Recovers a logically soft-deleted file record back to active state (Admin only).
        
        Raises ValueError or PermissionError.
        """
        if user_role != 'admin':
            raise PermissionError("Admin privilege required")
            
        file_record = File.query.filter_by(id=file_id).first()
        if not file_record:
            raise ValueError("File record not found")
            
        if not file_record.is_deleted:
            raise ValueError("File record is not soft-deleted")
            
        file_record.is_deleted = False
        file_record.deleted_at = None
        db.session.commit()
        return file_record
