const { ActivityLog } = require('../models');

const logActivity = async (userId, action, description, ipAddress, metadata = null) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      description,
      ip_address: ipAddress,
      metadata
    });
  } catch (error) {
    console.error('Activity log failed:', error);
  }
};

module.exports = { logActivity };