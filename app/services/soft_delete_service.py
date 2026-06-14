from datetime import datetime
from app.extensions import db

class SoftDeleteService:
    """Provides generic business logic operations for soft deleting and restoring SQLAlchemy database records."""

    @classmethod
    def soft_delete_record(cls, model_class, record_id):
        """Sets is_deleted=True and updates deleted_at timestamp for a target record.
        
        Returns the updated record model instance.
        Raises ValueError if record doesn't exist or is already deleted.
        """
        record = model_class.query.filter_by(id=record_id).first()
        if not record:
            raise ValueError(f"{model_class.__name__} record not found")

        if record.is_deleted:
            raise ValueError(f"{model_class.__name__} record is already soft-deleted")

        record.is_deleted = True
        record.deleted_at = datetime.utcnow()
        db.session.commit()
        return record

    @classmethod
    def restore_record(cls, model_class, record_id):
        """Sets is_deleted=False and clears deleted_at timestamp for a soft-deleted record.
        
        Returns the restored record model instance.
        Raises ValueError if record doesn't exist or is not deleted.
        """
        record = model_class.query.filter_by(id=record_id).first()
        if not record:
            raise ValueError(f"{model_class.__name__} record not found")

        if not record.is_deleted:
            raise ValueError(f"{model_class.__name__} record is not soft-deleted")

        record.is_deleted = False
        record.deleted_at = None
        db.session.commit()
        return record
