from decimal import Decimal
from app.models import Project

class ProjectService:
    """Validates project milestones and progress metrics for the timeline tracking module."""
    
    VALID_STATUSES = {
        "Lead Created",
        "Quotation Approved",
        "Design Finalized",
        "Procurement",
        "Execution",
        "Quality Check",
        "Completed"
    }

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
    def validate_progress_percentage(cls, value):
        """Validates that progress_percentage is an integer between 0 and 100.
        
        Returns the validated integer.
        Raises ValueError if validation fails.
        """
        if value is None:
            raise ValueError("progress_percentage cannot be None")
        if isinstance(value, bool):
            raise ValueError("progress_percentage must be a valid integer")
        try:
            val = int(value)
            if float(value) != val:
                raise ValueError("progress_percentage must be a valid integer")
        except (ValueError, TypeError):
            raise ValueError("progress_percentage must be a valid integer")
            
        if val < 0 or val > 100:
            raise ValueError("progress_percentage must be between 0 and 100")
        return val

    @classmethod
    def validate_project_update(cls, status, progress):
        """Checks if status string matches valid statuses, and filters progress bounds.
        
        Returns validated (status, progress_integer).
        Raises ValueError if validations fail.
        """
        # Validate status configuration values
        if status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid project status. Must be one of: {list(cls.VALID_STATUSES)}")
            
        prog = cls.validate_progress_percentage(progress)
        return status, prog

    @classmethod
    def search_projects(cls, user_role, customer_id, filters, page_param, per_page_param):
        """Applies filters, checks role boundaries, and paginates Project queries.
        
        Returns a dictionary mapping paginated results.
        Raises ValueError if validation fails.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        
        query = Project.query.filter(Project.is_deleted == False)
        
        # Access control checks
        if user_role == 'admin':
            pass
        elif user_role == 'customer':
            query = query.filter(Project.customer_id == customer_id)
        else:
            raise ValueError("Unauthorized role access")
            
        # Apply filters
        project_status = filters.get('project_status')
        if project_status:
            query = query.filter(Project.project_status == project_status)
            
        min_progress = filters.get('min_progress')
        if min_progress is not None:
            try:
                min_prog = int(min_progress)
                if float(min_progress) != min_prog:
                    raise ValueError("min_progress must be a valid integer")
                if min_prog < 0 or min_prog > 100:
                    raise ValueError("min_progress must be between 0 and 100")
            except (ValueError, TypeError):
                raise ValueError("min_progress must be a valid integer")
            query = query.filter(Project.progress_percentage >= min_prog)
            
        max_progress = filters.get('max_progress')
        if max_progress is not None:
            try:
                max_prog = int(max_progress)
                if float(max_progress) != max_prog:
                    raise ValueError("max_progress must be a valid integer")
                if max_prog < 0 or max_prog > 100:
                    raise ValueError("max_progress must be between 0 and 100")
            except (ValueError, TypeError):
                raise ValueError("max_progress must be a valid integer")
            query = query.filter(Project.progress_percentage <= max_prog)
            
        # Execute paginated query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(Project.created_at.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }
