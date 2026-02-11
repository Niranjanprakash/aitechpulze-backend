const axios = require('axios');

const sendWhatsApp = async (phoneNumber, message) => {
  try {
    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!whatsappToken || !phoneNumberId) {
      console.log('WhatsApp credentials not configured, skipping WhatsApp message');
      return { success: false, message: 'WhatsApp not configured' };
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = phoneNumber.replace(/[^\d]/g, '');

    const response = await axios.post(
      `${apiUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp message sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('WhatsApp send error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsApp };