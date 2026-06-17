# Crescent Chique Designs — API Integration Report

This report documents the state of the backend REST API endpoints and maps them to their respective frontend page integrations. All missing backend routes have been fully implemented and verified on the Flask server.

---

## 1. Newly Implemented & Refactored Backend Routes

To align with the architecture audit and support frontend portal functions, the following backend enhancements have been completed:

1. **Flask-CORS Session Integration**:
   - Replaced manual origin headers with standard `flask-cors`.
   - Enabled `supports_credentials=True` for origin headers `http://localhost:3000` and `http://127.0.0.1:3000` to support cookie-based sessions between the client and server.

2. **Session Verification Context (`GET /api/v1/auth/me`)**:
   - **File**: [auth.py](file:///Users/jaisveenkaur/Desktop/Projects/Crescent%20Chique%20Designs/app/blueprints/auth.py)
   - **Route**: `GET /api/v1/auth/me`
   - **Response**: Returns current authenticated user session details and profiles (Customer/Admin). Enables the React Query session checking.

3. **Dedicated Customers Query Service (`GET /api/v1/customers`)**:
   - **File**: [customers.py](file:///Users/jaisveenkaur/Desktop/Projects/Crescent%20Chique%20Designs/app/blueprints/customers.py)
   - **Route**: `GET /api/v1/customers`
   - **Details**: Fetches all non-deleted client profiles. Dynamically resolves client tiers (`Economy` \| `Premium` \| `Luxury`) based on their highest saved quotation package grade. Admin-only.

4. **Alerts Broadcast API (`POST /api/v1/notifications`)**:
   - **File**: [notifications.py](file:///Users/jaisveenkaur/Desktop/Projects/Crescent%20Chique%20Designs/app/blueprints/notifications.py)
   - **Route**: `POST /api/v1/notifications`
   - **Details**: Admin-only endpoint to persist custom alert messages linked to a target customer ID.

---

## 2. API Endpoint Mapping Table

The table below maps the final, verified Flask endpoints to the Next.js pages that consume them:

| Next.js Frontend Page | Backend Endpoint(s) | HTTP Method | Status |
| :--- | :--- | :--- | :--- |
| **All Portal Pages** | `/api/v1/auth/me` | `GET` | **Connected & Verified** |
| `/login` (Auth Portal) | `/api/v1/auth/login` | `POST` | **Connected & Verified** |
| | `/api/v1/auth/register` | `POST` | **Connected & Verified** |
| | `/api/v1/auth/logout` | `POST` | **Connected & Verified** |
| `/customer/profile` | `/api/v1/auth/profile` | `GET` / `PUT` | **Connected & Verified** |
| `/customer/dashboard` | `/api/v1/dashboard/customer` | `GET` | **Connected & Verified** |
| | `/api/v1/appointments` | `GET` | **Connected & Verified** |
| | `/api/v1/notifications` | `GET` | **Connected & Verified** |
| | `/api/v1/projects/<id>` | `GET` | **Connected & Verified** |
| `/customer/timeline` | `/api/v1/timeline` | `GET` | **Connected & Verified** |
| `/customer/leads` | `/api/v1/leads` | `GET` / `POST` | **Connected & Verified** |
| `/customer/appointments` | `/api/v1/appointments` | `GET` / `POST` | **Connected & Verified** |
| | `/api/v1/appointments/<id>` | `DELETE` (Cancel) | **Connected & Verified** |
| `/customer/quotations` | `/api/v1/quotations` | `GET` | **Connected & Verified** |
| | `/api/v1/quotations/<id>` | `GET` | **Connected & Verified** |
| | `/api/v1/quotations/<id>/pdf` | `GET` (binary PDF) | **Connected & Verified** |
| `/customer/files` | `/api/v1/files/upload` | `POST` | **Connected & Verified** |
| | `/api/v1/files` | `GET` | **Connected & Verified** |
| | `/api/v1/files/<id>/download`| `GET` (download) | **Connected & Verified** |
| | `/api/v1/files/<id>` | `DELETE` (soft-delete)| **Connected & Verified** |
| `/admin/dashboard` | `/api/v1/dashboard/admin` | `GET` | **Connected & Verified** |
| | `/api/v1/audit-logs` | `GET` | **Connected & Verified** |
| `/admin/customers` | `/api/v1/customers` | `GET` | **Connected & Verified** |
| `/admin/leads` | `/api/v1/leads` | `GET` | **Connected & Verified** |
| | `/api/v1/leads/<id>/status` | `PUT` | **Connected & Verified** |
| | `/api/v1/leads/<id>` | `DELETE` / `PUT` (restore) | **Connected & Verified** |
| `/admin/projects` | `/api/v1/projects` | `GET` | **Connected & Verified** |
| | `/api/v1/projects/<id>/status` | `PUT` | **Connected & Verified** |
| | `/api/v1/projects/<id>/progress` | `PUT` | **Connected & Verified** |
| | `/api/v1/projects/<id>/notes` | `GET` / `POST` | **Connected & Verified** |
| `/admin/files` | `/api/v1/files` | `GET` (includes soft-deleted) | **Connected & Verified** |
| | `/api/v1/files/<id>/restore` | `PUT` | **Connected & Verified** |
| `/admin/notifications` | `/api/v1/notifications` | `POST` | **Connected & Verified** |
| `/admin/audit-logs` | `/api/v1/audit-logs` | `GET` | **Connected & Verified** |
