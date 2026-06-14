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

        return {
            "total_customers": total_customers,
            "total_leads": total_leads,
            "new_leads": new_leads,
            "qualified_leads": qualified_leads,
            "total_quotations": total_quotations,
            "approved_quotations": approved_quotations,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "pending_appointments": pending_appointments,
            "completed_appointments": completed_appointments,
            "uploaded_files": uploaded_files
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

        return {
            "customer_id": customer_id,
            "total_leads": total_leads,
            "total_quotations": total_quotations,
            "approved_quotations": approved_quotations,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
            "uploaded_files": uploaded_files
        }
