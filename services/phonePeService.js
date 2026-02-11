// PhonePe Business API Integration
const crypto = require('crypto');

const phonePeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX,
  apiEndpoint: 'https://api-preprod.phonepe.com/apis/pg-sandbox' // Use production URL for live
};

// Create PhonePe payment
const createPhonePePayment = async (amount, orderId) => {
  const payload = {
    merchantId: phonePeConfig.merchantId,
    merchantTransactionId: orderId,
    merchantUserId: 'USER_' + Date.now(),
    amount: amount * 100, // Amount in paise
    redirectUrl: 'http://localhost:3000/payment-success',
    redirectMode: 'POST',
    callbackUrl: 'http://localhost:5000/api/payments/phonepe-callback',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const string = base64Payload + '/pg/v1/pay' + phonePeConfig.saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + phonePeConfig.saltIndex;

  return {
    request: base64Payload,
    checksum: checksum
  };
};

// Add to .env:
// PHONEPE_MERCHANT_ID=your_merchant_id
// PHONEPE_SALT_KEY=your_salt_key
// PHONEPE_SALT_INDEX=1