const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  try {
    // Hash password
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Password hash generated:', hashedPassword);
    
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    // Delete existing admin
    await connection.execute('DELETE FROM users WHERE email = ?', ['aitechpulze@gmail.com']);
    console.log('Deleted existing admin');
    
    // Insert new admin
    await connection.execute(
      'INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      ['Admin', 'aitechpulze@gmail.com', hashedPassword, 'ADMIN', 1]
    );
    
    console.log('✅ Admin created successfully!');
    console.log('Email: aitechpulze@gmail.com');
    console.log('Password: Admin@123');
    
    // Verify
    const [rows] = await connection.execute('SELECT id, name, email, role FROM users WHERE email = ?', ['aitechpulze@gmail.com']);
    console.log('Admin user:', rows[0]);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
