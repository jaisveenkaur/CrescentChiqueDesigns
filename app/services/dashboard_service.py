from sqlalchemy import func
from app.extensions import db
from app.models import Customer, Lead, Quotation, Project, Appointment, File, Notification

class DashboardService:
    """Calculates summary stats and operational analytics for Admins and Customers."""

    @classmethod
    def get_admin_metrics(cls):
        """Aggregates system-wide counts for administrative operations dashboard.
        
        Ignores soft-deleted records.
        """
        total_customers = db.session.query(func.count(Customer.id)).filter(Customer.is_deleted == False).scalar() or 0
        total_leads = db.session.query(func.count(Lead.id)).filter(Lead.is_deleted == False).scalar() or 0
        new_leads = db.session.query(func.count(Lead.id)).filter(Lead.is_deleted == False, Lead.status == 'new').scalar() or 0
        qualified_leads = db.session.query(func.count(Lead.id)).filter(Lead.is_deleted == False, Lead.status == 'qualified').scalar() or 0
        total_quotations = db.session.query(func.count(Quotation.id)).filter(Quotation.is_deleted == False).scalar() or 0
        approved_quotations = db.session.query(func.count(Quotation.id)).join(
            Project, Project.quotation_id == Quotation.id
        ).filter(
            Quotation.is_deleted == False, 
            Project.is_deleted == False
        ).scalar() or 0
        active_projects = db.session.query(func.count(Project.id)).filter(
            Project.is_deleted == False, 
            Project.project_status != 'Completed'
        ).scalar() or 0
        completed_projects = db.session.query(func.count(Project.id)).filter(
            Project.is_deleted == False, 
            Project.project_status == 'Completed'
        ).scalar() or 0
        pending_appointments = db.session.query(func.count(Appointment.id)).filter(
            Appointment.is_deleted == False, 
            Appointment.status == 'pending'
        ).scalar() or 0
        completed_appointments = db.session.query(func.count(Appointment.id)).filter(
            Appointment.is_deleted == False, 
            Appointment.status == 'completed'
        ).scalar() or 0
        uploaded_files = db.session.query(func.count(File.id)).filter(File.is_deleted == False).scalar() or 0

        # Calculate average progress of active projects (where status != Completed and is_deleted == False)
        avg_progress = db.session.query(func.avg(Project.progress_percentage)).filter(
            Project.is_deleted == False,
            Project.project_status != 'Completed'
        ).scalar()
        avg_progress = round(float(avg_progress), 2) if avg_progress is not None else 0.0

        deleted_files = db.session.query(func.count(File.id)).filter(File.is_deleted == True).scalar() or 0

        # Compute total non-deleted projects
        total_projects = db.session.query(func.count(Project.id)).filter(Project.is_deleted == False).scalar() or 0

        # Query recent activities from AuditLog
        from app.models import AuditLog
        recent_logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(5).all()
        recent_activities = []
        for log in recent_logs:
            recent_activities.append({
                "id": log.id,
                "action": log.action,
                "details": log.details or "",
                "timestamp": log.timestamp.isoformat(),
                "user_name": log.user.name if log.user else "System"
            })

        return {
            "total_customers": total_customers,
            "total_leads": total_leads,
            "new_leads": new_leads,
            "qualified_leads": qualified_leads,
            "total_quotations": total_quotations,
            "approved_quotations": approved_quotations,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "total_projects": total_projects,
            "pending_appointments": pending_appointments,
            "completed_appointments": completed_appointments,
            "uploaded_files": uploaded_files,
            "deleted_files": deleted_files,
            "average_project_progress": avg_progress,
            "average_progress": avg_progress,
            "average_progress_percentage": avg_progress,
            "recent_activities": recent_activities
        }

    @classmethod
    def get_customer_metrics(cls, customer_id):
        """Aggregates metrics scoped to a specific customer profile.
        
        Ignores soft-deleted records.
        """
        # Verify customer profile exists and is active
        customer = Customer.query.filter_by(id=customer_id, is_deleted=False).first()
        if not customer:
            raise ValueError("Customer profile not found or inactive")

        total_leads = db.session.query(func.count(Lead.id)).filter(
            Lead.customer_id == customer_id, 
            Lead.is_deleted == False
        ).scalar() or 0
        total_quotations = db.session.query(func.count(Quotation.id)).filter(
            Quotation.customer_id == customer_id, 
            Quotation.is_deleted == False
        ).scalar() or 0
        approved_quotations = db.session.query(func.count(Quotation.id)).join(
            Project, Project.quotation_id == Quotation.id
        ).filter(
            Quotation.customer_id == customer_id,
            Quotation.is_deleted == False, 
            Project.is_deleted == False
        ).scalar() or 0
        active_projects = db.session.query(func.count(Project.id)).filter(
            Project.customer_id == customer_id,
            Project.is_deleted == False, 
            Project.project_status != 'Completed'
        ).scalar() or 0
        completed_projects = db.session.query(func.count(Project.id)).filter(
            Project.customer_id == customer_id,
            Project.is_deleted == False, 
            Project.project_status == 'Completed'
        ).scalar() or 0
        total_notifications = db.session.query(func.count(Notification.id)).filter(
            Notification.customer_id == customer_id, 
            Notification.is_deleted == False
        ).scalar() or 0
        unread_notifications = db.session.query(func.count(Notification.id)).filter(
            Notification.customer_id == customer_id, 
            Notification.is_read == False,
            Notification.is_deleted == False
        ).scalar() or 0
        uploaded_files = db.session.query(func.count(File.id)).filter(
            File.customer_id == customer_id, 
            File.is_deleted == False
        ).scalar() or 0

        active_files = uploaded_files

        # Compute total customer appointments
        total_appointments = db.session.query(func.count(Appointment.id)).filter(
            Appointment.customer_id == customer_id,
            Appointment.is_deleted == False
        ).scalar() or 0

        # Query latest active project details
        latest_project = Project.query.filter(
            Project.customer_id == customer_id,
            Project.is_deleted == False,
            Project.project_status != 'Completed'
        ).order_by(Project.created_at.desc()).first()

        active_project_data = None
        if latest_project:
            active_project_data = {
                "id": latest_project.id,
                "project_status": latest_project.project_status,
                "progress_percentage": int(latest_project.progress_percentage),
                "expected_completion": latest_project.expected_completion.isoformat() if latest_project.expected_completion else None
            }

        # Query latest unread/read notifications
        recent_notifs = Notification.query.filter_by(
            customer_id=customer_id,
            is_deleted=False
        ).order_by(Notification.created_at.desc()).limit(5).all()

        recent_notifications_data = []
        for n in recent_notifs:
            recent_notifications_data.append({
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "created_at": n.created_at.isoformat()
            })

        # Get active projects detailed list with progress percentage
        active_projects_list = Project.query.filter(
            Project.customer_id == customer_id,
            Project.is_deleted == False,
            Project.project_status != 'Completed'
        ).all()
        
        active_projects_detail = [
            {
                "project_id": p.id,
                "project_status": p.project_status,
                "progress_percentage": int(p.progress_percentage)
            } for p in active_projects_list
        ]

        return {
            "customer_id": customer_id,
            "total_leads": total_leads,
            "total_quotations": total_quotations,
            "approved_quotations": approved_quotations,
            "active_projects": active_projects,
            "active_projects_detail": active_projects_detail,
            "completed_projects": completed_projects,
            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
            "uploaded_files": uploaded_files,
            "active_files": active_files,
            
            # Frontend aligned keys
            "total_appointments": total_appointments,
            "total_files": uploaded_files,
            "active_project": active_project_data,
            "recent_notifications": recent_notifications_data
        }
