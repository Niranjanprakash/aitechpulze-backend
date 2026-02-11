-- Reset Admin Password
-- Run this in MySQL to fix login issue

USE aitechpulze_db;

-- Delete existing admin
DELETE FROM users WHERE email = 'aitechpulze@gmail.com';

-- Admin will be recreated on next server restart with new password from .env
-- OR manually insert with bcrypt hash:

-- For password: Admin@123
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYpZJQKqOqK

INSERT INTO users (name, email, password, role, is_active, createdAt, updatedAt) 
VALUES (
  'Admin',
  'aitechpulze@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYpZJQKqOqK',
  'ADMIN',
  1,
  NOW(),
  NOW()
);

SELECT * FROM users WHERE email = 'aitechpulze@gmail.com';
