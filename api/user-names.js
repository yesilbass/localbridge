import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applyCors } from './_lib/allowedOrigins.js';
import { jsonError } from './_lib/security.js';

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authErr } = await verifyAuthUser(req);
  if (authErr || !user) return jsonError(res, 401, 'Unauthorized');

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const userIds = Array.isArray(body.userIds)
    ? [...new Set(body.userIds.filter((id) => typeof id === 'string' && id.length > 0))]
    : [];
  if (!userIds.length) return res.status(200).json({});

  const nameMap = {};

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, personal_info')
    .in('user_id', userIds);
  if (Array.isArray(profiles)) {
    for (const p of profiles) {
      const name = p.personal_info?.full_name;
      if (name) nameMap[p.user_id] = name;
    }
  }

  const missing = userIds.filter((id) => !nameMap[id]);
  await Promise.all(missing.map(async (id) => {
    try {
      const { data } = await supabase.auth.admin.getUserById(id);
      const fullName = data?.user?.user_metadata?.full_name;
      if (fullName) nameMap[id] = fullName;
    } catch { /* ignore — leave id unmapped */ }
  }));

  return res.status(200).json(nameMap);
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
