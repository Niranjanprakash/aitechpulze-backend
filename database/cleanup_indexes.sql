-- Cleanup script to remove excessive indexes from users table
USE aitechpulze_db;

-- Drop the users table and recreate it with minimal indexes
DROP TABLE IF EXISTS users;

-- Recreate users table with only essential indexes
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add only the essential index for email
CREATE UNIQUE INDEX idx_users_email ON users(email);