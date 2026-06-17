# Crescent Chique Designs — Backend API Audit Report

This audit maps the current backend Flask endpoints to the requirements of the Next.js frontend pages and defines the missing APIs needed for production-ready integration.

---

## 1. Summary of Existing Endpoints

| Blueprint | HTTP Method | Endpoint | Description | Frontend Page Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/v1/auth/register` | Customer Profile Signup | `/login` (Create Profile tab) |
| | `POST` | `/api/v1/auth/login` | Session Authentication | `/login` (Sign In form) |
| | `POST` | `/api/v1/auth/logout` | Session Termination | Sidebar Navigation logout hooks |
| | `GET` | `/api/v1/auth/profile` | Retrieve User Profile | `/customer/profile` |
| | `PUT` | `/api/v1/auth/profile` | Update Profile Details | `/customer/profile` |
| **Dashboard** | `GET` | `/api/v1/dashboard/admin` | Aggregate Admin Metrics | `/admin/dashboard` |
| | `GET` | `/api/v1/dashboard/customer`| Customer Portal Summary | `/customer/dashboard` |
| **Leads** | `POST` | `/api/v1/leads` | Create Lead Inquiry | `/customer/leads` |
| | `GET` | `/api/v1/leads` | List / Search Leads (Paginated)| `/admin/leads`, `/customer/leads` |
| | `GET` | `/api/v1/leads/<id>` | Lead Detail Specifications | Detail CRM views |
| | `PUT` | `/api/v1/leads/<id>/status` | Modify Status (Admin only) | `/admin/leads` (Status updates) |
| | `DELETE` | `/api/v1/leads/<id>` | Soft Delete Lead | `/admin/leads` |
| | `PUT` | `/api/v1/leads/<id>/restore`| Restore Lead | `/admin/leads` |
| **Projects** | `GET` | `/api/v1/projects` | List active projects | `/admin/projects`, `/customer/dashboard` |
| | `GET` | `/api/v1/projects/<id>` | Detailed project specs | `/admin/projects`, `/customer/dashboard` |
| | `PUT` | `/api/v1/projects/<id>/status`| Update status/progress | `/admin/projects` |
| | `PUT` | `/api/v1/projects/<id>/progress`| Update only progress % | `/admin/projects` (milestone progress slider) |
| | `DELETE` | `/api/v1/projects/<id>` | Soft delete project | Admin Project Board |
| | `PUT` | `/api/v1/projects/<id>/restore`| Restore deleted project | Admin Project Board |
| **Project Notes**| `POST` | `/api/v1/projects/<id>/notes`| Add note to project | `/admin/projects` (Architect log inputs) |
| | `GET` | `/api/v1/projects/<id>/notes`| List notes of project | `/admin/projects` |
| **Quotations** | `POST` | `/api/v1/quotations/generate`| Calculate costs on-the-fly | Portfolio estimate drawer |
| | `POST` | `/api/v1/quotations` | Save quotation record | Portfolio save buttons |
| | `GET` | `/api/v1/quotations` | List / Search quotations | `/customer/quotations`, `/customer/dashboard` |
| | `GET` | `/api/v1/quotations/<id>` | Detailed quotation metrics | Invoice modal overlays |
| | `DELETE` | `/api/v1/quotations/<id>` | Soft delete quotation | Admin / Customer sheets |
| | `PUT` | `/api/v1/quotations/<id>/restore`| Restore quotation | Admin / Customer sheets |
| | `GET` | `/api/v1/quotations/<id>/pdf` | Stream ReportLab PDF binary | Quotations list, Invoice modal print/save |
| **Files** | `POST` | `/api/v1/files/upload` | Upload document file | `/customer/files` (file drop zone) |
| | `GET` | `/api/v1/files` | Search / List file metadata | `/admin/files`, `/customer/files` |
| | `GET` | `/api/v1/files/<id>` | File record detail metadata | Detail views |
| | `GET` | `/api/v1/files/<id>/download`| Stream file for browser | `/admin/files`, `/customer/files` |
| | `DELETE` | `/api/v1/files/<id>` | Soft delete file record | `/admin/files`, `/customer/files` |
| | `PUT` | `/api/v1/files/<id>/restore`| Restore deleted file | `/admin/files` |
| **Notifications**| `GET` | `/api/v1/notifications` | List customer alerts | `/customer/notifications`, `/customer/dashboard` |
| | `GET` | `/api/v1/notifications/<id>`| Get notification details | Detail modals |
| | `PUT` | `/api/v1/notifications/<id>/read`| Mark alert as read | `/customer/notifications` |
| **Timeline** | `GET` | `/api/v1/timeline` | Customer activity events | `/customer/timeline` |
| **Audit Logs** | `GET` | `/api/v1/audit-logs` | Admin activity stream | `/admin/audit-logs` |

---

## 2. Identified Missing Endpoints

The following endpoints are required by the frontend layout designs but are currently absent from the backend:

1. **`GET /api/v1/auth/me`**:
   - *Purpose*: Directly returns the current authenticated user context and role check on session refresh, supporting the React `AuthProvider`.
   - *Dependency*: Required by `useAuth` contexts and layout route guards.
   
2. **`GET /api/v1/customers`**:
   - *Purpose*: Lists all registered client profiles (names, contact details, city, etc.) for admin views.
   - *Dependency*: Required by `/admin/customers` page. (Currently, the backend has no route to query lists of customers, and the frontend page relies on `mockCustomersList`.)
   
3. **`POST /api/v1/notifications`**:
   - *Purpose*: Allows admins to dispatch/broadcast global notifications and custom message alerts to specific customer profiles.
   - *Dependency*: Required by `/admin/notifications` broadcast console page.

---

## 3. Recommended Additions & Modifications

- **Register Flask-CORS**: Replace manual CORS header configurations with the official `Flask-CORS` library. Configure `supports_credentials=True` and allow requests from `http://localhost:3000` to support cookie-based sessions across localhost ports.
- **Dedicated Customers Blueprint**: Set up a new blueprint registered under `/api/v1/customers` rather than putting customer-listing utilities inside `/auth`.
