// Subscription plan features and limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxSessions: 3,
    maxQuestionsPerSession: 10,
    maxPinnedQuestions: 5,
    canLoadMore: false,
    hasAdvancedExplanations: false,
    hasDetailedStats: false,
    hasUnlimitedNotes: false,
  },
  plus: {
    maxSessions: Infinity,
    maxQuestionsPerSession: Infinity,
    maxPinnedQuestions: Infinity,
    canLoadMore: true,
    hasAdvancedExplanations: true,
    hasDetailedStats: true,
    hasUnlimitedNotes: true,
  },
  pro: {
    maxSessions: Infinity,
    maxQuestionsPerSession: Infinity,
    maxPinnedQuestions: Infinity,
    canLoadMore: true,
    hasAdvancedExplanations: true,
    hasDetailedStats: true,
    hasUnlimitedNotes: true,
    hasMockInterview: false, // coming soon
    hasResumeBasedQuestions: false, // coming soon
    hasCloudSync: false, // coming soon
  },
};

// Check if user can perform an action based on their subscription
export const canPerformAction = (user, action, currentCount = 0) => {
  const plan = user?.subscription?.plan || 'free';
  const limits = SUBSCRIPTION_LIMITS[plan];

  switch (action) {
    case 'createSession':
      return currentCount < limits.maxSessions;
    
    case 'loadMoreQuestions':
      return limits.canLoadMore;
    
    case 'pinQuestion':
      return currentCount < limits.maxPinnedQuestions;
    
    case 'advancedExplanations':
      return limits.hasAdvancedExplanations;
    
    case 'detailedStats':
      return limits.hasDetailedStats;
    
    case 'unlimitedNotes':
      return limits.hasUnlimitedNotes;
    
    default:
      return false;
  }
};

// Get feature message for upgrade prompt
export const getUpgradeMessage = (action, currentPlan = 'free') => {
  const messages = {
    createSession: {
      title: 'Session Limit Reached',
      message: 'You\'ve reached the maximum of 3 sessions on the Free plan. Upgrade to Plus or Pro for unlimited sessions!',
      recommendedPlan: 'plus',
    },
    loadMoreQuestions: {
      title: 'Load More Questions',
      message: 'Loading more questions is a premium feature. Upgrade to Plus or Pro to generate unlimited questions!',
      recommendedPlan: 'plus',
    },
    pinQuestion: {
      title: 'Pin Limit Reached',
      message: 'You\'ve reached the maximum of 5 pinned questions on the Free plan. Upgrade to Plus or Pro for unlimited pinned questions!',
      recommendedPlan: 'plus',
    },
    advancedExplanations: {
      title: 'Advanced Explanations',
      message: 'Advanced AI explanations & hints are available on Plus and Pro plans. Upgrade to unlock detailed insights!',
      recommendedPlan: 'plus',
    },
  };

  return messages[action] || {
    title: 'Premium Feature',
    message: 'This feature is available on premium plans. Upgrade to unlock!',
    recommendedPlan: 'plus',
  };
};

// Get user's remaining limits
export const getRemainingLimits = (user, sessionsCount, pinnedQuestionsCount) => {
  const plan = user?.subscription?.plan || 'free';
  const limits = SUBSCRIPTION_LIMITS[plan];

  return {
    sessions: limits.maxSessions === Infinity ? '∞' : limits.maxSessions - sessionsCount,
    pinnedQuestions: limits.maxPinnedQuestions === Infinity ? '∞' : limits.maxPinnedQuestions - pinnedQuestionsCount,
    plan,
  };
};
