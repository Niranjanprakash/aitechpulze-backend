// Bank API Integration (Example for ICICI/HDFC/SBI)

const axios = require('axios');

// Check bank account for new transactions
const checkBankTransactions = async () => {
  try {
    // Example API call to bank (requires bank API credentials)
    const response = await axios.get('https://api.bank.com/transactions', {
      headers: {
        'Authorization': `Bearer ${process.env.BANK_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        account_number: process.env.BANK_ACCOUNT_NUMBER,
        from_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Last 10 minutes
        to_date: new Date().toISOString()
      }
    });

    const transactions = response.data.transactions;
    
    // Process each transaction
    for (const txn of transactions) {
      if (txn.type === 'CREDIT' && txn.status === 'SUCCESS') {
        await processPayment(txn.amount, txn.reference_number, txn.sender_name);
      }
    }
  } catch (error) {
    console.error('Bank API error:', error);
  }
};

const processPayment = async (amount, txnId, senderName) => {
  const payment = await Payment.findOne({
    where: {
      amount: amount,
      payment_status: 'PENDING'
    },
    include: [{ model: Project, as: 'project', include: [{ model: User, as: 'user' }] }]
  });

  if (payment) {
    await payment.update({
      payment_status: 'VERIFIED',
      transaction_id: txnId,
      payer_name: senderName,
      verified_at: new Date()
    });

    console.log(`✅ Bank payment verified: ₹${amount} - ${txnId}`);
  }
};

// Run every 2 minutes
setInterval(checkBankTransactions, 2 * 60 * 1000);