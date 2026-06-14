from datetime import datetime
from app.models import Appointment

class AppointmentService:
    """Validates appointment searches, query filtering, and role permissions."""

    VALID_STATUSES = {'pending', 'confirmed', 'completed', 'cancelled'}

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
    def search_appointments(cls, user_role, customer_id, filters, page_param, per_page_param):
        """Applies filters, checks role boundaries, and paginates Appointment queries.
        
        Returns a dictionary mapping paginated results.
        Raises ValueError if validation fails.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        
        query = Appointment.query.filter(Appointment.is_deleted == False)
        
        # Access control checks
        if user_role == 'admin':
            pass
        elif user_role == 'customer':
            query = query.filter(Appointment.customer_id == customer_id)
        else:
            raise ValueError("Unauthorized role access")
            
        # Apply filters
        status = filters.get('status')
        if status:
            clean_status = str(status).strip().lower()
            if clean_status not in cls.VALID_STATUSES:
                raise ValueError(f"Invalid appointment status. Must be one of: {list(cls.VALID_STATUSES)}")
            query = query.filter(Appointment.status == clean_status)
            
        appointment_date = filters.get('appointment_date')
        if appointment_date:
            try:
                date_obj = datetime.strptime(str(appointment_date).strip(), '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("appointment_date parameter must be in YYYY-MM-DD format")
            query = query.filter(Appointment.appointment_date == date_obj)
            
        # Execute paginated query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }
