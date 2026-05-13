// Lightweight hook: pull the current mentor's verification status + tier
// + per-component scores. Used by VerificationBanner + TierExplainer.
//
// Kept separate from dashboardHooks.js so that file remains untouched
// (per the spec's hard constraints).

import { useEffect, useState } from 'react';
import supabase from '../../api/supabase';
import { useAuth } from '../../context/useAuth.js';

export function useVerificationStatus() {
  const { user } = useAuth();
  const [state, setState] = useState({
    isLoading: true,
    profileId: null,
    status: 'unverified',
    score: 0,
    tier: 'bronze',
    components: {},
  });

  useEffect(() => {
    if (!user) {
      setState((p) => ({ ...p, isLoading: false }));
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: profile } = await supabase
        .from('mentor_profiles')
        .select('id, verification_status, verification_score, verification_tier, verification_run_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!profile?.id) {
        setState({ isLoading: false, profileId: null, status: 'unverified', score: 0, tier: 'bronze', components: {} });
        return;
      }
      let components = {};
      if (profile.verification_run_id) {
        const { data: run } = await supabase
          .from('mentor_verification_runs')
          .select('components')
          .eq('id', profile.verification_run_id)
          .maybeSingle();
        if (run?.components && typeof run.components === 'object') {
          components = run.components;
        }
      }
      if (cancelled) return;
      setState({
        isLoading: false,
        profileId: profile.id,
        status: profile.verification_status || 'unverified',
        score: profile.verification_score || 0,
        tier: profile.verification_tier || 'bronze',
        components,
      });
    })();

    // Realtime: refresh when the mentor_profile row updates.
    const channel = supabase
      .channel(`mvs:user:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentor_profiles', filter: `user_id=eq.${user.id}` }, () => {
        void (async () => {
          const { data: profile } = await supabase
            .from('mentor_profiles')
            .select('id, verification_status, verification_score, verification_tier, verification_run_id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!profile?.id) return;
          let components = {};
          if (profile.verification_run_id) {
            const { data: run } = await supabase
              .from('mentor_verification_runs')
              .select('components')
              .eq('id', profile.verification_run_id)
              .maybeSingle();
            if (run?.components && typeof run.components === 'object') components = run.components;
          }
          setState({
            isLoading: false,
            profileId: profile.id,
            status: profile.verification_status || 'unverified',
            score: profile.verification_score || 0,
            tier: profile.verification_tier || 'bronze',
            components,
          });
        })();
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user]);

  return state;
}
