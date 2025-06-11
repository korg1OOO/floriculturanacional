const transactionStatus = {};

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('Webhook request:', {
      headers: req.headers,
      body: JSON.stringify(req.body, null, 2),
    });

    const webhookData = req.body;
    const receivedToken = webhookData.token || req.headers['x-webhook-token'] || req.headers['authorization'];
    const secret = process.env.VENUZPAY_WEBHOOK_SECRET;

    console.log('Token validation:', {
      receivedToken,
      expectedSecret: secret,
      hasSecret: !!secret,
    });

    if (!secret) {
      console.error('VENUZPAY_WEBHOOK_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error: Missing webhook secret' });
    }

    if (!receivedToken || receivedToken !== secret) {
      console.error('Webhook validation failed:', { receivedToken, expected: secret });
      return res.status(401).json({ message: 'Invalid webhook token' });
    }

    const { event, transaction } = webhookData;

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

    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error in webhook handler:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getTransactionStatus = (transactionId) => {
  const status = transactionStatus[transactionId] || { status: 'PENDING', message: 'Transaction not yet processed' };
  console.log(`Retrieved status for ${transactionId}:`, status);
  return status;
};