from app.extensions import db
from app.models import ProjectNote

class ProjectNoteService:
    """Business logic and validations for Project Note tracking logs."""

    @classmethod
    def validate_note_content(cls, note):
        """Validates that a note is present and does not exceed 2000 characters.
        
        Raises ValueError if validation fails.
        """
        if not note or not isinstance(note, str):
            raise ValueError("note is required and must be a string")
        
        note_stripped = note.strip()
        if not note_stripped:
            raise ValueError("note cannot be empty or whitespace only")
            
        if len(note_stripped) > 2000:
            raise ValueError("note must be 2000 characters or less")
            
        return note_stripped

    @classmethod
    def create_note(cls, project_id, note_text, user_id):
        """Validates, creates, and commits a new project note record.
        
        Returns:
            ProjectNote: The created ProjectNote instance.
        """
        validated_note = cls.validate_note_content(note_text)
        
        note_record = ProjectNote(
            project_id=project_id,
            note=validated_note,
            created_by=user_id
        )
        
        db.session.add(note_record)
        db.session.commit()
        return note_record

    @classmethod
    def get_notes_for_project(cls, project_id):
        """Retrieves non-deleted project notes for the given project_id.
        
        Sorted by created_at ascending (chronological).
        """
        return ProjectNote.query.filter_by(
            project_id=project_id,
            is_deleted=False
        ).order_by(ProjectNote.created_at.asc()).all()
