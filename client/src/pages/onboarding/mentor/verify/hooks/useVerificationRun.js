// Single hook backing the verification wizard. Owns the run + steps + refs
// state, subscribes to realtime row changes, and exposes a refetch().

import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '../../../../../api/supabase';
import { fetchActiveRun } from '../../../../../api/verification';

export function useVerificationRun(mentorProfileId) {
  const [state, setState] = useState({ run: null, steps: [], references: [], isLoading: true, error: null });
  const versionRef = useRef(0);

  const load = useCallback(async () => {
    if (!mentorProfileId) {
      setState({ run: null, steps: [], references: [], isLoading: false, error: null });
      return;
    }
    const v = ++versionRef.current;
    try {
      const { run, steps, references } = await fetchActiveRun(mentorProfileId);
      if (v === versionRef.current) setState({ run, steps, references, isLoading: false, error: null });
    } catch (err) {
      if (v === versionRef.current) setState((p) => ({ ...p, isLoading: false, error: err?.message || 'Could not load verification run' }));
    }
  }, [mentorProfileId]);

  useEffect(() => { load(); }, [load]);

  // Realtime: any change to runs/steps/references for this mentor reloads.
  useEffect(() => {
    if (!mentorProfileId) return undefined;
    const channel = supabase
      .channel(`mvr:${mentorProfileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_verification_runs', filter: `mentor_profile_id=eq.${mentorProfileId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_verification_steps' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_references', filter: `mentor_profile_id=eq.${mentorProfileId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mentorProfileId, load]);

  return { ...state, refetch: load };
}

/** Convenience: extract latest decided step for a given component. */
export function latestStep(steps, component) {
  const filtered = (steps || []).filter((s) => s.component === component && s.status !== 'pending');
  if (filtered.length === 0) {
    return (steps || []).filter((s) => s.component === component).pop() || null;
  }
  filtered.sort((a, b) => new Date(b.decided_at || b.created_at) - new Date(a.decided_at || a.created_at));
  return filtered[0];
}

export function pendingStep(steps, component) {
  return (steps || []).filter((s) => s.component === component && s.status === 'pending').pop() || null;
}
