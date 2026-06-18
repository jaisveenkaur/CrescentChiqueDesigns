# Crescent Chique Designs — Deployment Guide

This document provides step-by-step instructions to deploy, configure, migrate, and seed the Crescent Chique Designs application (Next.js frontend, Flask backend, and MySQL database). It is designed to help a new developer set up the project from scratch.

---

## 1. Environment Configurations

### A. Backend Environment Variables (`.env`)
Create a `.env` file in the root directory of the project:

```ini
# Flask Core Settings
FLASK_ENV=development           # Set to 'production' for live setups
FLASK_APP=run.py
SECRET_KEY=your-secure-random-secret-key-here

# Database Configuration (MySQL Connection)
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crescent_chique_db

# CORS Config (Comma-separated list of allowed domains in production)
ALLOWED_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://crescentchique.vercel.app

# Persistent File Upload storage directory
UPLOAD_FOLDER=/mnt/persistent_uploads

# Alternative: Direct Connection URL (If set, overrides individual DB parameters)
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/crescent_chique_db

# Email Notification Server (Flask-Mail)
MAIL_SERVER=localhost
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_USE_TLS=False
MAIL_DEFAULT_SENDER=no-reply@crescentchique.com
```

### B. Frontend Environment Variables (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend/` directory:

```ini
# API Connection URL (Points to the backend Flask API)
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001/api/v1
```

---

## 2. Backend Deployment Steps

### Step 1: Initialize Virtual Environment
From the project root directory, set up a Python virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install System Dependencies
Install required packages using `pip`:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Run the Development Server
Start the backend server on the default port (`5001`):
```bash
python run.py
```
To run in production mode, set `FLASK_ENV=production` and use a production-grade WSGI server like `gunicorn`:
```bash
FLASK_ENV=production gunicorn -w 4 -b 127.0.0.1:5001 run:app
```

---

## 3. Database Setup & Migration Steps

### Step 1: Ensure MySQL Database Exists
Ensure your local or remote MySQL service is running, and log in to create the database:
```sql
CREATE DATABASE crescent_chique_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Initialize Database Migrations
If setting up migrations for the first time, run the following:
```bash
flask db init
```

### Step 3: Generate and Apply Schema Migrations
To inspect model configurations and apply schema changes:
```bash
# Create migration script
flask db migrate -m "Initialize database schema"

# Apply changes to MySQL database
flask db upgrade
```

### Step 4: Automating Database Backups
To run a manual database backup (which exports a compressed `.sql.gz` file into a `backups/` directory):
```bash
chmod +x scripts/backup_db.sh
./scripts/backup_db.sh
```
To automate periodic backups in production, register the script inside the crontab:
```bash
0 2 * * * /path/to/project/scripts/backup_db.sh >> /var/log/db_backup.log 2>&1
```

---

## 4. Demo Data Seeding Steps

To populate the database with realistic business records for testing (25 customers, 40 leads, 20 projects, 30 quotations, 50 notifications, 25 appointments, and 100 audit logs), execute the seeding script:

```bash
python scripts/seed_realistic_data.py
```

*Note: This script purges existing database records to maintain logical relationships. The default seed user accounts are:*
* **Admin**: `admin@crescentchique.com` / `CCAdmin2026!`
* **Customer**: `john.doe@gmail.com` / `JohnDoe2026!`

---

## 5. Frontend Deployment Steps

### Step 1: Navigate and Install Node Modules
Go to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
```

### Step 2: Build the Application
Create an optimized static/dynamic production build:
```bash
npm run build
```

### Step 3: Run the Frontend Server
* **For Development (Hot Reloading)**:
  ```bash
  npm run dev
  ```
  *(Default server runs at `http://localhost:3000`)*
* **For Production hosting**:
  ```bash
  npm run start
  ```

---

## 6. Rollback Procedures

### A. Database Rollback
If a schema upgrade fails or introduces bugs, revert the changes using Flask-Migrate:
```bash
# Revert the database state back by exactly 1 migration step
flask db downgrade

# Revert to a specific migration revision ID
flask db downgrade <revision_id>
```

### B. Code/Deployment Rollback
If a code release causes issues:
1. Revert to the last stable git commit:
   ```bash
   git revert HEAD
   # Or checkout previous tag/commit
   git checkout tags/v1.0.0
   ```
2. Re-run dependency installations:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install
   ```
3. Re-build the client portal and restart the server instances:
   ```bash
   cd frontend && npm run build
   ```

---

## 7. Troubleshooting Guide

### A. Flask-SQLAlchemy Database Connection Fails
* **Error**: `pymysql.err.OperationalError: (2003, "Can't connect to MySQL server...")`
* **Resolution**: Verify that the MySQL service is active. Double-check your `.env` username and password. If using a custom socket, ensure `DB_HOST` is set to `127.0.0.1` rather than `localhost` to force TCP connections.

### B. CORS Issues
* **Error**: `Access to fetch at ... has been blocked by CORS policy`
* **Resolution**: Ensure the CORS origins configuration in `app/__init__.py` (line 23) matches the exact hostname/port of the Next.js client.

### C. PDF Sizing or Font Faults
* **Error**: `reportlab.platypus.doctemplate.LayoutError: Flowable ... too large`
* **Resolution**: Ensure layout pages and spacers in `app/services/pdf_service.py` do not exceed the printable boundaries of a standard US Letter format (8.5" x 11").

### D. Next.js Client Hydration Warnings
* **Error**: `Text content did not match. Server: ... Client: ...`
* **Resolution**: Verify that dates/times are rendered using the `<SafeDate />` component to enforce matching client timezone rendering on load.
