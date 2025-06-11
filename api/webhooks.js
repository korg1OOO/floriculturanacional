import { createHmac } from 'crypto';

// In-memory storage for simplicity (use a database in production)
let transactionStatus = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const webhookData = req.body;

  // Validate the webhook token (replace 'YOUR_WEBHOOK_TOKEN' with the token from VenuzPay)
  const receivedToken = webhookData.token;
  const secret = process.env.VENUZPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_TOKEN';
  const payloadString = JSON.stringify(webhookData);
  const computedSignature = createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  // In a real implementation, compare the signature with a header provided by VenuzPay
  // For simplicity, we're checking the token directly
  if (!receivedToken || receivedToken !== secret) {
    return res.status(401).json({ message: 'Invalid webhook token' });
  }

  const { event, transaction } = webhookData;

  // Store transaction status (use a database like MongoDB or Firebase in production)
  if (transaction && transaction.id) {
    transactionStatus[transaction.id] = {
      status: transaction.status,
      identifier: transaction.identifier,
      updatedAt: new Date().toISOString(),
    };
  }

  // Handle specific events
  if (event === 'TRANSACTION_PAID') {
    console.log(`Transaction ${transaction.id} paid successfully.`);
    // You can trigger further actions here, e.g., notify the client via WebSocket or update order status
  } else if (event === 'TRANSACTION_FAILED' || event === 'TRANSACTION_REFUNDED' || event === 'TRANSACTION_CHARGED_BACK') {
    console.log(`Transaction ${transaction.id} failed with status: ${transaction.status}`);
  }

  // Respond with 2xx status to confirm receipt
  res.status(200).json({ message: 'Webhook received' });
}

// API to check transaction status
export async function checkTransactionStatus(transactionId) {
  return transactionStatus[transactionId] || { status: 'UNKNOWN' };
}
