import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from app.models import File

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
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
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
