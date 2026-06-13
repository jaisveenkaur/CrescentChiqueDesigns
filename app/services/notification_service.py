from app.models import Notification

class NotificationService:
    """Business logic validations and read operations for customer alerts."""
    
    @classmethod
    def validate_notification(cls, title, message):
        """Validates input data parameters for new notification entries.
        
        Returns validated (title, message).
        Raises ValueError if validation fails.
        """
        if not title or not str(title).strip():
            raise ValueError("Notification title cannot be empty")
        if not message or not str(message).strip():
            raise ValueError("Notification message cannot be empty")
        return title.strip(), message.strip()

    @classmethod
    def mark_as_read(cls, notification_id, customer_id):
        """Marks a customer notification as read after validating ownership controls.
        
        Returns the updated Notification model instance.
        Raises ValueError if validation/access checks fail.
        """
        notification = Notification.query.filter_by(
            id=notification_id,
            customer_id=customer_id,
            is_deleted=False
        ).first()
        
        if not notification:
            raise ValueError("Notification not found or unauthorized access")
            
        notification.is_read = True
        return notification
