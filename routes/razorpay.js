// Install: npm install razorpay

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
});

// Razorpay webhook for automatic payment detection
router.post('/razorpay-webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
      const { amount, order_id, id: payment_id } = payload.payment.entity;
      
      // Find matching pending payment
      const payment = await Payment.findOne({
        where: {
          amount: amount / 100, // Convert from paise to rupees
          payment_status: 'PENDING'
        },
        include: [{ model: Project, as: 'project', include: [{ model: User, as: 'user' }] }]
      });

      if (payment) {
        await payment.update({
          payment_status: 'VERIFIED',
          transaction_id: payment_id,
          verified_at: new Date()
        });

        console.log(`✅ Razorpay payment verified: ₹${amount/100}`);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});