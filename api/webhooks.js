const transactionStatus = {};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const webhookData = req.body;
  console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

  // Validate the webhook token
  const receivedToken = webhookData.token;
  const secret = process.env.VENUZPAY_WEBHOOK_SECRET;
  if (!receivedToken || receivedToken !== secret) {
    console.error('Webhook validation failed:', { receivedToken, expected: secret });
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
    console.log(`Stored transaction ${transaction.id}: ${transaction.status}`);
  } else {
    console.error('Invalid webhook payload: missing transaction data', webhookData);
    return res.status(400).json({ message: 'Invalid webhook payload' });
  }

  res.status(200).json({ message: 'Webhook received' });
};

exports.getTransactionStatus = (transactionId) => {
  const status = transactionStatus[transactionId] || { status: 'PENDING', message: 'Transaction not yet processed' };
  console.log(`Retrieved status for ${transactionId}:`, status);
  return status;
};