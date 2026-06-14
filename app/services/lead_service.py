class LeadService:
    """Business logic validations and management operations for client inquiries (Leads)."""

    VALID_STATUSES = {'new', 'contacted', 'qualified', 'lost'}

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
