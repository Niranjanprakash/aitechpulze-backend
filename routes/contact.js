const express = require('express');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Handle contact form submission
router.post('/send-message', async (req, res) => {
  try {
    console.log('Contact form data received:', req.body);
    
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      console.log('Missing fields:', { name: !!name, email: !!email, phone: !!phone, message: !!message });
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Send email to admin
    const adminEmailResult = await sendEmail(
      process.env.EMAIL_USER, // Send to your Gmail
      `📧 New Contact Message from ${name}`,
      `New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

---
Sent from AI Tech Pulze Contact Form
Time: ${new Date().toLocaleString()}`
    );

    console.log('Email send result:', adminEmailResult);

    if (adminEmailResult.success) {
      res.json({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get contact information
router.get('/whatsapp', (req, res) => {
  res.json({
    success: true,
    data: {
      whatsapp_number: process.env.ADMIN_WHATSAPP || '919585776088',
      whatsapp_url: `https://wa.me/${process.env.ADMIN_WHATSAPP || '919585776088'}`,
      message_template: 'Hello! I need help with my project from AI Tech Pulze.'
    }
  });
});

module.exports = router;