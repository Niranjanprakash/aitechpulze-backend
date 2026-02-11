const express = require('express');
const { sendWhatsApp } = require('../utils/whatsapp');
const router = express.Router();

// WhatsApp webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// WhatsApp webhook for incoming messages
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach(entry => {
        entry.changes?.forEach(change => {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            
            messages?.forEach(async (message) => {
              const from = message.from;
              const messageBody = message.text?.body || message.type;
              const senderName = change.value.contacts?.[0]?.profile?.name || from;
              
              // Forward client message to admin WhatsApp
              const adminMessage = `📱 New WhatsApp Message

From: ${senderName}
Phone: +${from}
Message: ${messageBody}

Time: ${new Date().toLocaleString()}`;

              await sendWhatsApp(process.env.ADMIN_WHATSAPP, adminMessage);
              
              console.log(`WhatsApp message forwarded to admin: ${from} -> ${process.env.ADMIN_WHATSAPP}`);
            });
          }
        });
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;