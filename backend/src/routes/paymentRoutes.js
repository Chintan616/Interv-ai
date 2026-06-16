const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { validatePaymentRequest, verifyRazorpaySignature } = require('../middlewares/paymentSecurity');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscriptionStatus,
} = require('../controllers/paymentController');

const router = express.Router();

// Create payment order (with payment validation)
router.post('/create-order', protect, validatePaymentRequest, createOrder);

// Verify payment (with signature verification)
router.post('/verify-payment', protect, verifyRazorpaySignature, verifyPayment);

// Get payment history
router.get('/history', protect, getPaymentHistory);

// Get subscription status
router.get('/subscription-status', protect, getSubscriptionStatus);

module.exports = router;
