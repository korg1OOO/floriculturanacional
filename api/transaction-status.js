const { getTransactionStatus } = require('./webhooks');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;
  if (!id) {
    console.error('Transaction ID missing in request');
    return res.status(400).json({ message: 'Transaction ID is required' });
  }

  const status = getTransactionStatus(id);
  res.status(200).json(status);
};