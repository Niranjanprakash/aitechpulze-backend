const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured, skipping email');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"AI Tech Pulze" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html || `<pre>${text}</pre>`
    };

    // Set timeout for email sending
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 8000)
      )
    ]);
    
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't fail registration if email fails
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };