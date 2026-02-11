const User = require('./User');
const ActivityLog = require('./ActivityLog');
const Project = require('./Project');
const Payment = require('./Payment');
const ProjectFile = require('./ProjectFile');

// User associations
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activities' });
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });

// ActivityLog associations
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project associations
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Project.hasMany(Payment, { foreignKey: 'project_id', as: 'payments' });
Project.hasMany(ProjectFile, { foreignKey: 'project_id', as: 'files' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Payment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// ProjectFile associations
ProjectFile.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

module.exports = {
  User,
  ActivityLog,
  Project,
  Payment,
  ProjectFile
};