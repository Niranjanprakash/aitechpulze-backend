const { sendEmail } = require('./email');
const { sendWhatsApp } = require('./whatsapp');
const { sendSMS } = require('./sms');

// Registration notifications
const sendRegistrationNotifications = async (user) => {
  const welcomeMessage = `🎉 Welcome to AI Tech Pulze!

Hi ${user.name},

Thank you for registering with us!

✅ Registration successful
📧 Email: ${user.email}
🔐 You can now login to access our services

Next steps:
1. Login to your account
2. Submit your project requirements
3. Get instant quotes

Welcome aboard! 🚀

AI Tech Pulze Team`;

  const results = [];

  // Send WhatsApp
  if (user.phone) {
    const whatsappResult = await sendWhatsApp(user.phone, welcomeMessage);
    results.push({ channel: 'WhatsApp', success: whatsappResult.success });
  }

  // Send SMS
  if (user.phone) {
    const smsResult = await sendSMS(user.phone, welcomeMessage);
    results.push({ channel: 'SMS', success: smsResult.success });
  }

  // Send detailed welcome email to USER
  const userEmailResult = await sendEmail(
    user.email,
    'Registration Successful - Welcome to AI Tech Pulze!',
    `Dear ${user.name},

Congratulations! Your registration with AI Tech Pulze has been completed successfully.

Account Details:
• Name: ${user.name}
• Email: ${user.email}
• Registration Date: ${new Date().toLocaleDateString()}

Welcome to AI Tech Pulze! We're excited to help you bring your AI and technology projects to life.

Next Steps:
1. Login to your account using your registered email
2. Submit your project requirements through our project request form
3. Track your project progress in real-time through your dashboard
4. Get professional AI, ML, and development services

Our team is ready to assist you with:
• Artificial Intelligence & Machine Learning solutions
• Full-stack web development
• Mobile app development
• Data science and analytics
• Custom software solutions

If you have any questions or need assistance, feel free to contact our support team.

Thank you for choosing AI Tech Pulze!

Best regards,
The AI Tech Pulze Team

---
Support: support@aitechpulze.com
Website: https://aitechpulze.com`
  );
  results.push({ channel: 'User Email', success: userEmailResult.success });

  // Send simple admin notification email
  const adminEmailResult = await sendEmail(
    process.env.ADMIN_EMAIL,
    'New User Registration',
    `${user.name} has registered in the project.

User Details:
• Name: ${user.name}
• Email: ${user.email}
• Registration Date: ${new Date().toLocaleDateString()}`
  );
  results.push({ channel: 'Admin Email', success: adminEmailResult.success });

  return results;
};

// Login notifications
const sendLoginNotifications = async (user) => {
  const loginMessage = `🔐 Login Successful!

Hi ${user.name},

You have successfully logged into AI Tech Pulze

⏰ Time: ${new Date().toLocaleString()}
🌐 Continue exploring our services

Happy coding! 💻

AI Tech Pulze`;

  const results = [];

  // Send WhatsApp
  if (user.phone) {
    const whatsappResult = await sendWhatsApp(user.phone, loginMessage);
    results.push({ channel: 'WhatsApp', success: whatsappResult.success });
  }

  // Send SMS
  if (user.phone) {
    const smsResult = await sendSMS(user.phone, loginMessage);
    results.push({ channel: 'SMS', success: smsResult.success });
  }

  // Send Email
  const emailResult = await sendEmail(
    user.email,
    '🔐 Login Successful - AI Tech Pulze',
    `Dear ${user.name},

You have successfully logged into your AI Tech Pulze account.

Login Details:
• Time: ${new Date().toLocaleString()}
• Email: ${user.email}

If this wasn't you, please contact us immediately.

Best regards,
AI Tech Pulze Team`
  );
  results.push({ channel: 'Email', success: emailResult.success });

  return results;
};

module.exports = {
  sendRegistrationNotifications,
  sendLoginNotifications
};