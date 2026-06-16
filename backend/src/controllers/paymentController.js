const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Verify Razorpay credentials are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: Razorpay credentials not set in environment variables');
}

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    
    // Use validated amount from middleware if available
    const validatedAmount = req.validAmount;

    // Define plan details
    const plans = {
      free: { amount: 0, name: 'Free – Starter', currency: 'INR', level: 0 },
      plus: { amount: 29900, name: 'Plus – Pro Learner', currency: 'INR', level: 1 }, // ₹299
      pro: { amount: 59900, name: 'Pro – Interview Master', currency: 'INR', level: 2 }, // ₹599
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Get user's current plan
    const user = await User.findById(userId);
    const currentPlan = plans[user.subscription.plan] || plans.free;
    
    // Prevent downgrades: cannot select a plan with lower level than current plan
    if (plan.level < currentPlan.level) {
      let message = '';
      if (planId === 'free') {
        message = '🔒 Cannot downgrade to free plan. Once you upgrade to a paid plan, you cannot return to the free tier.';
      } else if (planId === 'plus' && user.subscription.plan === 'pro') {
        message = '🔒 Cannot downgrade from Pro to Plus. You can only upgrade your plan.';
      } else {
        message = '🔒 Cannot downgrade your plan. You can only upgrade to a higher tier.';
      }
      
      return res.status(403).json({
        success: false,
        message: message + ' Please contact support if you need assistance.',
      });
    }

    // If free plan, directly upgrade user
    if (planId === 'free') {
      // This code should never be reached due to downgrade check above
      // But keeping it as a safety check
      if (user.subscription.hasHadPaidPlan || user.subscription.plan === 'plus' || user.subscription.plan === 'pro') {
        return res.status(403).json({
          success: false,
          message: '🔒 Cannot downgrade to free plan. Once you upgrade to a paid plan (Plus or Pro), you cannot return to the free tier. Please contact support if you need assistance.',
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          'subscription.plan': 'free',
          'subscription.status': 'active',
          'subscription.startDate': new Date(),
          'subscription.endDate': null,
        },
        { new: true }
      );

      // Create payment record
      await Payment.create({
        userId,
        planId,
        amount: 0,
        currency: 'INR',
        orderId: null,
        paymentId: null,
        status: 'completed',
        planName: plan.name,
      });

      return res.status(200).json({
        message: 'Free plan activated successfully',
        user: updatedUser,
        success: true,
      });
    }

    // For paid plans, create Razorpay order
    const options = {
      amount: validatedAmount || plan.amount, // Use validated amount from middleware
      currency: plan.currency,
      receipt: `rcpt_${Date.now()}`, // Keep it short (max 40 chars)
      notes: {
        userId: userId.toString(),
        planId: planId,
        planName: plan.name,
        email: req.user.email || 'no-email'
      },
    };

    let order;
    try {
      console.log('Creating Razorpay order with options:', options);
      console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'NOT SET');
      
      // Create real Razorpay order
      order = await razorpay.orders.create(options);
      console.log('Order created successfully:', order.id);
    } catch (razorpayError) {
      console.error('Razorpay API Error:', {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        description: razorpayError.description,
        source: razorpayError.source,
        reason: razorpayError.reason,
        metadata: razorpayError.metadata,
        error: razorpayError.error,
        fullError: JSON.stringify(razorpayError, null, 2)
      });
      
      // Return user-friendly error message
      return res.status(razorpayError.statusCode || 500).json({
        success: false,
        message: razorpayError.error?.description || razorpayError.message || 'Failed to create payment order',
        error: razorpayError.error?.code || 'RAZORPAY_ERROR',
      });
    }

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      amount: plan.amount,
    });
  } catch (error) {
    console.error('Error creating order:', {
      message: error.message,
      status: error.statusCode,
      response: error.response,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
      details: error.response?.body || 'No response body',
    });
  }
};

// Verify payment and update subscription
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId } = req.body;
    const userId = req.user._id;

    // Signature verification is handled by middleware
    // Additional validation: Fetch payment details from Razorpay
    let payment;
    try {
      payment = await razorpay.payments.fetch(paymentId);
    } catch (fetchError) {
      console.error('Error fetching payment from Razorpay:', fetchError);
      return res.status(400).json({
        success: false,
        message: 'Unable to verify payment with Razorpay',
      });
    }

    // Verify payment status
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured',
        status: payment.status
      });
    }

    // Define plan details
    const plans = {
      plus: { name: 'Plus – Pro Learner', duration: 30, amount: 29900, level: 1 }, // 30 days, ₹299
      pro: { name: 'Pro – Interview Master', duration: 30, amount: 59900, level: 2 }, // 30 days, ₹599
    };

    const planDetails = plans[planId];
    if (!planDetails) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    
    // Verify payment amount matches plan
    if (payment.amount !== planDetails.amount) {
      console.error('Amount mismatch:', { received: payment.amount, expected: planDetails.amount });
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match plan price',
      });
    }
    
    // Verify user can upgrade to this plan (no downgrades allowed)
    const currentUser = await User.findById(userId);
    const currentPlanLevel = plans[currentUser.subscription.plan]?.level || 0;
    
    if (planDetails.level < currentPlanLevel) {
      return res.status(403).json({
        success: false,
        message: '🔒 Cannot downgrade your plan. Please contact support if you need assistance.',
      });
    }

    // Calculate end date (30 days from now)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planDetails.duration);

    // Update user subscription
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'subscription.plan': planId,
        'subscription.status': 'active',
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.hasHadPaidPlan': true, // Mark that user has had a paid plan
      },
      { new: true }
    );

    // Create payment record
    const paymentAmount = payment.amount / 100; // Convert paise to rupees
    await Payment.create({
      userId,
      planId,
      amount: paymentAmount,
      currency: payment.currency,
      orderId,
      paymentId,
      signature,
      status: 'completed',
      planName: planDetails.name,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      user,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// Get user's payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

// Get subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('subscription');

    if (!user || !user.subscription) {
      return res.status(200).json({
        success: true,
        subscription: {
          plan: 'free',
          status: 'active',
          hasHadPaidPlan: false,
        },
      });
    }

    // Ensure hasHadPaidPlan is always returned
    const subscription = {
      plan: user.subscription.plan,
      status: user.subscription.status,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      hasHadPaidPlan: user.subscription.hasHadPaidPlan || false,
    };

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscriptionStatus,
};
