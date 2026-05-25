import supabase from './supabase.js';

export function mapStripeSubscription(subscription) {
  const meta = subscription.metadata ?? {};
  const plan = meta.plan === 'annual' ? 'annual' : 'monthly';
  const isStudent = meta.is_student === 'true' || meta.is_student === true;

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id ?? null;

  return {
    subscription_status: subscription.status ?? null,
    subscription_plan: plan,
    stripe_subscription_id: subscription.id ?? null,
    stripe_customer_id: customerId,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    is_student: isStudent,
  };
}

export async function resolveUserIdFromSubscription(supabaseClient, subscription) {
  const meta = subscription.metadata ?? {};
  if (meta.user_id) return String(meta.user_id);
  if (meta.userId) return String(meta.userId);

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) return null;

  const { data: rows } = await supabaseClient
    .from('user_settings')
    .select('user_id, settings')
    .filter('settings->>stripe_customer_id', 'eq', customerId)
    .limit(1);

  if (rows?.[0]?.user_id) return rows[0].user_id;
  return null;
}

export async function upsertSubscriptionSettings(supabaseClient, userId, patch) {
  const { data: row } = await supabaseClient
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();

  const prev = row?.settings && typeof row.settings === 'object' ? row.settings : {};
  const settings = { ...prev, ...patch };

  const { error } = await supabaseClient.from('user_settings').upsert(
    { user_id: userId, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );

  return error ? { ok: false, error: error.message } : { ok: true, settings };
}

export async function findActiveSubscription(supabaseClient, userId) {
  const { data } = await supabaseClient
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();

  const settings = data?.settings;
  if (!settings || typeof settings !== 'object') return null;
  const status = settings.subscription_status;
  if (status === 'active' || status === 'trialing') return settings;
  return null;
}

export { supabase as defaultSupabase };
