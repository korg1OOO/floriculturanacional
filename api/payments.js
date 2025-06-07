const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Ensure amounts are in reais (2 decimal places)
        if (req.body.amount) req.body.amount = Number(req.body.amount.toFixed(2));
        if (req.body.products && req.body.products.length) {
            req.body.products.forEach(product => {
                if (product.price) product.price = Number(product.price.toFixed(2));
            });
        }

        console.log('Sending to VenuxPay:', JSON.stringify(req.body, null, 2));
        const response = await axios.post('https://app.venuzpay.com/api/v1/gateway/pix/receive', req.body, {
            headers: {
                'x-public-key': process.env.VENUZPAY_PUBLIC_KEY,
                'x-secret-key': process.env.VENUZPAY_SECRET_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        console.log('VenuxPay response:', {
            status: response.status,
            data: response.data
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('VenuxPay Error:', {
            status: error.response?.status,
            message: error.message,
            headers: error.response?.headers,
            data: error.response?.data
        });
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message,
            details: error.response?.data?.details
        });
    }
};