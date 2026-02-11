const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL connection for serverless (Vercel)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

// No need to create database in PostgreSQL (managed by provider)
const createDatabase = async () => {
  console.log('✅ Using managed PostgreSQL database');
};

module.exports = { sequelize, createDatabase };