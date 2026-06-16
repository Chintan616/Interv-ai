const crypto = require('crypto');

// Rate limiting for payment endpoints
const paymentRateLimit = new Map();

const validatePaymentRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = Date.now();
        
        // Rate limiting: Max 5 payment attempts per hour per user
        const userAttempts = paymentRateLimit.get(userId) || [];
        const recentAttempts = userAttempts.filter(time => now - time < 3600000);
        
        if (recentAttempts.length >= 5) {
            return res.status(429).json({ 
                message: 'Too many payment attempts. Please try again later.' 
            });
        }
        
        recentAttempts.push(now);
        paymentRateLimit.set(userId, recentAttempts);
        
        // Validate amount (prevent tampering)
        const { planId } = req.body;
        const validAmounts = {
            'plus': 29900, // ₹299 in paise
            'pro': 59900   // ₹599 in paise
        };
        
        if (!validAmounts[planId]) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }
        
        req.validAmount = validAmounts[planId];
        next();
    } catch (error) {
        console.error('Payment validation error:', error);
        return res.status(500).json({ message: 'Payment validation failed' });
    }
};

// Signature verification middleware
const verifyRazorpaySignature = (req, res, next) => {
    try {
        const { orderId, paymentId, signature } = req.body;
        
        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ message: 'Missing payment verification data' });
        }
        
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        if (expectedSignature !== signature) {
            console.error('Signature verification failed');
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        
        next();
    } catch (error) {
        console.error('Signature verification error:', error);
        return res.status(500).json({ message: 'Signature verification failed' });
    }
};

module.exports = { validatePaymentRequest, verifyRazorpaySignature };
