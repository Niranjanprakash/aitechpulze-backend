const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [totalProjects] = await db.execute('SELECT COUNT(*) as count FROM projects');
    const [totalRevenue] = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = "VERIFIED"');
    const [pendingPayments] = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = "PENDING"');
    
    // Paid vs Unpaid Projects
    const [paidProjects] = await db.execute('SELECT COUNT(DISTINCT p.id) as count FROM projects p JOIN payments pay ON p.id = pay.project_id WHERE pay.payment_status = "VERIFIED"');
    const [unpaidProjects] = await db.execute('SELECT COUNT(*) as count FROM projects WHERE id NOT IN (SELECT DISTINCT project_id FROM payments WHERE payment_status = "VERIFIED")');
    
    // Monthly Revenue Trend (last 6 months)
    const [monthlyTrend] = await db.execute(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as revenue 
      FROM payments WHERE payment_status = 'VERIFIED' AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m') ORDER BY month
    `);

    res.json({
      totalUsers: totalUsers[0].count,
      totalProjects: totalProjects[0].count,
      totalRevenue: totalRevenue[0].total,
      pendingPayments: pendingPayments[0].total,
      paidProjects: paidProjects[0].count,
      unpaidProjects: unpaidProjects[0].count,
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/projects', adminAuth, async (req, res) => {
  try {
    const [projects] = await db.execute(
      'SELECT p.*, ps.status_name, u.name as user_name FROM projects p LEFT JOIN project_status ps ON p.status_id = ps.id LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
    );
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.put('/projects/:projectId/status', adminAuth, async (req, res) => {
  try {
    const { statusId } = req.body;
    await db.execute('UPDATE projects SET status_id = ? WHERE project_id = ?', [statusId, req.params.projectId]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Status update failed' });
  }
});

router.get('/project-status', adminAuth, async (req, res) => {
  try {
    const [statuses] = await db.execute('SELECT * FROM project_status ORDER BY id');
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});

// Delete Client
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user (this will cascade delete related projects and payments if foreign keys are set up)
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Create New Project Status
router.post('/project-status', adminAuth, async (req, res) => {
  try {
    const { statusName, description } = req.body;
    await db.execute('INSERT INTO project_status (status_name, description) VALUES (?, ?)', [statusName, description]);
    res.status(201).json({ message: 'Status created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create status' });
  }
});

// Get All Payments (Admin)
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT p.*, pr.project_id, pr.title as project_title, u.name as user_name, u.email as user_email
      FROM payments p
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.payment_date DESC
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get Project Details with Files (Admin)
router.get('/projects/:projectId/details', adminAuth, async (req, res) => {
  try {
    const [projects] = await db.execute(`
      SELECT p.*, ps.status_name, u.name as user_name, u.email as user_email, u.phone
      FROM projects p
      LEFT JOIN project_status ps ON p.status_id = ps.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.project_id = ?
    `, [req.params.projectId]);

    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });

    const [files] = await db.execute('SELECT * FROM project_files WHERE project_id = ?', [projects[0].id]);
    const [payments] = await db.execute('SELECT * FROM payments WHERE project_id = ? ORDER BY payment_date DESC', [projects[0].id]);
    const [messages] = await db.execute('SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC', [projects[0].id]);

    res.json({ project: projects[0], files, payments, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

module.exports = router;