# Crescent Chique Designs: End-to-End Testing & QA Checklist

This checklist acts as the master validation framework for the Crescent Chique Designs SaaS backend. It guides QA engineers and developers through manual verification, automated Postman test configurations, security constraint checks, and database verification queries.

---

## 1. Customer Journey Testing

This flow tests the complete customer lifecycle from authentication through workspace activity.

### Step 1: Customer Login
* **Endpoint**: `POST /api/v1/auth/login`
* **Method**: `POST`
* **Request Example**:
  ```json
  {
    "email": "john.doe@gmail.com",
    "password": "JohnDoe2026!"
  }
  ```
* **Expected Status**: `200 OK`
* **Expected Response**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "3a31b18e-4ce5-4e90-af18-41e489aac404",
      "name": "John Doe",
      "email": "john.doe@gmail.com",
      "role": "customer"
    }
  }
  ```

### Step 2: View Portfolio Designs
* **Endpoint**: `GET /api/v1/designs`
* **Method**: `GET`
* **Request Example**: Query parameters: `?style=Scandinavian`
* **Expected Status**: `200 OK`
* **Expected Response**:
  ```json
  [
    {
      "id": "74be-4f40-b302-39048aabc101",
      "title": "Minimalist Scandinavian Living Room",
      "description": "Clean linear designs, natural timber highlights, functional spacing, and neutral color palettes.",
      "room_type": "Living Room",
      "style": "Scandinavian",
      "price_per_sqft": 250.0,
      "image_url": "/static/images/portfolio/scandi_living_primary.jpg"
    }
  ]
  ```

### Step 3: Create Consultation Appointment
* **Endpoint**: `POST /api/v1/appointments`
* **Method**: `POST`
* **Request Example**:
  ```json
  {
    "appointment_date": "2026-06-25",
    "appointment_time": "14:30:00",
    "requirements": "Need spatial rearrangement ideas for the living room.",
    "floor_plan_url": "/static/uploads/floorplans/worli_flat_402.pdf"
  }
  ```
* **Expected Status**: `201 Created`
* **Expected Response**:
  ```json
  {
    "message": "Appointment scheduled successfully",
    "appointment": {
      "id": "f5c1810-74be-4f40-b302-39048aabc401",
      "appointment_date": "2026-06-25",
      "appointment_time": "14:30:00",
      "status": "pending"
    }
  }
  ```

### Step 4: Generate Quotation On-The-Fly
* **Endpoint**: `POST /api/v1/quotations/generate`
* **Method**: `POST`
* **Request Example**:
  ```json
  {
    "design_id": "74be-4f40-b302-39048aabc101",
    "area_sqft": 800.0,
    "material_grade": "Premium"
  }
  ```
* **Expected Status**: `200 OK`
* **Expected Response**:
  ```json
  {
    "material_cost": 1200000.0,
    "labour_cost": 360000.0,
    "design_cost": 200000.0,
    "tax_amount": 316800.0,
    "total_amount": 2076800.0
  }
  ```

### Step 5: Save Quotation to Profile
* **Endpoint**: `POST /api/v1/quotations`
* **Method**: `POST`
* **Request Example**:
  ```json
  {
    "design_id": "74be-4f40-b302-39048aabc101",
    "area_sqft": 800.0,
    "material_grade": "Premium"
  }
  ```
* **Expected Status**: `201 Created`
* **Expected Response**: Contains details of generated and saved invoice.
  ```json
  {
    "id": "e421d0f2-dbda-417b-84eb-6660b7293eb4",
    "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
    "design_id": "74be-4f40-b302-39048aabc101",
    "area_sqft": 800.0,
    "material_grade": "Premium",
    "material_cost": 1200000.0,
    "labour_cost": 360000.0,
    "design_cost": 200000.0,
    "tax_amount": 316800.0,
    "total_amount": 2076800.0,
    "created_at": "2026-06-14T15:20:00"
  }
  ```

### Step 6: View Project Status
* **Endpoint**: `GET /api/v1/projects`
* **Method**: `GET`
* **Expected Status**: `200 OK`
* **Expected Response**: Paginated projects list associated with the customer.
  ```json
  {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "pages": 1,
    "items": [
      {
        "id": "e256ea9b-3ab1-4356-aea9-6e4ead0d2a79",
        "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
        "quotation_id": "e421d0f2-dbda-417b-84eb-6660b7293eb4",
        "project_status": "Execution",
        "progress_percentage": 45.0,
        "start_date": "2026-06-01",
        "expected_completion": "2026-08-15"
      }
    ]
  }
  ```

### Step 7: Upload Project File
* **Endpoint**: `POST /api/v1/files/upload`
* **Method**: `POST`
* **Request Example**: Form-data body containing key `file` set to a valid `.pdf` or image.
* **Expected Status**: `201 Created`
* **Expected Response**:
  ```json
  {
    "id": "94e5e83c-4870-4ec4-bd67-6e08bd5cfcdb",
    "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
    "filename": "living_room_balcony_plan.pdf",
    "file_url": "/static/uploads/845df810-ca93-447c-912f-a9200a4c6c4d.pdf",
    "file_type": "pdf",
    "uploaded_at": "2026-06-14T15:20:00"
  }
  ```

### Step 8: Create Lead Inquiry
* **Endpoint**: `POST /api/v1/leads`
* **Method**: `POST`
* **Request Example**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phone": "+919876543210",
    "requirements": "Need quotation revision for balconies."
  }
  ```
