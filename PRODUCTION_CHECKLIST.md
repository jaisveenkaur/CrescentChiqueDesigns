# Production Deployment Checklist

This document tracks items that must be completed and verified before promoting the Crescent Chique Designs application to production servers.

---

## 1. Secrets & Environment Configuration

- [ ] **Secret Key Protection**: Generate a strong random key for the Flask backend `SECRET_KEY` in the production environment. Do not use the development default.
- [ ] **Database Connection Security**: Set up `DATABASE_URL` pointing to the secure production database instance with restricted access privileges.
- [ ] **Secrets Sweep**: Verify that no production passwords, SMTP keys, database credentials, or private API keys are committed to Git history.
- [ ] **Cross-Origin Configuration**: Define allowed origins in `ALLOWED_CORS_ORIGINS` to contain only the production frontend Vercel URL and staging hostnames.
- [ ] **Next.js API Base URL**: Verify that the production Next.js environment contains the correct `NEXT_PUBLIC_API_URL` pointing to the production Flask server.

---

## 2. Server Infrastructure Hardening

- [ ] **SSL/TLS Enforcement**: Enable HTTPS across both Next.js and Flask endpoints. Configured web servers (e.g. Nginx or load balancers) should automatically redirect HTTP traffic to HTTPS.
- [ ] **WSGI Server Configuration**: Use a production-ready WSGI server like `gunicorn` (Unix) or `waitress` (Windows) to run Flask. Example command:
  ```bash
  FLASK_ENV=production gunicorn -w 4 -b 127.0.0.1:5001 run:app
  ```
- [ ] **Secure Cookie Delivery**: In production, Flask session cookies must require SSL/TLS:
  - `SESSION_COOKIE_SECURE=True` (Enforced automatically under `ProductionConfig`)
  - `SESSION_COOKIE_SAMESITE='None'` (Required if frontend and backend run on different domains)
  - `REMEMBER_COOKIE_SECURE=True`
  - `REMEMBER_COOKIE_SAMESITE='None'`

---

## 3. Persistent File Storage

- [ ] **Persistent Volume Mount**: Configure `UPLOAD_FOLDER` in `.env` to point to a persistent network directory or local volume (e.g., `/mnt/crescent_uploads`).
- [ ] **Write Permissions**: Verify that the WSGI worker process user has appropriate write permissions to create directories and save upload files inside the target directory.
- [ ] **Maximum Upload Restrictions**: Confirm that the client payload body sizes are restricted to `10MB` in reverse proxy servers (like Nginx's `client_max_body_size 10m;`) to match application-level validations.

---

## 4. Database Lifecycle & Maintenance

- [ ] **Migration Status**: Verify that the database schema is up-to-date by executing:
  ```bash
  flask db upgrade
  ```
- [ ] **Automated Backups**: Set up a periodic cron job to execute the database backup script:
  ```bash
  # Example: Run database backup every day at 2:00 AM
  0 2 * * * /path/to/project/scripts/backup_db.sh >> /var/log/db_backup.log 2>&1
  ```
- [ ] **Test Restore Routine**: Regularly verify that database backups (`backups/*.sql.gz`) can be successfully restored to a test instance.

---

## 5. Client Bundle Optimizations

- [ ] **Next.js Production Build**: Run `npm run build` inside the `frontend/` directory to construct optimized, compiled HTML pages and JavaScript chunks.
- [ ] **Compression**: Verify that dynamic components and assets are served with gzip or Brotli compression enabled in the proxy layer or hosting platform (Vercel).
