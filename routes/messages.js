const express = require('express');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { sendWhatsApp } = require('../utils/whatsapp');

const router = express.Router();

router.post('/send', auth, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    
    const [projects] = await db.execute('SELECT id FROM projects WHERE project_id = ? AND user_id = ?', [projectId, req.user.id]);
    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });

    await db.execute('INSERT INTO messages (project_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)', [projects[0].id, req.user.id, 'USER', message]);
    
    // Send notifications to admin
    await sendEmail('admin@aitechpulze.com', 'New Message from User', `New message from ${req.user.name} for project ${projectId}: ${message}`);
    await sendWhatsApp('919585776088', `New message from ${req.user.name} for project ${projectId}: ${message}`);
    
    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Message failed' });
  }
});

router.post('/admin/send', adminAuth, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    
    const [projects] = await db.execute('SELECT id, user_id FROM projects WHERE project_id = ?', [projectId]);
    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });

    await db.execute('INSERT INTO messages (project_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)', [projects[0].id, req.admin.id, 'ADMIN', message]);
    
    // Get user email for notification
    const [users] = await db.execute('SELECT email, name FROM users WHERE id = ?', [projects[0].user_id]);
    if (users.length > 0) {
      await sendEmail(users[0].email, 'New Message from AI Tech Pulze', `New message for your project ${projectId}: ${message}`);
    }
    
    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Message failed' });
  }
});

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const [projects] = await db.execute('SELECT id FROM projects WHERE project_id = ? AND user_id = ?', [req.params.projectId, req.user.id]);
    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });

    const [messages] = await db.execute('SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC', [projects[0].id]);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;