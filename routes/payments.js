const express = require('express');
const { Project, Payment, User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { sendPaymentRequestNotifications, sendPaymentSuccessNotifications, sendPaymentFailedNotifications } = require('../utils/notifications');
const { logActivity } = require('../utils/logger');

const router = express.Router();

// Send UPI payment request via WhatsApp and Email
router.post('/send-upi-request', auth, async (req, res) => {
  try {
    const { amount, client_phone, project_id } = req.body;
    
    const project = await Project.findOne({ 
      where: { id: project_id, user_id: req.user.id } 
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Create payment record
    const paymentId = 'PAY' + Date.now().toString().slice(-8);
    await Payment.create({
      payment_id: paymentId,
      project_id: project.id,
      user_id: req.user.id,
      amount: amount,
      payment_method: 'UPI_REQUEST',
      payment_status: 'PENDING'
    });

    // Generate UPI payment request link
    const upiLink = `upi://pay?pa=${process.env.UPI_ID}&pn=${encodeURIComponent(process.env.BUSINESS_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment for ${project.project_id}`)}`;
    
    // Send payment request notifications
    const notifications = await sendPaymentRequestNotifications(req.user, project, amount, paymentId, upiLink);

    res.json({ 
      success: true, 
      message: 'Payment request sent via WhatsApp, SMS, and Email',
      data: { paymentId, upiLink, notifications }
    });
  } catch (error) {
    console.error('UPI request error:', error);
    res.status(500).json({ success: false, message: 'Failed to send payment request' });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { project_id, amount, payment_method, status, transaction_id } = req.body;
    
    let project;
    if (isNaN(project_id)) {
      project = await Project.findOne({ 
        where: { project_id: project_id, user_id: req.user.id } 
      });
    } else {
      project = await Project.findOne({ 
        where: { id: project_id, user_id: req.user.id } 
      });
    }
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const paymentId = 'PAY' + Date.now().toString().slice(-8);
    
    const payment = await Payment.create({
      payment_id: paymentId,
      project_id: project.id,
      user_id: req.user.id,
      amount: amount,
      payment_method: payment_method || 'UPI',
      transaction_id: transaction_id,
      payment_status: status || 'PENDING'
    });

    await logActivity(req.user.id, 'PAYMENT_INITIATED', `Payment ${paymentId} initiated for project ${project.project_id}`, req.ip);
    
    res.status(201).json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: { paymentId }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed', error: error.message });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { project_id, amount, payment_method, status, transaction_id, notes } = req.body;
    
    // Handle both numeric ID and project_id string
    let project;
    if (isNaN(project_id)) {
      // If project_id is a string like "ATP12345678"
      project = await Project.findOne({ 
        where: { project_id: project_id, user_id: req.user.id } 
      });
    } else {
      // If project_id is a numeric ID
      project = await Project.findOne({ 
        where: { id: project_id, user_id: req.user.id } 
      });
    }
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const paymentId = 'PAY' + Date.now().toString().slice(-8);
    
    const payment = await Payment.create({
      payment_id: paymentId,
      project_id: project.id, // Always use the numeric ID
      user_id: req.user.id,
      amount: amount,
      payment_method: payment_method || 'UPI',
      transaction_id: transaction_id,
      payment_status: status || 'PENDING'
    });

    await logActivity(req.user.id, 'PAYMENT_INITIATED', `Payment ${paymentId} initiated for project ${project.project_id}`, req.ip);
    await sendEmail('admin@aitechpulze.com', 'New Payment Received', `Payment of ₹${amount} received for project ${project.project_id} by ${req.user.name}. Payment ID: ${paymentId}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: { paymentId }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed', error: error.message });
  }
});

router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['project_id', 'title']
      }],
      order: [['payment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        recent_payments: payments.map(p => ({
          ...p.toJSON(),
          project: { title: p.project?.title },
          status: p.payment_status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

router.put('/admin/verify/:paymentId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    await db.execute('UPDATE payments SET payment_status = ?, verified_at = NOW(), verified_by = ? WHERE payment_id = ?', [status, req.admin.id, req.params.paymentId]);
    
    // Get payment details for notification
    const [payments] = await db.execute(`
      SELECT p.*, pr.project_id, u.name as user_name, u.email as user_email
      FROM payments p
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.payment_id = ?
    `, [req.params.paymentId]);

    if (payments.length > 0) {
      const payment = payments[0];
      await sendEmail(payment.user_email, `Payment ${status}`, `Your payment of ₹${payment.amount} for project ${payment.project_id} has been ${status.toLowerCase()}.`);
    }

    // Log activity
    await logActivity(null, req.admin.id, 'PAYMENT_VERIFIED', `Payment ${req.params.paymentId} ${status}`, req.ip);
    
    res.json({ message: `Payment ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Manual payment verification (for admin)
router.post('/verify-manual', adminAuth, async (req, res) => {
  try {
    const { amount, transaction_id, payer_name, status = 'VERIFIED' } = req.body;
    
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
        payment_status: status,
        transaction_id: transaction_id,
        payer_name: payer_name,
        verified_at: new Date()
      });

      // Send success or failed notifications
      if (status === 'VERIFIED') {
        await sendPaymentSuccessNotifications(payment.project.user, payment, payment.project);
      } else {
        await sendPaymentFailedNotifications(payment.project.user, payment, payment.project);
      }

      res.json({ success: true, message: `Payment ${status.toLowerCase()} successfully` });
    } else {
      res.status(404).json({ success: false, message: 'No matching payment found' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Check payment status endpoint
router.get('/check-status/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { payment_id: req.params.paymentId, user_id: req.user.id }
    });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({
      success: true,
      data: {
        status: payment.payment_status,
        amount: payment.amount,
        transaction_id: payment.transaction_id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});
module.exports = router;