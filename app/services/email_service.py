import sys
from datetime import datetime
from flask import render_template, current_app, request
# pyrefly: ignore [missing-import]
from flask_mail import Message
# pyrefly: ignore [missing-import]
from flask_login import current_user
from app.extensions import mail
from app.services.audit_service import AuditService

class EmailService:
    """Provides service layer business logic to compile HTML template notifications and send them fail-safely."""

    @classmethod
    def _get_active_user_id(cls, fallback_id=None):
        """Tries to get the current authenticated user's ID, falling back to recipient's user_id."""
        try:
            if current_user and current_user.is_authenticated:
                return current_user.id
        except Exception:
            pass
        return fallback_id

    @classmethod
    def _send_mail_failsafe(cls, user_id, subject, recipient, template_name, context):
        """Renders the HTML email body and dispatches the email.
        Logs 'Email Sent' or 'Email Failed' to system Audit Logs fail-safely.
        """
        try:
            # Renders HTML template using Flask context
            html_body = render_template(template_name, **context)
            
            sender = current_app.config.get('MAIL_DEFAULT_SENDER', 'no-reply@crescentchique.com')
            msg = Message(
                subject=subject,
                recipients=[recipient],
                html=html_body,
                sender=sender
            )
            
            # Send email via Flask-Mail
            mail.send(msg)
            
            # Log success
            AuditService.log(
                user_id=user_id,
                action="Email Sent",
                details=f"Email '{subject}' successfully sent to {recipient}"
            )
            return True
            
        except Exception as e:
            # Log failure fail-safely to standard error console
            print(f"[EMAIL FAIL-SAFE ERROR]: Failed to send email '{subject}' to {recipient}: {str(e)}", file=sys.stderr)
            
            # Log failure to database AuditLogs
            AuditService.log(
                user_id=user_id,
                action="Email Failed",
                details=f"Email '{subject}' to {recipient} failed: {str(e)}"
            )
            return False

    @classmethod
    def send_appointment_confirmation(cls, appointment):
        """Sends confirmation email on consultation appointment slot booking."""
        if not appointment or not appointment.customer or not appointment.customer.user:
            return False
            
        recipient_user = appointment.customer.user
        recipient = recipient_user.email
        subject = "Appointment Confirmation - Crescent Chique Designs"
        
        context = {
            "name": recipient_user.name,
            "appointment_date": f"{appointment.appointment_date.isoformat()} {appointment.appointment_time.isoformat()}",
            "status": appointment.status
        }
        
        user_id = cls._get_active_user_id(recipient_user.id)
        return cls._send_mail_failsafe(user_id, subject, recipient, "emails/appointment_confirmation.html", context)

    @classmethod
    def send_lead_status_update(cls, lead):
        """Sends update email on lead status changes."""
        if not lead or not lead.email:
            return False
            
        recipient = lead.email
        subject = "Inquiry Update - Crescent Chique Designs"
        
        context = {
            "status": lead.status,
            "requirements": lead.requirements
        }
        
        # Determine user ID for audit log context
        fallback_id = None
        if lead.customer and lead.customer.user_id:
            fallback_id = lead.customer.user_id
            
        user_id = cls._get_active_user_id(fallback_id)
        # Note: If no user is logged in and no customer user is linked, we log under the fallback or skip.
        # But in leads, update_lead_status is admin-only, so current_user.id is always available.
        if not user_id:
            # Fallback to a system admin or skip if null user_id (since user_id is nullable=False in DB,
            # we must verify we have a valid user UUID). Let's fetch the first admin user if no user_id exists.
            from app.models import User
            admin_user = User.query.filter_by(role='admin').first()
            if admin_user:
                user_id = admin_user.id
                
        return cls._send_mail_failsafe(user_id, subject, recipient, "emails/lead_status_update.html", context)

    @classmethod
    def send_project_status_update(cls, project):
        """Sends update email when a renovation project tracking phase shifts."""
        if not project or not project.customer or not project.customer.user:
            return False
            
        recipient_user = project.customer.user
        recipient = recipient_user.email
        subject = "Project Phase Progress Update - Crescent Chique Designs"
        
        context = {
            "status": project.project_status,
            "expected_completion": project.expected_completion.isoformat() if project.expected_completion else "TBD",
            "progress_percentage": float(project.progress_percentage) if project.progress_percentage is not None else None
        }
        
        user_id = cls._get_active_user_id(recipient_user.id)
        return cls._send_mail_failsafe(user_id, subject, recipient, "emails/project_status_update.html", context)

    @classmethod
    def send_quotation_generated(cls, quotation, is_pdf=False):
        """Sends cost quotation invoice email (covers both Quotation Created and PDF Generated triggers)."""
        if not quotation or not quotation.customer or not quotation.customer.user:
            return False
            
        recipient_user = quotation.customer.user
        recipient = recipient_user.email
        
        if is_pdf:
            subject = "Quotation PDF Downloaded - Crescent Chique Designs"
        else:
            subject = "New Cost Quotation Generated - Crescent Chique Designs"
            
        # Build download link using request host dynamically if inside a request context
        try:
            download_link = f"{request.host_url.rstrip('/')}/api/v1/quotations/{quotation.id}/pdf"
        except Exception:
            download_link = f"/api/v1/quotations/{quotation.id}/pdf"
            
        context = {
            "name": recipient_user.name,
            "amount": f"{float(quotation.total_amount):,.2f}",
            "material_grade": quotation.material_grade,
            "area_sqft": float(quotation.area_sqft),
            "download_link": download_link
        }
        
        user_id = cls._get_active_user_id(recipient_user.id)
        return cls._send_mail_failsafe(user_id, subject, recipient, "emails/quotation_generated.html", context)

    @classmethod
    def send_file_upload_confirmation(cls, file_record):
        """Sends uploaded document registration confirmation email."""
        if not file_record or not file_record.customer or not file_record.customer.user:
            return False
            
        recipient_user = file_record.customer.user
        recipient = recipient_user.email
        subject = "Document Upload Success - Crescent Chique Designs"
        
        context = {
            "name": recipient_user.name,
            "filename": file_record.filename,
            "timestamp": file_record.uploaded_at.strftime('%Y-%m-%d %H:%M:%S UTC')
        }
        
        user_id = cls._get_active_user_id(recipient_user.id)
        return cls._send_mail_failsafe(user_id, subject, recipient, "emails/file_uploaded.html", context)
