import os
# pyrefly: ignore [missing-import]
from flask import Flask
from app.extensions import db, migrate, login_manager, mail
from config import config_by_name

def create_app(config_name=None):
    """Application Factory to instantiate, configure and initialize Flask application."""
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'development')
        
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    mail.init_app(app)

    
    # Configure Flask-Login settings
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        # Local import to prevent circular dependency lookup issues
        from app.models import User
        return User.query.get(user_id)

    # Import and register Blueprints
    from app.blueprints.auth import auth_bp
    from app.blueprints.designs import designs_bp
    from app.blueprints.appointments import appointments_bp
    from app.blueprints.quotations import quotations_bp
    from app.blueprints.projects import projects_bp
    from app.blueprints.notifications import notifications_bp
    from app.blueprints.files import files_bp
    from app.blueprints.leads import leads_bp
    from app.blueprints.dashboard import dashboard_bp
    from app.blueprints.audit_logs import audit_logs_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(designs_bp, url_prefix='/api/v1/designs')
    app.register_blueprint(appointments_bp, url_prefix='/api/v1/appointments')
    app.register_blueprint(quotations_bp, url_prefix='/api/v1/quotations')
    app.register_blueprint(projects_bp, url_prefix='/api/v1/projects')
    app.register_blueprint(notifications_bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(files_bp, url_prefix='/api/v1/files')
    app.register_blueprint(leads_bp, url_prefix='/api/v1/leads')
    app.register_blueprint(dashboard_bp, url_prefix='/api/v1/dashboard')
    app.register_blueprint(audit_logs_bp, url_prefix='/api/v1/audit-logs')

    @app.route("/")
    def home():
        return {
            "status": "running",
            "application": "Crescent Chique Designs",
            "database": "connected"
        }
    
    return app
