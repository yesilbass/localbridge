import supabase from './supabase.js';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

export async function requestCancellation(sessionId, reason, details = '') {
  try {
    const token = await getAccessToken();
    if (!token) return { data: null, error: 'Not authenticated' };

    const res = await fetch('/api/cancel-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ session_id: sessionId, reason, details }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data, error: data.error || 'Failed to submit cancellation request' };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message || 'Failed to submit cancellation request' };
  }
}

export async function getMyCancellationRequests() {
  return supabase
    .from('cancellation_requests')
    .select('id, session_id, cancelled_by, requester_role, reason, details, status, created_at')
    .order('created_at', { ascending: false });
}

export async function getMonthlyUsedCount() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('cancellation_requests')
    .select('*', { count: 'exact', head: true })
    .eq('cancelled_by', userId)
    .gte('created_at', monthStart.toISOString());

  if (error) return 0;
  return count ?? 0;
}
