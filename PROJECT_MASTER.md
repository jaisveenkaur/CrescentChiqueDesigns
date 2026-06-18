# Crescent Chique Designs - Project Master Sheet

## Project Overview

**Project Name:** Crescent Chique Designs
**Type:** Interior Design Management Platform
**Frontend:** Next.js + Vercel
**Backend:** Flask + Render
**Database:** PostgreSQL (Neon)
**Repository:** GitHub

---

# Production URLs

## Frontend (Live Website)

```text
https://crescent-chique-designs.vercel.app
```

## Backend API

```text
https://crescent-chique-backend.onrender.com
```

## Backend Health Check

```text
https://crescent-chique-backend.onrender.com
```

Expected Response:

```json
{
  "application": "Crescent Chique Designs",
  "database": "connected",
  "status": "running"
}
```

## Sample API Endpoint

```text
https://crescent-chique-backend.onrender.com/api/v1/designs
```

---

# Source Code

## GitHub Repository

```text
https://github.com/jaisveenkaur/CrescentChiqueDesigns
```

**Branch:** `main`

---

# Hosting Platforms

## Frontend Hosting

**Provider:** Vercel

Dashboard:

```text
https://vercel.com/dashboard
```

Project Name:

```text
crescent-chique-designs
```

---

## Backend Hosting

**Provider:** Render

Dashboard:

```text
https://dashboard.render.com
```

Service Name:

```text
crescent_chique_backend
```

---

## Database Hosting

**Provider:** Neon PostgreSQL

Dashboard:

```text
https://console.neon.tech
```

Project:

```text
crescent_chique_designs
```

Database:

```text
neondb
```

Branch:

```text
production
```

---


# Render Configuration

## Build Command

```bash
pip install -r requirements.txt
```

## Start Command

```bash
gunicorn run:app
```

## Runtime

```text
Python 3
```

---

# Vercel Configuration

## Framework

```text
Next.js
```

## Root Directory

```text
frontend
```


# Database Information

## Database

```text
neondb
```

## Current Tables

```text
users
customers
designs
design_images
appointments
quotations
projects
leads
notifications
audit_logs
project_notes
files
alembic_version
```

## Current Status

```text
13 Tables Created Successfully
```

---

# Customer Portal Routes

## Dashboard

```text
/customer/dashboard
```

## Leads

```text
/ customer/leads
```

## Appointments

```text
/ customer/appointments
```

## Quotations

```text
/ customer/quotations
```

## Timeline

```text
/ customer/timeline
```

## Upload Center

```text
/ customer/files
```

## Notifications

```text
/ customer/notifications
```

## Profile

```text
/ customer/profile
```

---

# Admin Routes

```text
/admin/dashboard
/admin/customers
/admin/leads
/admin/quotations
/admin/projects
/admin/designs
/admin/notifications
```

---


# Recovery Checklist

## Backend Health

```text
https://crescent-chique-backend.onrender.com
```

## Render Logs

```text
Render Dashboard → Logs
```

## Database Checks

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM appointments;
SELECT COUNT(*) FROM leads;
```

## Redeploy Frontend

```bash
git add .
git commit -m "frontend update"
git push origin main
```

(Vercel auto-deploys)

## Redeploy Backend

```bash
git add .
git commit -m "backend update"
git push origin main
```

(Render auto-deploys)

---

# Useful Commands

## Run Backend Locally

```bash
python run.py
```

## Flask Migration

```bash
flask db migrate -m "message"
```

## Apply Migration

```bash
flask db upgrade
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Frontend Production Build

```bash
npm run build
```

---

# Deployment Status

* GitHub Connected
* Flask Backend Running
* PostgreSQL Connected
* Neon Database Active
* Render Deployment Successful
* Vercel Deployment Successful
* API Endpoints Working
* Authentication Working
* Customer Portal Working
* Database Migrations Applied
* Production Environment Live

---


