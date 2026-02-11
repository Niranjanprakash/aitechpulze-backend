-- AI Tech Pulze Database Schema
CREATE DATABASE IF NOT EXISTS aitechpulze_db;
USE aitechpulze_db;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Status Table
CREATE TABLE project_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id VARCHAR(20) UNIQUE NOT NULL,
    domain VARCHAR(100) NOT NULL,
    technology VARCHAR(100) NOT NULL,
    project_type ENUM('SOFTWARE', 'HARDWARE') DEFAULT 'SOFTWARE',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    estimated_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2),
    status_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES project_status(id)
);

-- Project Files Table
CREATE TABLE project_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('UPI', 'NET_BANKING', 'CARD') DEFAULT 'UPI',
    transaction_id VARCHAR(100),
    utr_number VARCHAR(50),
    payment_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by INT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES admins(id)
);

-- Messages Table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('USER', 'ADMIN') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('TEXT', 'FILE') DEFAULT 'TEXT',
    file_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    type ENUM('EMAIL', 'WHATSAPP', 'SYSTEM') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Insert Default Project Status
INSERT INTO project_status (status_name, description) VALUES
('Requested', 'Project has been submitted and is awaiting review'),
('Approved', 'Project has been approved and is ready to start'),
('In Progress', 'Project development is currently in progress'),
('Payment Pending', 'Project is on hold due to pending payment'),
('Partially Paid', 'Partial payment received, awaiting full payment'),
('Completed', 'Project has been completed successfully'),
('On Hold', 'Project is temporarily on hold'),
('Cancelled', 'Project has been cancelled');

-- Insert Default Admin (password: admin123)
INSERT INTO admins (username, email, password) VALUES
('admin', 'admin@aitechpulze.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Create Indexes for Performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status_id);
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);