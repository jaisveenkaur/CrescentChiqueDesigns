# Crescent Chique Designs API Documentation

Welcome to the developer-facing API documentation for the Crescent Chique Designs SaaS backend. This document provides detail on all endpoint routes, authorization guards, request payloads, query filters, pagination formats, and response outputs.

---

## Table of Contents
1. [Authentication](#authentication)
2. [Customers](#customers)
3. [Appointments](#appointments)
4. [Quotations](#quotations)
5. [Projects](#projects)
6. [Notifications](#notifications)
7. [Files](#files)
8. [Leads](#leads)
9. [Dashboard Analytics](#dashboard-analytics)
10. [Search & Pagination Reference](#search--pagination-reference)
11. [Error Handling Reference](#error-handling-reference)

---

## Authentication

All stateful session authentication is managed via session cookies tracked using Flask-Login.

### Register Customer User
* **Method**: `POST`
* **URL**: `/api/v1/auth/register`
* **Purpose**: Registers a new customer login account and completes their physical contact customer profile details.
* **Authorization**: Public
* **Request Body**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah.connor@example.com",
    "password": "Password123!",
    "phone": "+919900112233",
    "address": "Apartment 101, B-Wing, Beverly Hills",
    "city": "Mumbai",
    "state": "Maharashtra"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "User registered and profile created successfully",
    "user_id": "c76e2730-a8d6-4fe4-aa3c-23743fbfd293",
    "customer_id": "e81f1810-74be-4f40-b302-39048aabc499"
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Email already registered or missing required input fields.
  - `500 Internal Server Error`: Transaction database failure.

### Login User
* **Method**: `POST`
* **URL**: `/api/v1/auth/login`
* **Purpose**: Authenticates credentials and sets the session cookie.
* **Authorization**: Public
* **Request Body**:
  ```json
  {
    "email": "john.doe@gmail.com",
    "password": "JohnDoe2026!"
  }
  ```
* **Success Response (200 OK)**:
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
* **Error Responses**:
  - `401 Unauthorized`: Invalid email or password.

### Logout User
* **Method**: `POST`
* **URL**: `/api/v1/auth/logout`
* **Purpose**: Terminates the active session and clears cookies.
* **Authorization**: Customer / Admin (Authenticated)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
* **Error Responses**:
  - `401 Unauthorized`: Session not active.

---

## Customers

### Get Profile Details
* **Method**: `GET`
* **URL**: `/api/v1/auth/profile`
* **Purpose**: Fetches the authenticated user's workspace profile and configuration details.
* **Authorization**: Customer / Admin (Authenticated)
* **Success Response (200 OK)**:
  ```json
  {
    "id": "3a31b18e-4ce5-4e90-af18-41e489aac404",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "customer",
    "customer_profile": {
      "id": "3a31b18e-4ce5-4e90-af18-41e489aac404",
      "phone": "+919876543210",
      "address": "Apartment 402, Sea Breeze Wing B, Worli",
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }
  ```
* **Error Responses**:
  - `401 Unauthorized`: Authentication required.

---

## Appointments

### Book Consultation Appointment
* **Method**: `POST`
* **URL**: `/api/v1/appointments`
* **Purpose**: Schedules a new spatial rearrangement or design consultation slot.
* **Authorization**: Customer
* **Request Body**:
  ```json
  {
    "appointment_date": "2026-06-25",
    "appointment_time": "14:30:00",
    "requirements": "Need spatial rearrangement ideas for the living room, specifically wanting to accommodate a bookshelf.",
    "floor_plan_url": "/static/uploads/floorplans/worli_flat_402.pdf"
  }
  ```
* **Success Response (201 Created)**:
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
* **Error Responses**:
  - `400 Bad Request`: Invalid date format, time format, or scheduling a slot in the past.
  - `403 Forbidden`: Authenticated user is not a customer.

### List and Search Appointments
* **Method**: `GET`
* **URL**: `/api/v1/appointments`
* **Purpose**: Fetches paginated list of active appointments, optionally filtered. Customers only see their own bookings; Admins see all.
* **Authorization**: Customer / Admin
* **Query Parameters**:
  - `page` (default: 1)
  - `per_page` (default: 10)
  - `status` (exact match: `pending`, `confirmed`, `completed`, `cancelled`)
  - `appointment_date` (exact match format `YYYY-MM-DD`)
* **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "pages": 1,
    "items": [
      {
        "id": "f5c1810-74be-4f40-b302-39048aabc401",
        "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
        "appointment_date": "2026-06-25",
        "appointment_time": "14:30:00",
        "status": "confirmed",
        "requirements": "Need spatial rearrangement ideas for the living room, specifically wanting to accommodate a bookshelf.",
        "floor_plan_url": "/static/uploads/floorplans/worli_flat_402.pdf"
      }
    ]
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Out of range page/per_page or invalid filters format.

### Update Appointment Status
* **Method**: `PUT`
* **URL**: `/api/v1/appointments/<id>/status`
* **Purpose**: Updates the stage or state of a consultation booking.
* **Authorization**: Admin
* **Request Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Appointment status modified successfully",
    "appointment": {
      "id": "f5c1810-74be-4f40-b302-39048aabc401",
      "status": "confirmed"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Invalid status value.
  - `403 Forbidden`: Admin role required.
  - `404 Not Found`: Appointment slot not found.

### Cancel Appointment
* **Method**: `DELETE`
* **URL**: `/api/v1/appointments/<id>`
* **Purpose**: Sets status of appointment to "cancelled" (soft cancellation).
* **Authorization**: Customer (owning appointment) / Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Appointment cancelled successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Unauthorized cancellation attempt.
  - `404 Not Found`: Appointment not found.

---

## Quotations

### Generate Estimation On-The-Fly
* **Method**: `POST`
* **URL**: `/api/v1/quotations/generate`
* **Purpose**: Runs the cost calculation engine on spatial parameters and returns cost items without persisting records in the database.
* **Authorization**: Public
* **Request Body**:
  ```json
  {
    "design_id": "74be-4f40-b302-39048aabc101",
    "area_sqft": 800.0,
    "material_grade": "Premium"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "material_cost": 1200000.0,
    "labour_cost": 360000.0,
    "design_cost": 200000.0,
    "tax_amount": 316800.0,
    "total_amount": 2076800.0
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Invalid area, grade, or non-existent design configuration.

### Save Persisted Quotation
* **Method**: `POST`
* **URL**: `/api/v1/quotations`
* **Purpose**: Generates and persists quotation costs.
* **Authorization**: Customer
* **Request Body**:
  ```json
  {
    "design_id": "74be-4f40-b302-39048aabc101",
    "area_sqft": 800.0,
    "material_grade": "Premium"
  }
  ```
* **Success Response (201 Created)**:
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
* **Error Responses**:
  - `400 Bad Request`: Validation failures on costs calculations or missing fields.

### List and Search Quotations
* **Method**: `GET`
* **URL**: `/api/v1/quotations`
* **Purpose**: Returns a paginated list of invoice records (Admins see all; Customers see own).
* **Authorization**: Customer / Admin
* **Query Parameters**:
  - `page` (default: 1)
  - `per_page` (default: 10)
  - `material_grade` (exact match: `Economy`, `Premium`, `Luxury`)
  - `min_amount` (min total amount)
  - `max_amount` (max total amount)
* **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "pages": 1,
    "items": [
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
    ]
  }
  ```

### Get Quotation Details
* **Method**: `GET`
* **URL**: `/api/v1/quotations/<id>`
* **Purpose**: Retrieves detail layout metrics for a single quotation.
* **Authorization**: Customer (owning profile) / Admin
* **Success Response (200 OK)**:
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
* **Error Responses**:
  - `403 Forbidden`: Unauthorized view access.
  - `404 Not Found`: Quotation invoice not found.

### Soft Delete Quotation
* **Method**: `DELETE`
* **URL**: `/api/v1/quotations/<id>`
* **Purpose**: Logically marks a quotation as deleted.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Quotation deleted successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Quotation not found or already deleted.

### Restore Quotation
* **Method**: `PUT`
* **URL**: `/api/v1/quotations/<id>/restore`
* **Purpose**: Recovers a logically soft-deleted quotation.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Quotation restored successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Quotation not found or not deleted.

---

## Projects

### List and Search Projects
* **Method**: `GET`
* **URL**: `/api/v1/projects`
* **Purpose**: Returns a paginated list of project trackers (Admins see all; Customers see own).
* **Authorization**: Customer / Admin
* **Query Parameters**:
  - `page` (default: 1)
  - `per_page` (default: 10)
  - `project_status` (exact match: `Lead Created`, `Quotation Approved`, `Design Finalized`, `Procurement`, `Execution`, `Quality Check`, `Completed`)
  - `min_progress` (decimal value 0-100)
  - `max_progress` (decimal value 0-100)
* **Success Response (200 OK)**:
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

### Get Project Details
* **Method**: `GET`
* **URL**: `/api/v1/projects/<id>`
* **Purpose**: Retrieves specification status details for a target project.
* **Authorization**: Customer (owning profile) / Admin
* **Success Response (200 OK)**:
  ```json
  {
    "id": "e256ea9b-3ab1-4356-aea9-6e4ead0d2a79",
    "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
    "quotation_id": "e421d0f2-dbda-417b-84eb-6660b7293eb4",
    "project_status": "Execution",
    "progress_percentage": 45.0,
    "start_date": "2026-06-01",
    "expected_completion": "2026-08-15",
    "created_at": "2026-06-14T15:20:00"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Unauthorized view access.
  - `404 Not Found`: Project not found.

### Update Project Status (Admin Only)
* **Method**: `PUT`
* **URL**: `/api/v1/projects/<id>/status`
* **Purpose**: Updates project phase and milestone progress percentages.
* **Authorization**: Admin
* **Request Body**:
  ```json
  {
    "project_status": "Execution",
    "progress_percentage": 50.0
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Project status updated successfully",
    "project": {
      "id": "e256ea9b-3ab1-4356-aea9-6e4ead0d2a79",
      "project_status": "Execution",
      "progress_percentage": 50.0
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Progress out of range (0-100) or invalid status.
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Project tracker not found.

### Soft Delete Project
* **Method**: `DELETE`
* **URL**: `/api/v1/projects/<id>`
* **Purpose**: Logically soft deletes a project tracker.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Project not found or already deleted.

### Restore Project
* **Method**: `PUT`
* **URL**: `/api/v1/projects/<id>/restore`
* **Purpose**: Recovers a logically soft-deleted project.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Project restored successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Project not found or not deleted.

---

## Notifications

### List Customer Notifications
* **Method**: `GET`
* **URL**: `/api/v1/notifications`
* **Purpose**: Lists notification history alerts for the logged-in customer.
* **Authorization**: Customer
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "c1a2d0f2-dbda-417b-84eb-6660b7293eb9",
      "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
      "title": "Project Stage Updated",
      "message": "Great news! Your living room project has successfully transitioned to the 'Execution' phase.",
      "is_read": false,
      "created_at": "2026-06-14T15:20:00",
      "updated_at": "2026-06-14T15:20:00"
    }
  ]
  ```
* **Error Responses**:
  - `403 Forbidden`: Only registered customers can access notifications.

### Mark Notification as Read
* **Method**: `PUT`
* **URL**: `/api/v1/notifications/<id>/read`
* **Purpose**: Marks a notification alert as read.
* **Authorization**: Customer (owning alert)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Notification marked as read successfully",
    "notification": {
      "id": "c1a2d0f2-dbda-417b-84eb-6660b7293eb9",
      "is_read": true
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Failures in ownership validation.
  - `404 Not Found`: Alert record not found.

---

## Files

Allowed extensions are `pdf`, `png`, `jpg`, and `jpeg`. The maximum allowed file size is **10MB**.

### Upload Customer File
* **Method**: `POST`
* **URL**: `/api/v1/files/upload`
* **Purpose**: Uploads and registers floor plans, spatial references, or design assets.
* **Authorization**: Customer
* **Request Body**: Multipart form-data containing the `file` field.
* **Success Response (201 Created)**:
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
* **Error Responses**:
  - `400 Bad Request`: Invalid file type or file exceeds the 10MB threshold limit.

### List and Search Files Metadata
* **Method**: `GET`
* **URL**: `/api/v1/files`
* **Purpose**: Returns a paginated list of file metadata records (Admins see all; Customers see own).
* **Authorization**: Customer / Admin
* **Query Parameters**:
  - `page` (default: 1)
  - `per_page` (default: 10)
  - `file_type` (exact extension, e.g., `pdf`, `png`)
  - `filename` (partial match search string)
* **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "pages": 1,
    "items": [
      {
        "id": "94e5e83c-4870-4ec4-bd67-6e08bd5cfcdb",
        "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
        "filename": "living_room_balcony_plan.pdf",
        "file_url": "/static/uploads/845df810-ca93-447c-912f-a9200a4c6c4d.pdf",
        "file_type": "pdf",
        "uploaded_at": "2026-06-14T15:20:00"
      }
    ]
  }
  ```

### Get File Details
* **Method**: `GET`
* **URL**: `/api/v1/files/<id>`
* **Purpose**: Returns metadata for a single registered file record.
* **Authorization**: Customer (owning profile) / Admin
* **Success Response (200 OK)**:
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

### Soft Delete File
* **Method**: `DELETE`
* **URL**: `/api/v1/files/<id>`
* **Purpose**: Logically soft deletes a file record.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "File deleted successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: File not found or already deleted.

### Restore File
* **Method**: `PUT`
* **URL**: `/api/v1/files/<id>/restore`
* **Purpose**: Recovers a logically soft-deleted file metadata.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "File restored successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: File not found or not deleted.

---

## Leads

### Submit Lead Inquiry
* **Method**: `POST`
* **URL**: `/api/v1/leads`
* **Purpose**: Submits a new project design request lead.
* **Authorization**: Customer
* **Request Body**:
  ```json
  {
    "name": "Jane Miller",
    "email": "jane.miller@example.com",
    "phone": "+919988776655",
    "requirements": "Balcony design with luxury wooden flooring and planter boxes."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Lead created successfully",
    "lead": {
      "id": "b0fe7b21-1eac-48db-86f9-348321d62946",
      "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
      "name": "Jane Miller",
      "email": "jane.miller@example.com",
      "phone": "+919988776655",
      "requirements": "Balcony design with luxury wooden flooring and planter boxes.",
      "status": "new",
      "created_at": "2026-06-14T15:20:00"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Missing fields or invalid email format.

### List and Search Leads
* **Method**: `GET`
* **URL**: `/api/v1/leads`
* **Purpose**: Returns a paginated list of leads (Admins see all; Customers see own).
* **Authorization**: Customer / Admin
* **Query Parameters**:
  - `page` (default: 1)
  - `per_page` (default: 10)
  - `status` (exact match: `new`, `contacted`, `qualified`, `lost`)
  - `name` (partial match search string)
  - `email` (partial match search string)
* **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "pages": 1,
    "items": [
      {
        "id": "b0fe7b21-1eac-48db-86f9-348321d62946",
        "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
        "name": "Jane Miller",
        "email": "jane.miller@example.com",
        "phone": "+919988776655",
        "requirements": "Balcony design with luxury wooden flooring and planter boxes.",
        "status": "new",
        "created_at": "2026-06-14T15:20:00"
      }
    ]
  }
  ```

### Get Lead Details
* **Method**: `GET`
* **URL**: `/api/v1/leads/<id>`
* **Purpose**: Retrieves specification details for a specific lead.
* **Authorization**: Customer (owning profile) / Admin
* **Success Response (200 OK)**:
  ```json
  {
    "id": "b0fe7b21-1eac-48db-86f9-348321d62946",
    "customer_id": "e81f1810-74be-4f40-b302-39048aabc499",
    "name": "Jane Miller",
    "email": "jane.miller@example.com",
    "phone": "+919988776655",
    "requirements": "Balcony design with luxury wooden flooring and planter boxes.",
    "status": "new",
    "created_at": "2026-06-14T15:20:00",
    "updated_at": "2026-06-14T15:20:00"
  }
  ```

### Update Lead Status (Admin Only)
* **Method**: `PUT`
* **URL**: `/api/v1/leads/<id>/status`
* **Purpose**: Modifies the status categorization of an inquiry.
* **Authorization**: Admin
* **Request Body**:
  ```json
  {
    "status": "contacted"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Lead status updated successfully",
    "lead": {
      "id": "b0fe7b21-1eac-48db-86f9-348321d62946",
      "status": "contacted"
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Invalid status value.
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Lead not found.

### Soft Delete Lead
* **Method**: `DELETE`
* **URL**: `/api/v1/leads/<id>`
* **Purpose**: Logically soft deletes a lead inquiry.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Lead deleted successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Lead not found or already deleted.

### Restore Lead
* **Method**: `PUT`
* **URL**: `/api/v1/leads/<id>/restore`
* **Purpose**: Recovers a logically soft-deleted lead.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Lead restored successfully"
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.
  - `404 Not Found`: Lead not found or not deleted.

---

## Dashboard Analytics

### Admin Summary Operations Dashboard
* **Method**: `GET`
* **URL**: `/api/v1/dashboard/admin`
* **Purpose**: Returns aggregate counters across all active system models for the administrative interface.
* **Authorization**: Admin
* **Success Response (200 OK)**:
  ```json
  {
    "active_projects": 1,
    "approved_quotations": 1,
    "completed_appointments": 0,
    "completed_projects": 0,
    "new_leads": 1,
    "pending_appointments": 0,
    "qualified_leads": 1,
    "total_customers": 1,
    "total_leads": 2,
    "total_quotations": 1,
    "uploaded_files": 1
  }
  ```
* **Error Responses**:
  - `403 Forbidden`: Admin privilege required.

### Customer Dashboard
* **Method**: `GET`
* **URL**: `/api/v1/dashboard/customer`
* **Purpose**: Returns summary workspace counters relevant to the active customer profile.
* **Authorization**: Customer
* **Success Response (200 OK)**:
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
* **Error Responses**:
  - `403 Forbidden`: Customer privilege required.
  - `404 Not Found`: Customer profile details not found.

---

## Search & Pagination Reference

Standard GET request parameters:
- `page`: Target page number index (integer starting at 1, defaults to 1).
- `per_page`: Limits item rows returned per page range (integer 1 to 100, defaults to 10).

### Filtering Parameter Examples
- Retrieve leads by new status:
  `GET /api/v1/leads?status=new`
- Retrieve balcony file pdf layouts:
  `GET /api/v1/files?file_type=pdf&filename=balcony`
- Retrieve projects with specific status and progress limits:
  `GET /api/v1/projects?project_status=Execution&min_progress=10&max_progress=90`

---

## Error Handling Reference

Common system-wide API error payloads:

### Unauthorized Access
Returned when authentication sessions are missing or expired.
* **HTTP Code**: `401 Unauthorized`
* **Payload**:
  ```json
  {
    "error": "Authentication required. Please login."
  }
  ```

### Forbidden Operations
Returned when a customer tries to query admin endpoints.
* **HTTP Code**: `403 Forbidden`
* **Payload**:
  ```json
  {
    "error": "Admin privilege required"
  }
  ```

### Resource Not Found
Returned when targets are non-existent, soft-deleted, or configuration validation fails.
* **HTTP Code**: `404 Not Found`
* **Payload**:
  ```json
  {
    "error": "Record not found"
  }
  ```

### Validation Error
Returned when parameters (such as email pattern checks, negative area values, or progress limits) violate model requirements.
* **HTTP Code**: `400 Bad Request`
* **Payload**:
  ```json
  {
    "error": "progress_percentage must be between 0 and 100"
  }
  ```
