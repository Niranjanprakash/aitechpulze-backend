// Manual Payment Verification System

// Add to backend routes/payments.js
router.post('/manual-verify', adminAuth, async (req, res) => {
  try {
    const { amount, transaction_id, payer_name } = req.body;
    
    // Find matching pending payment
    const payment = await Payment.findOne({
      where: {
        amount: amount,
        payment_status: 'PENDING'
      },
      include: [{ model: Project, as: 'project', include: [{ model: User, as: 'user' }] }],
      order: [['created_at', 'DESC']]
    });

    if (payment) {
      await payment.update({
        payment_status: 'VERIFIED',
        transaction_id: transaction_id,
        payer_name: payer_name,
        verified_at: new Date()
      });

      // Send confirmation email
      await sendEmail(
        payment.project.user.email,
        'Payment Confirmed!',
        `Your payment of ₹${amount} has been verified. Transaction ID: ${transaction_id}`
      );

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(404).json({ success: false, message: 'No matching payment found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Get pending payments for admin
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { payment_status: 'PENDING' },
      include: [{ model: Project, as: 'project', include: [{ model: User, as: 'user' }] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});