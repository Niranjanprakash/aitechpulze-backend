const logActivity = async (userId, action, description, ip) => {
  try {
    console.log(`Activity Log: User ${userId} - ${action} - ${description} from ${ip}`);
    // You can add database logging here if needed
    return true;
  } catch (error) {
    console.error('Activity logging error:', error);
    return false;
  }
};

module.exports = { logActivity };