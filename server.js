const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.post('/proxy/payments', async (req, res) => {
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
            timeout: 10000 // 10s timeout
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
            data: error.response?.data,
            request: {
                url: error.config?.url,
                headers: error.config?.headers,
                data: error.config?.data
            }
        });
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message,
            details: error.response?.data?.details
        });
    }
});

app.post('/callback', (req, res) => {
    console.log('Payment callback received:', JSON.stringify(req.body, null, 2));
    res.status(200).send('Callback received');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));