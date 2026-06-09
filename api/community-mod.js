import { createClient } from '@supabase/supabase-js';

const anonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: adminRow } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return res.status(403).json({ error: 'Forbidden' });

  const { action, payload } = req.body;
  if (!action || !payload) {
    return res.status(400).json({ error: 'Missing action or payload' });
  }

  try {
    switch (action) {
      case 'block_user': {
        const { user_id, reason } = payload;
        const { error } = await adminClient
          .from('community_blocked_users')
          .insert({ user_id, reason });
        if (error) throw error;
        break;
      }

      case 'unblock_user': {
        const { user_id } = payload;
        const { error } = await adminClient
          .from('community_blocked_users')
          .delete()
          .eq('user_id', user_id);
        if (error) throw error;
        break;
      }

      case 'delete_message': {
        const { message_id } = payload;
        const { error } = await adminClient
          .from('community_messages')
          .delete()
          .eq('id', message_id);
        if (error) throw error;
        break;
      }

      case 'delete_post': {
        const { post_id } = payload;
        const { error } = await adminClient
          .from('community_posts')
          .delete()
          .eq('id', post_id);
        if (error) throw error;
        break;
      }

      case 'add_channel': {
        const { section_id, name, description, position } = payload;
        const { error } = await adminClient
          .from('community_channels')
          .insert({ section_id, name, description, position });
        if (error) throw error;
        break;
      }

      case 'remove_channel': {
        const { channel_id } = payload;
        const { error } = await adminClient
          .from('community_channels')
          .delete()
          .eq('id', channel_id);
        if (error) throw error;
        break;
      }

      case 'add_section': {
        const { name, position } = payload;
        const { error } = await adminClient
          .from('community_sections')
          .insert({ name, position });
        if (error) throw error;
        break;
      }

      case 'remove_section': {
        const { section_id } = payload;
        const { error } = await adminClient
          .from('community_sections')
          .delete()
          .eq('id', section_id);
        if (error) throw error;
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
