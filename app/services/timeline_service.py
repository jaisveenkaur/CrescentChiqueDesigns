from app.models import Lead, Appointment, Quotation, Project, Notification, File

class TimelineService:
    """Provides service layer business logic to aggregate historical activities for a customer chronologically."""

    @classmethod
    def get_customer_timeline(cls, customer_id):
        """Retrieves and merges timeline events from Leads, Appointments, Quotations, Projects,
        Notifications, and Files for the specified customer. Excludes soft-deleted records.
        
        Args:
            customer_id (str): The Customer UUID.
            
        Returns:
            list: Sorted list of timeline event dictionaries descending by created_at.
        """
        events = []

        # 1. Leads
        leads = Lead.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for lead in leads:
            events.append({
                "type": "lead",
                "title": "Lead Submitted",
                "description": lead.requirements or "No requirements specified",
                "created_at": lead.created_at.isoformat()
            })

        # 2. Appointments
        appointments = Appointment.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for appt in appointments:
            events.append({
                "type": "appointment",
                "title": "Appointment Booked",
                "description": appt.requirements or f"Consultation scheduled for {appt.appointment_date.isoformat()} {appt.appointment_time.isoformat()} (Status: {appt.status})",
                "created_at": appt.created_at.isoformat()
            })


        # 3. Quotations
        quotations = Quotation.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for quot in quotations:
            events.append({
                "type": "quotation",
                "title": "Quotation Generated",
                "description": f"Total Amount: ${float(quot.total_amount):,.2f} for area {float(quot.area_sqft)} sqft ({quot.material_grade} Grade)",
                "created_at": quot.created_at.isoformat()
            })

        # 4. Projects
        projects = Project.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for proj in projects:
            events.append({
                "type": "project",
                "title": "Project Phase Updated",
                "description": f"Project Phase: {proj.project_status} | Progress: {float(proj.progress_percentage)}% | Expected Completion: {proj.expected_completion.isoformat() if proj.expected_completion else 'TBD'}",
                "created_at": proj.created_at.isoformat()
            })

        # 5. Notifications
        notifications = Notification.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for noti in notifications:
            events.append({
                "type": "notification",
                "title": noti.title,
                "description": noti.message,
                "created_at": noti.created_at.isoformat()
            })

        # 6. File Uploads
        files = File.query.filter_by(customer_id=customer_id, is_deleted=False).all()
        for f in files:
            events.append({
                "type": "file",
                "title": "File Uploaded Successfully",
                "description": f"Filename: {f.filename} (Type: {f.file_type.upper()})",
                "created_at": f.created_at.isoformat()
            })

        # Sort all aggregated events descending by created_at timestamp
        events.sort(key=lambda x: x["created_at"], reverse=True)
        return events
