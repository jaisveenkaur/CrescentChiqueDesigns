# pyrefly: ignore [missing-import]
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# pyrefly: ignore [missing-import]
from flask_login import LoginManager
# pyrefly: ignore [missing-import]
from flask_mail import Mail

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
# pyrefly: ignore [missing-import]
mail = Mail()

