import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { LuCreditCard, LuArrowRight, LuCheck } from 'react-icons/lu';
import { UserContext } from '../../Context/userContext';
import { getRemainingLimits, SUBSCRIPTION_LIMITS } from '../../utils/subscriptionFeatures';

const SubscriptionCard = () => {
  const { user } = useContext(UserContext);
  const subscription = user?.subscription || { plan: 'free', status: 'active' };
  const [loading, setLoading] = useState(true);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch sessions count
        const sessionsResponse = await axiosInstance.get('/api/sessions/my-sessions');
        setSessionsCount(sessionsResponse.data.length);

        // Count all pinned questions across all sessions
        let totalPinned = 0;
        sessionsResponse.data.forEach(session => {
          if (session.questions) {
            totalPinned += session.questions.filter(q => q.isPinned).length;
          }
        });
        setPinnedCount(totalPinned);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return null;
  }

  const planDetails = {
    free: {
      name: 'Free Plan',
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      badgeColor: 'bg-gray-100',
    },
    plus: {
      name: 'Plus Plan',
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      badgeColor: 'bg-amber-100',
    },
    pro: {
      name: 'Pro Plan',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100',
    },
  };

  const currentPlan = planDetails[subscription?.plan] || planDetails.free;
  const limits = getRemainingLimits(user, sessionsCount, pinnedCount);

  return (
    <div className={`${currentPlan.bgColor} rounded-xl border-2 ${currentPlan.borderColor} p-6 shadow-sm`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className={`${currentPlan.badgeColor} p-3 rounded-lg`}>
            <LuCreditCard className={`${currentPlan.textColor} text-xl`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Current Subscription</p>
            <p className={`text-lg font-bold ${currentPlan.textColor}`}>
              {currentPlan.name}
            </p>
          </div>
        </div>

        {/* Plan Limits for Free Plan */}
        {subscription?.plan === 'free' && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <LuCheck className="text-gray-500 text-sm" />
              <span className="text-gray-600">
                Sessions: <span className="font-semibold">{sessionsCount}/{SUBSCRIPTION_LIMITS.free.maxSessions}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LuCheck className="text-gray-500 text-sm" />
              <span className="text-gray-600">
                Pinned: <span className="font-semibold">{pinnedCount}/{SUBSCRIPTION_LIMITS.free.maxPinnedQuestions}</span>
              </span>
            </div>
          </div>
        )}

        {/* Pro/Plus indicators */}
        {(subscription?.plan === 'plus' || subscription?.plan === 'pro') && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <LuCheck className={currentPlan.textColor} />
              <span className="text-gray-600 font-semibold">Unlimited Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <LuCheck className={currentPlan.textColor} />
              <span className="text-gray-600 font-semibold">Unlimited Pins</span>
            </div>
          </div>
        )}
      </div>

      {subscription?.endDate && subscription.plan !== 'free' && (
        <div className="mb-4 text-sm text-gray-600">
          <p>
            Expires on{' '}
            <span className="font-semibold">
              {new Date(subscription.endDate).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link
          to="/pricing"
          className="flex items-center gap-2 text-sm font-semibold text-[#e99a4b] hover:text-[#FF9324] transition-colors"
        >
          {subscription?.plan === 'free' ? 'Upgrade Plan' : 'View All Plans'}
          <LuArrowRight className="text-lg" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionCard;
