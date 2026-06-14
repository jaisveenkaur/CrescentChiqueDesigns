import sys
from datetime import datetime
from app.extensions import db

class AuditService:
    """Provides business logic and safe persistence operations for system audit logging."""

    @classmethod
    def log(cls, user_id, action, details=None):
        """Creates an audit log record and commits it to the database, failing safely if any DB error occurs.
        
        Args:
            user_id (str): The User UUID context executing the action.
            action (str): Description classification name of the action.
            details (str, optional): Additional text details or JSON variables.
            
        Returns:
            AuditLog: The created AuditLog model instance or None if execution fails.
        """
        try:
            from app.models import AuditLog
            
            # Create audit record
            log_record = AuditLog(
                user_id=user_id,
                action=action,
                details=details,
                timestamp=datetime.utcnow()
            )
            db.session.add(log_record)
            db.session.commit()
            return log_record
        except Exception as e:
            # Safe rollback and fail-safe console logging
            try:
                db.session.rollback()
            except Exception:
                pass
            print(f"[AUDIT FAIL-SAFE ERROR]: Failed to log action '{action}' for user {user_id}: {str(e)}", file=sys.stderr)
            return None

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
    def search_logs(cls, filters, page_param, per_page_param):
        """Applies query filters, validates parameters, and returns paginated AuditLog list.
        
        Returns:
            dict: Mapping of page, per_page, total, pages, and items.
        """
        page, per_page = cls.validate_pagination(page_param, per_page_param)
        from app.models import AuditLog
        
        query = AuditLog.query
        
        # Apply filters
        action = filters.get('action')
        if action:
            query = query.filter(AuditLog.action == str(action).strip())
            
        user_id = filters.get('user_id')
        if user_id:
            query = query.filter(AuditLog.user_id == str(user_id).strip())
            
        # Execute query
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "items": items
        }
