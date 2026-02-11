const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to default postgres database
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Pvbn@7738',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='aitechpulze_db'"
    );
    
    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE aitechpulze_db');
      console.log('✅ Database "aitechpulze_db" created successfully');
    } else {
      console.log('✅ Database "aitechpulze_db" already exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();
