const express = require('express');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    const testEmail = to || 'test@example.com';
    const testSubject = subject || '🧪 Test Email from AI Tech Pulze';
    const testMessage = message || `Hello!

This is a test email from AI Tech Pulze to verify Gmail integration is working properly.

✅ Email service: Gmail
📧 From: ${process.env.EMAIL_USER}
⏰ Time: ${new Date().toLocaleString()}

If you receive this email, the Gmail configuration is working correctly!

Best regards,
AI Tech Pulze Team`;

    const result = await sendEmail(testEmail, testSubject, testMessage);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        data: {
          messageId: result.messageId,
          to: testEmail,
          from: process.env.EMAIL_USER
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;