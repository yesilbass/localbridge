import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { isLapsed, subscriptionPlanLabel } from '../utils/subscription';

export function useSubscription() {
  const {
    user,
    userSettings,
    settingsLoading,
    isSubscribed: subscribed,
    isInTrial: inTrial,
    trialDaysRemaining: daysLeft,
    refreshUserSettings,
  } = useAuth();

  const [localSettings, setLocalSettings] = useState(userSettings);

  useEffect(() => {
    setLocalSettings(userSettings);
  }, [userSettings]);

  return {
    loading: Boolean(user) && settingsLoading,
    isActive: subscribed,
    isSubscribed: subscribed,
    isInTrial: inTrial,
    trialDaysRemaining: daysLeft,
    isLapsed: isLapsed(localSettings),
    plan: subscriptionPlanLabel(localSettings),
    settings: localSettings,
    refresh: refreshUserSettings,
  };
}
