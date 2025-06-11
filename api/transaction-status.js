const { getTransactionStatus } = require('./webhooks');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      console.error('Invalid method:', req.method);
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;
    if (!id) {
      console.error('Transaction ID missing in request');
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    console.log(`Fetching status for transaction ID: ${id}`);
    const status = getTransactionStatus(id);
    return res.status(200).json(status);
  } catch (error) {
    console.error('Error in transaction-status:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};