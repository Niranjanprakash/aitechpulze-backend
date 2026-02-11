const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectFile = sequelize.define('ProjectFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING
  },
  file_size: {
    type: DataTypes.INTEGER
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'project_files',
  timestamps: false
});

module.exports = ProjectFile;