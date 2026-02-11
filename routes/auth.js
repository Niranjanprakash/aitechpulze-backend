const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendRegistrationNotifications, sendLoginNotifications } = require('../utils/notifications');
const { logActivity } = require('../utils/logger');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

    const user = await User.create({ name, email, phone, password });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logActivity(user.id, 'USER_REGISTERED', `User ${name} registered`, req.ip);
    
    // Send registration notifications
    await sendRegistrationNotifications(user);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const validPassword = await user.comparePassword(password);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    await logActivity(user.id, 'USER_LOGIN', `User ${user.name} logged in`, req.ip);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await User.findOne({ where: { email, role: 'ADMIN' } });
    if (!admin) return res.status(400).json({ success: false, message: 'Invalid admin credentials' });

    const validPassword = await admin.comparePassword(password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid admin credentials' });

    const token = jwt.sign({ userId: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    await logActivity(admin.id, 'ADMIN_LOGIN', `Admin ${admin.name} logged in`, req.ip);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin login failed' });
  }
});

module.exports = router;