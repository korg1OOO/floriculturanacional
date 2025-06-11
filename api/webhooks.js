// In-memory storage for transaction statuses (cleared on server restart)
const transactionStatus = {};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const webhookData = req.body;

  // Validate the webhook token
  const receivedToken = webhookData.token;
  const secret = process.env.VENUZPAY_WEBHOOK_SECRET; // Set in Vercel environment variables
  if (!receivedToken || receivedToken !== secret) {
    console.error('Invalid webhook token:', receivedToken);
    return res.status(401).json({ message: 'Invalid webhook token' });
  }

  const { event, transaction } = webhookData;

  // Store transaction status
  if (transaction && transaction.id) {
    transactionStatus[transaction.id] = {
      status: transaction.status,
      identifier: transaction.identifier,
      updatedAt: new Date().toISOString(),
    };
    console.log(`Webhook processed: ${event} for transaction ${transaction.id} with status ${transaction.status}`);
  } else {
    console.error('Invalid webhook payload: missing transaction data');
    return res.status(400).json({ message: 'Invalid webhook payload' });
  }

  // Respond with 2xx status to confirm receipt
  res.status(200).json({ message: 'Webhook received' });
};

// Function to get transaction status (exported for use in other endpoints)
exports.getTransactionStatus = (transactionId) => {
  return transactionStatus[transactionId] || { status: 'UNKNOWN' };
};
