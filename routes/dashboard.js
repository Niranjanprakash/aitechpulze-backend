const express = require('express');
const { User, Project } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Admin Dashboard Stats
router.get('/admin-stats', adminAuth, async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'ADMIN' } } });
    const pendingProjects = await Project.count({ where: { status: 'PENDING' } });
    
    // Get recent users
    const recentUsers = await User.findAll({
      where: { role: { [Op.ne]: 'ADMIN' } },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'phone', 'created_at']
    });

    res.json({
      success: true,
      data: {
        total_projects: totalProjects,
        total_users: totalUsers,
        pending_projects: pendingProjects,
        recent_users: recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// User Dashboard Data
router.get('/user', auth, async (req, res) => {
  try {
    const totalProjects = await Project.count({ where: { user_id: req.user.id } });
    
    const recentProjects = await Project.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'project_id', 'title', 'status', 'created_at', 'estimated_amount']
    });

    res.json({
      success: true,
      data: {
        total_projects: totalProjects,
        recent_projects: recentProjects
      }
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;