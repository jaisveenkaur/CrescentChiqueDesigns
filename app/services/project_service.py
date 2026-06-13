from decimal import Decimal

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
    def validate_project_update(cls, status, progress):
        """Checks if status string matches valid statuses, and filters progress bounds.
        
        Returns validated (status, progress_decimal).
        Raises ValueError if validations fail.
        """
        # Validate status configuration values
        if status not in cls.VALID_STATUSES:
            raise ValueError(f"Invalid project status. Must be one of: {list(cls.VALID_STATUSES)}")
            
        # Validate progress decimal inputs
        try:
            prog = Decimal(str(progress))
        except (ValueError, TypeError):
            raise ValueError("progress_percentage must be a valid number")
            
        if prog < 0 or prog > 100:
            raise ValueError("progress_percentage must be between 0 and 100")
            
        return status, prog
