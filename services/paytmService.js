// Paytm Business API Integration
const PaytmChecksum = require('paytmchecksum');

const paytmConfig = {
  MID: process.env.PAYTM_MID,
  WEBSITE: process.env.PAYTM_WEBSITE,
  CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
  INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
  KEY: process.env.PAYTM_KEY
};

// Create Paytm order
const createPaytmOrder = async (amount, orderId) => {
  const paytmParams = {
    MID: paytmConfig.MID,
    WEBSITE: paytmConfig.WEBSITE,
    CHANNEL_ID: paytmConfig.CHANNEL_ID,
    INDUSTRY_TYPE_ID: paytmConfig.INDUSTRY_TYPE_ID,
    ORDER_ID: orderId,
    CUST_ID: 'CUST_' + Date.now(),
    TXN_AMOUNT: amount.toString(),
    CALLBACK_URL: 'http://localhost:5000/api/payments/paytm-callback'
  };

  const checksum = await PaytmChecksum.generateSignature(paytmParams, paytmConfig.KEY);
  paytmParams.CHECKSUMHASH = checksum;
  
  return paytmParams;
};

// Add to .env:
// PAYTM_MID=your_merchant_id
// PAYTM_WEBSITE=WEBSTAGING
// PAYTM_CHANNEL_ID=WEB
// PAYTM_INDUSTRY_TYPE=Retail
// PAYTM_KEY=your_merchant_key