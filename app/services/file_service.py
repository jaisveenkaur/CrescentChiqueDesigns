import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

class FileService:
    """Provides business logic validations for file uploads, checking formats, sizes, and naming controls."""
    
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit as defined in TRD

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
