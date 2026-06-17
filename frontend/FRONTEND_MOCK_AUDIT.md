# Crescent Chique Designs — Frontend Mock Audit Report

This audit identifies all files, functions, and components in the Next.js frontend that currently implement offline mock data fallbacks, hardcoded arrays, or simulated network responses.

---

## 1. Services Audit

### 1.1 Authentication Service (`src/services/auth.ts`)
- **Functions containing mock/fallback**:
  - `login()`: Falls back to matching lowercase username checks, caching `mock_token_<role>` in localStorage.
  - `register()`: Instantiates a mock user ID and returns a success wrapper.
  - `getProfile()`: Returns a static Beverly Hills profile if the profile API is rejected.
  - `updateProfile()`: Simulates updates by changing local state.
- **Real API Endpoints**:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/profile`
  - `PUT /api/v1/auth/profile`

### 1.2 Dashboard Service (`src/services/dashboard.ts`)
- **Functions containing mock/fallback**:
  - `getAdminDashboard()`: Returns static counts (leads, customers, projects) and standard log activities.
  - `getCustomerDashboard()`: Returns mock appointments counts, active project details (Living Room Turnkey Execution), and mock notifications.
  - `getCustomerTimeline()`: Returns 6 chronological mock milestone events (Inquiry Submitted, etc.).
  - `getAuditLogs()`: Returns 5 static log activities.
- **Real API Endpoints**:
  - `GET /api/v1/dashboard/admin`
  - `GET /api/v1/dashboard/customer`
  - `GET /api/v1/timeline`
  - `GET /api/v1/audit-logs`

### 1.3 Leads Service (`src/services/leads.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockLeads` array (3 items: Jaisveen, Sarah, Robert).
  - `getLeads()`: Filters and pages from local `mockLeads`.
  - `getLeadDetails()`: Resolves details from `mockLeads`.
  - `createLead()`: Appends new lead to `mockLeads`.
  - `updateLeadStatus()`: Mutates item in `mockLeads`.
  - `deleteLead()`: Filters out item from `mockLeads`.
  - `restoreLead()`: Simulates recovery state.
- **Real API Endpoints**:
  - `GET /api/v1/leads`
  - `GET /api/v1/leads/<id>`
  - `POST /api/v1/leads`
  - `PUT /api/v1/leads/<id>/status`
  - `DELETE /api/v1/leads/<id>`
  - `PUT /api/v1/leads/<id>/restore`

### 1.4 Projects Service (`src/services/projects.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockProjects` array (Living Room, Bedroom) and `mockNotes` dictionary.
  - `getProjects()`: Returns filtered `mockProjects` array.
  - `getProjectDetails()`: Returns matching item from `mockProjects`.
  - `updateProjectProgress()`: Adjusts progress value in `mockProjects`.
  - `getProjectNotes()`: Returns array from `mockNotes`.
  - `addProjectNote()`: Appends note to `mockNotes`.
- **Real API Endpoints**:
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/<id>`
  - `PUT /api/v1/projects/<id>/status` (or progress percentage)
  - `GET /api/v1/projects/<id>/notes`
  - `POST /api/v1/projects/<id>/notes`

### 1.5 Designs Service (`src/services/designs.ts`)
- **Functions containing mock/fallback**:
  - `getDesigns()`: Returns 5 mock collections (Japandi, Transitional, Kitchen, Office, Lobby).
  - `getDesignDetails()`: Returns matching item from list.
- **Real API Endpoints**:
  - `GET /api/v1/designs`
  - `GET /api/v1/designs/<id>`

### 1.6 Quotations Service (`src/services/quotations.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockQuotations` list (2 entries).
  - `generateEstimation()`: Returns client-side calculation breakdown.
  - `saveQuotation()`: Returns calculated totals and adds item to `mockQuotations`.
  - `getQuotations()`: Filters and returns list from `mockQuotations`.
  - `getQuotationDetails()`: Returns details from `mockQuotations`.
  - `deleteQuotation()` / `restoreQuotation()`: Returns mock messages.
  - `getQuotationPdfBlob()`: Returns mock PDF text string.
- **Real API Endpoints**:
  - `POST /api/v1/quotations/generate`
  - `POST /api/v1/quotations`
  - `GET /api/v1/quotations`
  - `GET /api/v1/quotations/<id>`
  - `DELETE /api/v1/quotations/<id>`
  - `PUT /api/v1/quotations/<id>/restore`
  - `GET /api/v1/quotations/<id>/pdf`

### 1.7 Files Service (`src/services/files.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockFiles` list (3 items).
  - `getFiles()`: Returns list from `mockFiles`.
  - `uploadFile()`: Formulates file and appends it to `mockFiles`.
  - `deleteFile()` / `restoreFile()`: Returns mock messages.
  - `downloadFileBlob()`: Returns text blob.
- **Real API Endpoints**:
  - `GET /api/v1/files`
  - `POST /api/v1/files/upload`
  - `GET /api/v1/files/<id>`
  - `GET /api/v1/files/<id>/download`
  - `DELETE /api/v1/files/<id>`
  - `PUT /api/v1/files/<id>/restore`

### 1.8 Notifications Service (`src/services/notifications.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockNotifications` list (3 items).
  - `getNotifications()`: Returns list from `mockNotifications`.
  - `getNotificationDetails()`: Returns item from `mockNotifications`.
  - `markNotificationRead()`: Marks item inside `mockNotifications`.
- **Real API Endpoints**:
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/<id>`
  - `PUT /api/v1/notifications/<id>/read`

### 1.9 Appointments Service (`src/services/appointments.ts`)
- **Functions containing mock/fallback**:
  - Holds `mockAppointments` list (3 items).
  - `getAppointments()`: Returns list from `mockAppointments`.
  - `createAppointment()`: Appends item to `mockAppointments`.
  - `updateAppointmentStatus()`: Updates status inside `mockAppointments`.
  - `cancelAppointment()`: Cancels status inside `mockAppointments`.
- **Real API Endpoints**:
  - `GET /api/v1/appointments`
  - `POST /api/v1/appointments`
  - `PUT /api/v1/appointments/<id>/status`
  - `DELETE /api/v1/appointments/<id>`

---

## 2. Pages Audit

### 2.1 Admin Customers View (`src/app/admin/customers/page.tsx`)
- **Issue**: Utilizes local `mockCustomersList` inside the React Query hook query function instead of a customer service query.
- **Real API Endpoint Expected**: `GET /api/v1/customers` (dedicated Customers blueprint route).

### 2.2 Admin Notifications Broadcast View (`src/app/admin/notifications/page.tsx`)
- **Issue**: Mutation function simulates network latency via setTimeout and returns a simulated success wrapper. Target selection list uses hardcoded demo IDs (`customer-id-456`, etc.).
- **Real API Endpoints Expected**:
  - Query select box: `GET /api/v1/customers` to fetch list of customer profiles dynamically.
  - Broadcast submit: `POST /api/v1/notifications` payload dispatch.
