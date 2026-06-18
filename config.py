import os
from urllib.parse import quote_plus
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base Configuration parameters loaded from environment or secure defaults."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-crescent-chique-2026')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Database Configuration
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'crescent_chique_db')
    
    # Prioritize direct connection URL string, otherwise assemble from parts
    encoded_password = quote_plus(DB_PASSWORD)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    
    # Upload storage directory
    UPLOAD_FOLDER = os.environ.get(
        'UPLOAD_FOLDER',
        os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app', 'static', 'uploads')
    )
    
    # Flask-Mail configuration parameters
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'localhost')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 1025))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'False').lower() in ('true', '1', 't')
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() in ('true', '1', 't')
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', None)
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', None)
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'no-reply@crescentchique.com')
 
class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    # In-memory database isolation for automated unit tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(Config):
    DEBUG = False

    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        .replace("postgres://", "postgresql://")
        if os.environ.get("DATABASE_URL")
        else None
    )

    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_SAMESITE = "None"

    
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}