* **Expected Status**: `201 Created`
* **Expected Response**:
  ```json
  {
    "message": "Lead created successfully",
    "lead": {
      "id": "b0fe7b21-1eac-48db-86f9-348321d62946",
      "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
      "name": "John Doe",
      "email": "john.doe@gmail.com",
      "phone": "+919876543210",
      "requirements": "Need quotation revision for balconies.",
      "status": "new",
      "created_at": "2026-06-14T15:20:00"
    }
  }
  ```

### Step 9: View Alerts & Notifications
* **Endpoint**: `GET /api/v1/notifications`
* **Method**: `GET`
* **Expected Status**: `200 OK`
* **Expected Response**: List containing unread/read alert entries.

### Step 10: View Customer Dashboard Analytics
* **Endpoint**: `GET /api/v1/dashboard/customer`
* **Method**: `GET`
* **Expected Status**: `200 OK`
* **Expected Response**:
  ```json
  {
    "active_projects": 1,
    "approved_quotations": 1,
    "completed_projects": 0,
    "customer_id": "3a31b18e-4ce5-4e90-af18-41e489aac404",
    "total_leads": 1,
    "total_notifications": 1,
    "total_quotations": 1,
    "unread_notifications": 1,
    "uploaded_files": 1
  }
  ```

---

## 2. Admin Journey Testing

This flow tests the administrative workflow of managing leads, consultation slots, project progress tracking, and viewing operations dashboards.

### Step 1: Admin Login
* **Endpoint**: `POST /api/v1/auth/login`
* **Request**:
  ```json
  {
    "email": "admin@crescentchique.com",
    "password": "CCAdmin2026!"
  }
  ```
* **Expected Result**: Success response (`200 OK`), establishing admin session.

### Step 2: View Incoming Leads
* **Endpoint**: `GET /api/v1/leads`
* **Expected Result**: `200 OK` response with a list containing all leads.

### Step 3: Update Lead Status
* **Endpoint**: `PUT /api/v1/leads/<lead_id>/status`
* **Request**:
  ```json
  {
    "status": "contacted"
  }
  ```
* **Expected Result**: `200 OK` indicating the status successfully updated to "contacted".

### Step 4: View Customer Consultation Appointments
* **Endpoint**: `GET /api/v1/appointments`
* **Expected Result**: `200 OK` list containing all system consultation slots.

### Step 5: Confirm / Update Appointment Status
* **Endpoint**: `PUT /api/v1/appointments/<appointment_id>/status`
* **Request**:
  ```json
  {
    "status": "confirmed"
  }
  ```
* **Expected Result**: `200 OK` modifying status of appointment.

### Step 6: View Project Trackers
* **Endpoint**: `GET /api/v1/projects`
* **Expected Result**: `200 OK` list of all active projects in the system.

### Step 7: Update Project Progress Milestone
* **Endpoint**: `PUT /api/v1/projects/<project_id>/status`
* **Request**:
  ```json
  {
    "project_status": "Execution",
    "progress_percentage": 50.0
  }
  ```
* **Expected Result**: `200 OK` indicating status modified to "Execution" with progress updated to 50%.

### Step 8: View Administrative Dashboard Analytics
* **Endpoint**: `GET /api/v1/dashboard/admin`
* **Expected Result**: `200 OK` response returning system-wide stats counts.

---

## 3. Security Testing

Security checks focus on authorization guards, role boundaries, and resource ownership rules.

