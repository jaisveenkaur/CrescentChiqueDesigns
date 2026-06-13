-- Crescent Chique Designs 2.0 Database Schema
-- Target Database: MySQL 8.0+
-- Storage Engine: InnoDB
-- Character Set: utf8mb4 COLLATE utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS crescent_chique_db;
USE crescent_chique_db;

-- 1. users Table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- Validation: 'customer', 'admin'
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. customers Table
CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NULL DEFAULT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_user_id (user_id),
    CONSTRAINT fk_customers_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. designs Table
CREATE TABLE IF NOT EXISTS designs (
    id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    room_type VARCHAR(100) NOT NULL, -- Validation: 'Kitchen', 'Bedroom', 'Living Room', 'Bathroom', etc.
    style VARCHAR(100) NOT NULL,     -- Validation: 'Modern', 'Luxury', 'Scandinavian', 'Industrial', etc.
    price_per_sqft DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. design_images Table
CREATE TABLE IF NOT EXISTS design_images (
    id CHAR(36) NOT NULL,
    design_id CHAR(36) NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_design_images_design_id FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Validation: 'pending', 'confirmed', 'completed', 'cancelled'
    requirements TEXT NULL DEFAULT NULL,
    floor_plan_url VARCHAR(512) NULL DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_appointments_customer_id FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    design_id CHAR(36) NULL DEFAULT NULL,
    area_sqft DECIMAL(10,2) NOT NULL,
    material_grade VARCHAR(50) NOT NULL, -- Validation: 'Economy', 'Premium', 'Luxury'
    material_cost DECIMAL(12,2) NOT NULL,
    labour_cost DECIMAL(12,2) NOT NULL,
    design_cost DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    pdf_url VARCHAR(512) NULL DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_quotations_customer_id FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_quotations_design_id FOREIGN KEY (design_id) REFERENCES designs (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. projects Table
CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    quotation_id CHAR(36) NOT NULL,
    project_status VARCHAR(50) NOT NULL DEFAULT 'Lead Created', -- Validation: 'Lead Created', 'Consultation Scheduled', etc.
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    start_date DATE NULL DEFAULT NULL,
    expected_completion DATE NULL DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_projects_quotation_id (quotation_id),
    CONSTRAINT fk_projects_customer_id FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_projects_quotation_id FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. leads Table
CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) NOT NULL,
    customer_id CHAR(36) NULL DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    requirements TEXT NULL DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- Validation: 'new', 'contacted', 'qualified', 'lost'
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_leads_customer_id FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INDEX DEFINITIONS FOR QUERY OPTIMIZATION
-- =========================================================================

-- users Indexes
CREATE INDEX idx_users_email_deleted ON users(email, is_deleted);
CREATE INDEX idx_users_role ON users(role);

-- customers Indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- designs Indexes
CREATE INDEX idx_designs_style_room ON designs(style, room_type);

-- design_images Indexes
CREATE INDEX idx_design_images_design_id ON design_images(design_id);

-- appointments Indexes
CREATE INDEX idx_appointments_customer_date ON appointments(customer_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- quotations Indexes
CREATE INDEX idx_quotations_customer_date ON quotations(customer_id, created_at);

-- projects Indexes
CREATE INDEX idx_projects_customer_status ON projects(customer_id, project_status);
CREATE INDEX idx_projects_expected_completion ON projects(expected_completion);

-- leads Indexes
CREATE INDEX idx_leads_customer_id ON leads(customer_id);
CREATE INDEX idx_leads_email_phone ON leads(email, phone);
CREATE INDEX idx_leads_status ON leads(status);

-- notifications Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
