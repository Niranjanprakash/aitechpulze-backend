const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payment_id: {
    type: DataTypes.STRING,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  transaction_id: {
    type: DataTypes.STRING
  },
  payer_name: {
    type: DataTypes.STRING
  },
  verified_at: {
    type: DataTypes.DATE
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Payment;