| Test Case | Method | Endpoint | Authorized User | Unauthorized User | Expected Response (Unauthorized) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Admin Dashboard Access | GET | `/api/v1/dashboard/admin` | Admin | Customer | `403 Forbidden` (`{"error": "Admin privilege required"}`) |
| Customer Dashboard Access | GET | `/api/v1/dashboard/customer` | Customer | Admin | `403 Forbidden` (`{"error": "Customer privilege required"}`) |
| Delete Lead Inquiry | DELETE | `/api/v1/leads/<id>` | Admin | Customer | `403 Forbidden` (`{"error": "Admin privilege required"}`) |
| Restore Soft-Deleted Record | PUT | `/api/v1/leads/<id>/restore` | Admin | Customer | `403 Forbidden` (`{"error": "Admin privilege required"}`) |
| View Specific Quotation Details | GET | `/api/v1/quotations/<id>` | Admin, Owner | Customer (non-owner) | `403 Forbidden` (`{"error": "Unauthorized view access"}`) |
| Retrieve Specific Lead Metadata | GET | `/api/v1/leads/<id>` | Admin, Owner | Customer (non-owner) | `403 Forbidden` (`{"error": "Unauthorized view access"}`) |
| Anonymous Endpoints | GET | `/api/v1/projects` | Logged In | Guest User | `302 Found` (redirect to login) or `401 Unauthorized` |

---

## 4. Validation Testing (Negative Scenarios)

Verification parameters checking that input validation rejects malformed requests cleanly.

- **Missing Fields on Lead Creation**:
  - `POST /api/v1/leads` with empty `name`, `email` or `phone`.
  - Expected: `400 Bad Request` (`{"error": "Missing required fields: ..."}`)
- **Invalid Email Format**:
  - `POST /api/v1/leads` with `"email": "invalidemail"`
  - Expected: `400 Bad Request` (`{"error": "Invalid email format"}`)
- **Progress Out of Bounds**:
  - `PUT /api/v1/projects/<id>/status` with `"progress_percentage": 105.0`
  - Expected: `400 Bad Request` (`{"error": "progress_percentage must be between 0 and 100"}`)
- **Invalid Project Status**:
  - `PUT /api/v1/projects/<id>/status` with `"project_status": "Planning"`
  - Expected: `400 Bad Request` (`{"error": "Invalid project status. Must be one of: ..."}`)
- **Pagination Out of Bounds**:
  - `GET /api/v1/leads?page=-1` or `GET /api/v1/leads?per_page=120`
  - Expected: `400 Bad Request` (`{"error": "page parameter must be at least 1"}` / `"per_page parameter cannot exceed 100"`)
- **Invalid File Extension on Upload**:
  - `POST /api/v1/files/upload` uploading a `.exe` or `.txt` document.
  - Expected: `400 Bad Request` (`{"error": "Invalid file extension. Allowed extensions are: ..."}`)

---

## 5. Database Verification Checklist

SQL commands to run against the MySQL database during verification cycles.

```sql
-- 1. Check all registered users
SELECT id, name, email, role, is_deleted FROM users;

-- 2. Verify customer profiles
SELECT id, user_id, phone, city, state FROM customers;

-- 3. Verify lead inquiries and statuses
SELECT id, customer_id, name, email, status, is_deleted FROM leads;

-- 4. Check active projects and milestones
SELECT id, customer_id, project_status, progress_percentage, is_deleted FROM projects;

-- 5. List saved quotations
SELECT id, customer_id, material_grade, total_amount, is_deleted FROM quotations;

-- 6. Check consultation slots
SELECT id, customer_id, appointment_date, status, is_deleted FROM appointments;

-- 7. Count files uploaded
SELECT id, customer_id, filename, file_type, is_deleted FROM files;

-- 8. Verify soft deletion records timestamps
SELECT id, name, is_deleted, deleted_at FROM leads WHERE is_deleted = 1;
SELECT id, filename, is_deleted, deleted_at FROM files WHERE is_deleted = 1;
```

---

## 6. Manual & Postman Verification Checklist

- [ ] **Auth Session Validation**: Login as Customer, retrieve cookie, login as Admin, verify cookie shifts.
- [ ] **Soft Delete Cycle**: Target a Lead, delete it as Admin (verifies 200), attempt lookup (verifies 404), double-delete (verifies 404), restore it (verifies 200), verify retrieval works (verifies 200).
- [ ] **Role Isolation Check**: Query `/api/v1/dashboard/admin` using Customer cookie session to verify `403 Forbidden` response.
- [ ] **Pagination limits**: Request with `?per_page=1` and ensure `pages` reflects the total items count.

---

## 7. Final Backend Readiness Checklist

- [ ] All database model entities inherit from `UUIDBase` and implement logical soft deletion.
- [ ] Service layers contain input parameter validations and business logic checks.
- [ ] Blueprints perform cookie-session role checks (Flask-Login context).
- [ ] No Python syntax errors present (validated via `compileall` syntax checks).
- [ ] Local database seeds load correctly via `scripts/seed_db.py`.
- [ ] Integration validation scripts execute successfully without failures.
