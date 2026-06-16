import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../Components/Layouts/DashboardLayout';
import Navbar from '../Components/Layouts/Navbar';
import Modal from '../Components/Modal';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import RazorpayPayment from '../Components/RazorpayPayment';
import axiosInstance from '../utils/axiosInstance';
import { UserContext } from '../Context/userContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(!user);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState('login');

  // Fetch current subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoadingStatus(true);
        if (user) {
          const response = await axiosInstance.get('/api/payments/subscription-status');
          setSubscriptionStatus(response.data.subscription);
        } else {
          // Default to free plan if not logged in
          setSubscriptionStatus({ plan: 'free', status: 'active' });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscriptionStatus({ plan: 'free', status: 'active' });
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  // Close auth modal when user logs in
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      toast.success('Welcome back! You can now explore our premium plans.');
    }
  }, [user]);

  const handlePaymentSuccess = (data) => {
    setSubscriptionStatus(data.user.subscription);
    updateUser(data.user);
    toast.success('🎉 Subscription activated successfully!');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handlePaymentError = (error) => {
    if (error === 'Please login to continue') {
      setShowAuthModal(true);
    } else {
      toast.error(`Payment failed: ${error}`);
    }
  };

  const handleLoginClick = () => {
    navigate('/');
  };

  const plans = [
    {
      id: 'free',
      name: 'Free – Starter',
      price: '$0',
      period: '/month',
      description: 'Perfect for beginners exploring AI interview prep',
      features: [
        '3 AI-generated interview sessions.',
        'Basic question generation (10 questions/session)',
        'Basic progress tracking',
        'Pin up to 5 questions',
      ],
      highlight: false,
      tagline: 'Great for students trying out Interv.ai for the first time.',
    },
    {
      id: 'plus',
      name: 'Plus – Pro Learner',
      price: '$2.99',
      period: '/month',
      description: 'Best for active learners preparing for upcoming interviews',
      features: [
        
        ' Unlimited interview sessions',
        ' Advanced AI explanations & hints',
        ' Detailed progress stats',
        ' Unlimited notes and pinned questions',
        ' Priority email support',
      ],
      highlight: true,
      tagline: 'Ideal for job seekers preparing regularly.',
    },
    {
      id: 'pro',
      name: 'Pro – Interview Master',
      price: '$5.99',
      period: '/month',
      description: 'For serious candidates preparing for top company interviews',
      features: [
        'Everything of Plus',
        'AI mock interview mode (coming soon)',
        'Resume-based question generation (coming soon)',
        'Cloud sync & data export (Coming Soon)',
        'Priority support with faster response times',
      ],
      highlight: false,
      tagline: 'For professionals aiming to crack high-level interviews.',
    },
  ];

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#FFFCEF]">
        {user ? <DashboardLayout /> : <Navbar />}
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e99a4b]"></div>
            <p className="mt-4 text-gray-600">Loading subscription info...</p>
          </div>
        </div>
      </div>
    );
  }

  const pricingContent = (
    <div className="w-full min-h-screen bg-[#FFFCEF] py-12 px-4 md:px-20">
      <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Upgrade your interview prep with our flexible pricing plans
            </p>

            {/* Current Subscription Status */}
            {subscriptionStatus && (
              <div className="inline-block bg-white border-2 border-[#e99a4b] rounded-lg px-6 py-3 mb-8">
                <p className="text-gray-700">
                  <span className="font-semibold">Current Plan:</span>{' '}
                  <span className="text-[#e99a4b] font-bold capitalize">
                    {subscriptionStatus.plan}
                  </span>
                  {subscriptionStatus.endDate && (
                    <span className="text-gray-600 ml-2">
                      (Expires: {new Date(subscriptionStatus.endDate).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {plans.map((plan) => {
              const isCurrentPlan = subscriptionStatus?.plan === plan.id;
              const currentPlan = subscriptionStatus?.plan || 'free';
              
              // Define plan hierarchy: free < plus < pro
              const planHierarchy = { free: 0, plus: 1, pro: 2 };
              const currentPlanLevel = planHierarchy[currentPlan];
              const targetPlanLevel = planHierarchy[plan.id];
              
              // Disable downgrade: cannot select a plan lower than current plan
              const isDowngrade = targetPlanLevel < currentPlanLevel;
              const isDisabled = isDowngrade || isCurrentPlan;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300 relative ${
                    plan.highlight
                      ? 'border-2 border-[#e99a4b] md:scale-105'
                      : 'border border-amber-100 hover:border-[#e99a4b]'
                  } ${isDowngrade ? 'opacity-60' : ''}`}
                >
                  {/* Badge for current plan */}
                  {isCurrentPlan && (
                    <div className="mb-4 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </div>
                  )}

                  {/* Badge for downgrade not allowed */}
                  {isDowngrade && !isCurrentPlan && (
                    <div className="mb-4 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Downgrade Not Allowed
                    </div>
                  )}

                  {/* Badge for most popular */}
                  {plan.highlight && !isCurrentPlan && !isDowngrade && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#e99a4b] text-white text-xs font-semibold px-4 py-1 rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-black">
                        {plan.price}
                      </span>
                      <span className="text-sm text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {plan.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="mb-6">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-green-100 text-green-700 text-sm font-semibold px-6 py-2.5 rounded-lg cursor-default"
                      >
                        ✓ Current Plan
                      </button>
                    ) : isDowngrade ? (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 text-sm font-semibold px-6 py-2.5 rounded-lg cursor-not-allowed"
                        title={
                          plan.id === 'free' 
                            ? "Cannot downgrade to free plan after using a paid plan"
                            : "Cannot downgrade from Pro to Plus"
                        }
                      >
                        🔒 Cannot Downgrade
                      </button>
                    ) : (
                      <RazorpayPayment
                        planId={plan.id}
                        planName={plan.name}
                        amount={plan.price === '$0' ? 0 : plan.price.replace('$', '')}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-[#e99a4b] mt-0.5 font-bold">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tagline */}
                  <div className="pt-6 border-t border-amber-100">
                    {isDowngrade ? (
                      <p className="text-xs text-red-600 text-center font-medium">
                        🔒 {plan.id === 'free' 
                          ? 'Once upgraded, you cannot return to the free tier.' 
                          : 'You cannot downgrade from Pro to Plus.'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 text-center">
                        {plan.tagline}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-amber-100">
            <h2 className="text-2xl font-bold text-black mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Can I upgrade or downgrade my plan anytime?
                </h3>
                <p className="text-gray-600">
                  You can upgrade your plan at any time (Free → Plus → Pro). However, downgrades are not allowed. Once you upgrade to a paid plan, you cannot return to Free. Pro users cannot downgrade to Plus. This policy ensures data integrity and service quality.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Why can't I downgrade my plan?
                </h3>
                <p className="text-gray-600">
                  Downgrades are restricted to maintain service quality and data integrity. When you upgrade, your account gains access to premium features and data structures that cannot be reversed. This ensures you always have access to your work. If you need to cancel, contact our support team for assistance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600">
                  Yes! Start with our Free plan to explore Interv.ai. No credit card required.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major payment methods through Razorpay including credit cards, debit cards, net banking, UPI, and digital wallets.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Can I get a refund?
                </h3>
                <p className="text-gray-600">
                  If you're not satisfied with your subscription, contact us within 7 days for a full refund.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  What happens after my subscription ends?
                </h3>
                <p className="text-gray-600">
                  When your paid subscription expires, your account will remain active with the last paid plan features restricted. You won't lose your data. Contact support to renew or for assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Have questions about our plans?
            </p>
            <button
              onClick={() => window.open('mailto:chintan@gmail.com')}
              className="bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white text-sm font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
  );

  return user ? (
    <>
      <DashboardLayout>
        {pricingContent}
      </DashboardLayout>
      {showAuthModal && (
        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
          {authPage === 'login' ? (
            <>
              <Login setCurrentPage={setAuthPage} skipRedirect={true} />
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthPage('signup')}
                  className="text-[#e99a4b] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <SignUp setCurrentPage={setAuthPage} skipRedirect={true} />
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthPage('login')}
                  className="text-[#e99a4b] font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </Modal>
      )}
    </>
  ) : (
    <div className="min-h-screen bg-[#FFFCEF]">
      <Navbar />
      <div className="pt-20">
        {pricingContent}
      </div>
      {showAuthModal && (
        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
          {authPage === 'login' ? (
            <>
              <Login setCurrentPage={setAuthPage} skipRedirect={true} />
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthPage('signup')}
                  className="text-[#e99a4b] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <SignUp setCurrentPage={setAuthPage} skipRedirect={true} />
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthPage('login')}
                  className="text-[#e99a4b] font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Pricing;
