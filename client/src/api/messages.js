import supabase from './supabase';

const CONVERSATION_SELECT = `
  id,
  mentee_id,
  mentor_id,
  mentee_name,
  updated_at,
  last_message_body,
  last_message_at,
  last_message_sender_id,
  mentee_last_read_at,
  mentor_last_read_at,
  mentor:mentor_id (id, name, title, image_url, user_id)
`;

const CONVERSATION_SELECT_LEGACY = `
  id,
  mentee_id,
  mentor_id,
  mentee_name,
  updated_at,
  mentor:mentor_id (id, name, title, image_url, user_id)
`;

function isMissingColumnError(error) {
  const msg = error?.message ?? '';
  return error?.code === '42703' || msg.includes('does not exist') || msg.includes('last_message');
}

async function queryConversations(buildQuery, legacyBuildQuery) {
  const full = await buildQuery(CONVERSATION_SELECT);
  if (!full.error || !isMissingColumnError(full.error)) return full;
  return legacyBuildQuery(CONVERSATION_SELECT_LEGACY);
}

async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, error: error ?? new Error('Sign in to use messaging') };
  }
  return { user, error: null };
}

function friendlyError(error) {
  if (!error) return null;
  const msg = error.message ?? '';
  if (error.code === '42P01' || msg.includes('mentor_conversations')) {
    return 'Messaging is not enabled yet. Ask your admin to run the messaging migration.';
  }
  if (error.code === '42501' || msg.toLowerCase().includes('policy')) {
    return 'Messaging requires an active Plus or Pro plan.';
  }
  return msg || 'Something went wrong. Try again.';
}

export async function getOrCreateConversation(mentorProfileId, menteeName) {
  const { user, error: authError } = await requireUser();
  if (authError) return { data: null, error: authError };

  const { data: existing, error: findError } = await supabase
    .from('mentor_conversations')
    .select('*')
    .eq('mentee_id', user.id)
    .eq('mentor_id', mentorProfileId)
    .maybeSingle();

  if (findError) return { data: null, error: findError, message: friendlyError(findError) };
  if (existing) return { data: existing, error: null, message: null };

  const { data, error } = await supabase
    .from('mentor_conversations')
    .insert({
      mentee_id: user.id,
      mentor_id: mentorProfileId,
      mentee_name: menteeName?.trim() || null,
    })
    .select('*')
    .single();

  if (error?.code === '23505') {
    const { data: retry, error: retryError } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('mentee_id', user.id)
      .eq('mentor_id', mentorProfileId)
      .maybeSingle();
    return { data: retry, error: retryError, message: friendlyError(retryError) };
  }

  return { data, error, message: friendlyError(error) };
}

export async function listConversationsForMentee() {
  const { user, error: authError } = await requireUser();
  if (authError) return { data: [], error: authError };

  const { data, error } = await queryConversations(
    (select) => supabase
      .from('mentor_conversations')
      .select(select)
      .eq('mentee_id', user.id)
      .order('updated_at', { ascending: false }),
    (select) => supabase
      .from('mentor_conversations')
      .select(select)
      .eq('mentee_id', user.id)
      .order('updated_at', { ascending: false }),
  );

  return { data: data ?? [], error };
}

export async function listConversationsForMentor(mentorProfileId) {
  if (!mentorProfileId) return { data: [], error: null };

  const { data, error } = await queryConversations(
    (select) => supabase
      .from('mentor_conversations')
      .select(select)
      .eq('mentor_id', mentorProfileId)
      .order('updated_at', { ascending: false }),
    (select) => supabase
      .from('mentor_conversations')
      .select(select)
      .eq('mentor_id', mentorProfileId)
      .order('updated_at', { ascending: false }),
  );

  return { data: data ?? [], error };
}

export async function getConversation(conversationId) {
  const full = await supabase
    .from('mentor_conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', conversationId)
    .maybeSingle();

  if (!full.error || !isMissingColumnError(full.error)) return full;

  return supabase
    .from('mentor_conversations')
    .select(CONVERSATION_SELECT_LEGACY)
    .eq('id', conversationId)
    .maybeSingle();
}

export async function listMessages(conversationId, { limit = 100 } = {}) {
  return supabase
    .from('mentor_messages')
    .select('id, conversation_id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
}

export async function sendMessage(conversationId, body) {
  const trimmed = body?.trim();
  if (!trimmed) return { data: null, error: new Error('Message cannot be empty'), message: 'Message cannot be empty' };

  const { user, error: authError } = await requireUser();
  if (authError) return { data: null, error: authError, message: friendlyError(authError) };

  const { data, error } = await supabase
    .from('mentor_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select('*')
    .single();

  return { data, error, message: friendlyError(error) };
}

export async function markConversationRead(conversationId) {
  const { error } = await supabase.rpc('mark_mentor_conversation_read', {
    conv_id: conversationId,
  });
  if (error?.code === '42883' || error?.message?.includes('mark_mentor_conversation_read')) {
    return { error: null, message: null };
  }
  return { error, message: friendlyError(error) };
}

export function conversationHasUnread(conversation, viewerUserId, isMentorViewer) {
  if (!conversation?.last_message_at || !conversation.last_message_sender_id) return false;
  if (conversation.last_message_sender_id === viewerUserId) return false;

  const lastAt = new Date(conversation.last_message_at).getTime();
  if (isMentorViewer) {
    const readAt = conversation.mentor_last_read_at
      ? new Date(conversation.mentor_last_read_at).getTime()
      : 0;
    return lastAt > readAt;
  }
  const readAt = conversation.mentee_last_read_at
    ? new Date(conversation.mentee_last_read_at).getTime()
    : 0;
  return lastAt > readAt;
}

export function subscribeToConversationUpdates(conversationId, onUpdate) {
  const channel = supabase
    .channel(`mentor-conv:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'mentor_conversations',
        filter: `id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) onUpdate(payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversationMessages(conversationId, onInsert) {
  const channel = supabase
    .channel(`mentor-messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mentor_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) onInsert(payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToInbox(userId, mentorProfileId, isMentorViewer, onChange) {
  const channel = supabase.channel(`mentor-inbox:${userId}:${mentorProfileId ?? 'mentee'}`);

  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'mentor_conversations' },
    () => onChange(),
  );

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'mentor_messages' },
    () => onChange(),
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function createTypingChannel(conversationId, userId, onPeerTyping) {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: { broadcast: { self: false } },
  });

  channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
    if (payload?.userId && payload.userId !== userId) {
      onPeerTyping(payload.displayName ?? 'They');
    }
  });

  channel.subscribe();

  let lastSent = 0;
  const notifyTyping = (displayName) => {
    const now = Date.now();
    if (now - lastSent < 1200) return;
    lastSent = now;
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, displayName },
    });
  };

  return { notifyTyping, unsubscribe: () => supabase.removeChannel(channel) };
}

export { friendlyError as messagingFriendlyError };
