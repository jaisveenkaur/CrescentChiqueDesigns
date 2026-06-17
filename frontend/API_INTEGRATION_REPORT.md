# Crescent Chique Designs — API Integration Report

This report summarizes the status of the frontend API integration audit, mapping the live endpoints, verifying connection status, and detailing the complete removal of offline mock fallbacks.

---

## 1. Connected Endpoints

All frontend services have been refactored to use the central Axios instance pointing to `NEXT_PUBLIC_API_URL` (port `5001` in local development). The following endpoints are actively connected to Next.js pages:

| Module | HTTP Method | Endpoint | Consumed By |
| :--- | :--- | :--- | :--- |
| **Authentication** | `GET` | `/auth/me` | `useAuth()` Global Session Provider & Layout Route Guards |
| | `POST` | `/auth/login` | Sign In form (`/login`) |
| | `POST` | `/auth/register` | Register Profile tab (`/login`) |
| | `POST` | `/auth/logout` | Logout button across Sidebar Navigation |
| | `GET` / `PUT` | `/auth/profile` | View & update profile form (`/customer/profile`) |
| **Dashboard** | `GET` | `/dashboard/admin` | Admin dashboard statistics (`/admin/dashboard`) |
| | `GET` | `/dashboard/customer` | Customer dashboard summaries (`/customer/dashboard`) |
| **Leads** | `GET` / `POST` | `/leads` | Leads table list (`/admin/leads`) & Create Inquiry (`/customer/leads`) |
| | `GET` / `DELETE` | `/leads/<id>` | Detail sheets & lead soft-deletion |
| | `PUT` | `/leads/<id>/status` | Update status selection (`/admin/leads`) |
| | `PUT` | `/leads/<id>/restore` | Restore lead item (`/admin/leads`) |
| **Projects** | `GET` | `/projects` | Active projects listings (`/admin/projects`) |
| | `GET` | `/projects/<id>` | Project board visual checklist (`/customer/dashboard`) |
| | `PUT` | `/projects/<id>/progress` | Milestone progress slider (`/admin/projects`) |
| | `GET` / `POST` | `/projects/<id>/notes` | Architect log input history (`/admin/projects`) |
| **Designs** | `GET` | `/designs` | Portfolio catalog (`/gallery`) & estimator |
| | `GET` | `/designs/<id>` | Design detail spec drawer (`/gallery/[id]`) |
| **Quotations** | `GET` / `POST` | `/quotations` | Quotations history list (`/customer/quotations`) & Create Quote |
| | `POST` | `/quotations/generate` | Budget estimator calculations panel |
| | `GET` | `/quotations/<id>` | Quotation summary modal details |
| | `DELETE` / `PUT` | `/quotations/<id>` | Soft-delete & restore quotation |
| | `GET` | `/quotations/<id>/pdf` | ReportLab PDF stream download & print invoice modal |
| **Files** | `GET` / `POST` | `/files` | File list grid (`/customer/files`) & File dropzone upload |
| | `GET` / `DELETE` | `/files/<id>` | File stream download & metadata soft-delete |
| | `PUT` | `/files/<id>/restore` | Restore deleted document (`/admin/files`) |
| **Notifications**| `GET` / `PUT` | `/notifications` | Unread notifications drawer (`/customer/notifications`) & read marker |
| | `POST` | `/notifications` | Dispatch Console global alert broadcast (`/admin/notifications`) |
| **Timeline** | `GET` | `/timeline` | Visual milestone stream (`/customer/timeline`) |
| **Audit Logs** | `GET` | `/audit-logs` | Admin activity logger (`/admin/audit-logs`) |
| **Appointments** | `GET` / `POST` | `/appointments` | Consultation bookings list (`/customer/appointments`) & slot request |
| | `PUT` / `DELETE` | `/appointments/<id>` | Confirm slot, mark completed, or cancel consultation |

---

## 2. Failed Endpoints

* **None**. All requested and mapped endpoints are communicating successfully. If the local development Flask server is offline, the pages display an editorial connection error card with a retry button.

---

## 3. Missing Backend Routes

* **None**. The three missing endpoints identified in the audit (`GET /auth/me`, `GET /customers`, and `POST /notifications`) have been successfully implemented on the Flask server and verified to operate.

---

## 4. Remaining Mock Implementations

* **Zero**. All offline fallback data lists, static memory storage variables (`mockLeads`, `mockQuotations`, `mockFiles`, `mockAppointments`, etc.), and local success wrappers have been deleted from `src/services/` and client components.
* All error blocks propagate the original HTTP failure context and write console logs using the standard format:
  `console.error("METHOD /endpoint failed", error.response?.status, error.response?.data)`
