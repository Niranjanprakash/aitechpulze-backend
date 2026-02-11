const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || 
        process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
      console.log('SMS credentials not configured, skipping SMS');
      return { success: false, message: 'SMS not configured' };
    }

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };