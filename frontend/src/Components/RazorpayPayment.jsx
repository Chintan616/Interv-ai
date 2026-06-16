import React, { useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { UserContext } from '../Context/userContext';
import toast from 'react-hot-toast';

const RazorpayPayment = ({ planId, planName, amount, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useContext(UserContext);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      // If user is not logged in, show login message
      if (!user) {
        const errorMsg = 'Please login to continue';
        toast.error(errorMsg);
        onPaymentError && onPaymentError(errorMsg);
        return;
      }

      setLoading(true);

      // Step 1: Create order
      const { data } = await axiosInstance.post(API_PATHS.PAYMENT.CREATE_ORDER, { planId });

      if (!data.success) {
        // Check if it's a downgrade restriction error
        if (data.message && data.message.includes('Cannot downgrade to free plan')) {
          toast.error('Cannot return to free plan after upgrading. Contact support for assistance.');
        } else {
          toast.error(data.message || 'Failed to create order');
        }
        throw new Error(data.message || 'Failed to create order');
      }

      const { order, key } = data;

      // For free plan, no Razorpay needed
      if (planId === 'free') {
        toast.success('Free plan activated successfully!');
        if (data.user) {
          updateUser(data.user);
        }
        onPaymentSuccess && onPaymentSuccess(data);
        setLoading(false);
        return;
      }

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      // Step 3: Initialize Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Interv.ai',
        description: `Subscription: ${planName}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            setLoading(true);
            toast.loading('Verifying payment...');
            
            // Step 4: Verify payment
            const verifyResponse = await axiosInstance.post(API_PATHS.PAYMENT.VERIFY, {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
            });

            toast.dismiss();

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Subscription activated.');
              
              // Update user context
              if (verifyResponse.data.user) {
                updateUser(verifyResponse.data.user);
              }
              
              onPaymentSuccess && onPaymentSuccess(verifyResponse.data);
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.dismiss();
            console.error('Payment verification error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Payment verification failed';
            toast.error(errorMsg);
            onPaymentError && onPaymentError(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
            console.log('Payment modal closed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: '',
        },
        theme: {
          color: '#e99a4b',
        },
      };

      // Open real Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Payment failed';
      toast.error(errorMsg);
      onPaymentError && onPaymentError(errorMsg);
      setLoading(false);
    }
  };

  // Free plan doesn't need payment
  if (planId === 'free') {
    return (
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:border-[#e99a4b] hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Get Started'}
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full text-sm font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
        planId === 'plus'
          ? 'bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white hover:opacity-90 shadow-lg'
          : planId === 'pro'
          ? 'bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white hover:opacity-90 shadow-lg border-2 border-transparent'
          : 'bg-white text-black border-2 border-gray-300 hover:border-[#e99a4b] hover:bg-amber-50'
      }`}
    >
      {loading ? 'Processing...' : `Get Started - ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;
