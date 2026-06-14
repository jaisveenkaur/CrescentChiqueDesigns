from app.models import Lead

class LeadService:
    """Business logic validations and management operations for client inquiries (Leads)."""

    VALID_STATUSES = {'new', 'contacted', 'qualified', 'lost'}

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
    def validate_lead_creation(cls, name, email, phone, requirements=None):
        """Validates inputs for a new lead.
        
        Returns a tuple of (clean_name, clean_email, clean_phone, clean_requirements).
        Raises ValueError if validations fail.
        """
        if not name or not str(name).strip():
            raise ValueError("Lead name cannot be empty")
        
        if not email or not str(email).strip():
            raise ValueError("Lead email cannot be empty")
            
        clean_email = str(email).strip().lower()
        if '@' not in clean_email:
            raise ValueError("Invalid email format")
            
        if not phone or not str(phone).strip():
            raise ValueError("Lead phone number cannot be empty")
            
        clean_name = str(name).strip()
        clean_phone = str(phone).strip()
        clean_requirements = str(requirements).strip() if requirements else None
        
        return clean_name, clean_email, clean_phone, clean_requirements

    @classmethod
    def validate_lead_status(cls, status):
        """Checks if a status update value is valid.
        
        Returns the clean status string.
        Raises ValueError if validations fail.
        """
        if not status or not str(status).strip():
            raise ValueError("Lead status cannot be empty")
            
        clean_status = str(status).strip().lower()
        if clean_status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid lead status. Must be one of: {list(cls.VALID_STATUSES)}")
            
        return clean_status

    @classmethod
    def search_leads(cls, user_role, customer_id, filters, page_param, per_page_param):
        """Applies filters, checks role boundaries, and paginates Lead queries.
        
        Returns a dictionary mapping paginated results.
        Raises ValueError if validation fails.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        
        query = Lead.query.filter(Lead.is_deleted == False)
        
        # Access control checks
        if user_role == 'admin':
            pass # Admins can view all leads
        elif user_role == 'customer':
            query = query.filter(Lead.customer_id == customer_id)
        else:
            raise ValueError("Unauthorized role access")
            
        # Apply filters
        if 'status' in filters and filters['status']:
            query = query.filter(Lead.status == filters['status'])
            
        if 'name' in filters and filters['name']:
            query = query.filter(Lead.name.ilike(f"%{filters['name']}%"))
            
        if 'email' in filters and filters['email']:
            query = query.filter(Lead.email.ilike(f"%{filters['email']}%"))
            
        # Execute paginated query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(Lead.created_at.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }
