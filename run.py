import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
from app import create_app

# Ensure environment variables are loaded
load_dotenv()

# Instantiate application context using FLASK_ENV setting
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    app.run(host=host, port=port)
