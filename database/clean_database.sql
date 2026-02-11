-- Clean all data from database and keep only admin user
USE aitechpulze_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data from tables
DELETE FROM projects;
DELETE FROM payments;
DELETE FROM project_files;
DELETE FROM activity_logs;

-- Delete all users except admin
DELETE FROM users WHERE email != 'admin@aitechpulze.com';

-- Update admin user with phone number
UPDATE users 
SET phone = '9585776088', 
    name = 'Admin',
    role = 'ADMIN'
WHERE email = 'admin@aitechpulze.com';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database cleaned successfully. Only admin user remains.' AS Status;
