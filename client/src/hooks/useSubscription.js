import { useEffect, useState } from 'react';
import supabase from '../api/supabase';
import { useAuth } from '../context/useAuth';
import { isActiveSubscription, subscriptionPlanLabel } from '../utils/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: Boolean(user),
    isActive: false,
    plan: null,
    settings: null,
  });

  useEffect(() => {
    if (!user) {
      setState({ loading: false, isActive: false, plan: null, settings: null });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));

    supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        const settings = error ? null : (data?.settings ?? null);
        setState({
          loading: false,
          isActive: isActiveSubscription(settings),
          plan: subscriptionPlanLabel(settings),
          settings,
        });
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  return state;
}
