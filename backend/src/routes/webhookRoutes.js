const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');

const router = express.Router();

// Razorpay Webhook Handler
router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET not configured');
            return res.status(500).json({ status: 'error', message: 'Webhook not configured' });
        }
        
        const signature = req.headers['x-razorpay-signature'];
        
        if (!signature) {
            console.error('No signature in webhook request');
            return res.status(400).json({ status: 'error', message: 'Missing signature' });
        }
        
        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        
        if (signature !== expectedSignature) {
            console.error('Webhook signature verification failed');
            return res.status(400).json({ status: 'error', message: 'Signature verification failed' });
        }
        
        // Parse webhook event
        const event = req.body.event;
        const payload = req.body.payload;
        
        console.log('Webhook event received:', event);
        
        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;
            
            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;
            
            case 'order.paid':
                await handleOrderPaid(payload);
                break;
            
            default:
                console.log('Unhandled webhook event:', event);
        }
        
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Handler for payment.captured event
async function handlePaymentCaptured(payload) {
    try {
        const paymentEntity = payload.payment.entity;
        const userId = paymentEntity.notes?.userId;
        const planId = paymentEntity.notes?.planId;
        
        if (!userId || !planId) {
            console.error('Missing userId or planId in payment notes');
            return;
        }
        
        console.log(`Payment captured for user ${userId}, plan ${planId}`);
        
        // Plan details
        const plans = {
            plus: { name: 'Plus – Pro Learner', duration: 30, level: 1 },
            pro: { name: 'Pro – Interview Master', duration: 30, level: 2 }
        };
        
        const planDetails = plans[planId];
        if (!planDetails) {
            console.error('Invalid plan ID:', planId);
            return;
        }
        
        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + planDetails.duration);
        
        // Update user subscription
        await User.findByIdAndUpdate(userId, {
            'subscription.plan': planId,
            'subscription.status': 'active',
            'subscription.startDate': startDate,
            'subscription.endDate': endDate,
            'subscription.hasHadPaidPlan': true
        });
        
        console.log(`Subscription updated for user ${userId}`);
    } catch (error) {
        console.error('Error handling payment.captured:', error);
    }
}

// Handler for payment.failed event
async function handlePaymentFailed(payload) {
    try {
        const paymentEntity = payload.payment.entity;
        const userId = paymentEntity.notes?.userId;
        
        console.log(`Payment failed for user ${userId}`);
        
        // Log payment failure
        if (userId) {
            await Payment.create({
                userId,
                paymentId: paymentEntity.id,
                orderId: paymentEntity.order_id,
                amount: paymentEntity.amount / 100,
                currency: paymentEntity.currency,
                status: 'failed',
                planId: paymentEntity.notes?.planId,
                planName: paymentEntity.notes?.planName
            });
        }
    } catch (error) {
        console.error('Error handling payment.failed:', error);
    }
}

// Handler for order.paid event
async function handleOrderPaid(payload) {
    try {
        const orderEntity = payload.order.entity;
        console.log(`Order paid: ${orderEntity.id}`);
        // Additional order verification if needed
    } catch (error) {
        console.error('Error handling order.paid:', error);
    }
}

module.exports = router;
