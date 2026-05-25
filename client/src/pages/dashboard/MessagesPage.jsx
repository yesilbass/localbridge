import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import PaywallPrompt from '../../components/PaywallPrompt';
import { useActiveRole } from './dashboardHooks';
import PageHeader from './home/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import MentorAvatar from '../../components/MentorAvatar';
import {
  conversationHasUnread,
  createTypingChannel,
  getConversation,
  listConversationsForMentee,
  listConversationsForMentor,
  listMessages,
  markConversationRead,
  messagingFriendlyError,
  sendMessage,
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
  subscribeToInbox,
} from '../../api/messages';
import supabase from '../../api/supabase';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

function relativeTime(iso) {
  if (!iso) return '';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function messageTime(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function dateDividerLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
}

function groupMessagesByDay(messages) {
  const groups = [];
  let currentDay = null;
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      groups.push({ type: 'day', key: `day-${day}`, label: dateDividerLabel(msg.created_at) });
    }
    groups.push({ type: 'msg', key: msg.id, msg });
  }
  return groups;
}

function InboxSkeleton() {
  return (
    <div className="space-y-2 p-2" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 rounded-2xl px-3 py-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[var(--bridge-surface-muted)]" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="h-3 w-28 animate-pulse rounded-md bg-[var(--bridge-surface-muted)]" />
            <div className="h-3 w-full animate-pulse rounded-md bg-[var(--bridge-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationListItem({ conversation, active, peerLabel, preview, unread, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${ring}`}
      style={{
        background: active
          ? 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))'
          : 'transparent',
      }}
    >
      <div className="relative shrink-0">
        <MentorAvatar name={peerLabel} size="sm" />
        {unread && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--color-primary)' }}
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {peerLabel}
          </p>
          <span className="shrink-0 text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
            {relativeTime(conversation.last_message_at ?? conversation.updated_at)}
          </span>
        </div>
        <p
          className="mt-0.5 truncate text-[13px]"
          style={{
            color: unread ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
            fontWeight: unread ? 600 : 400,
          }}
        >
          {preview || 'Say hello'}
        </p>
      </div>
    </button>
  );
}

function ThreadView({
  conversationId,
  user,
  isMentorViewer,
  canSend,
  onInboxRefresh,
  onBack,
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [peerTyping, setPeerTyping] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const typingHideRef = useRef(null);
  const typingChannelRef = useRef(null);
  const onInboxRefreshRef = useRef(onInboxRefresh);
  onInboxRefreshRef.current = onInboxRefresh;

  const peerLabel = isMentorViewer
    ? (conversation?.mentee_name || 'Mentee')
    : (conversation?.mentor?.name || 'Mentor');
  const peerReadAt = isMentorViewer
    ? conversation?.mentee_last_read_at
    : conversation?.mentor_last_read_at;

  useEffect(() => {
    setConversation(null);
    setMessages([]);
    setDraft('');
    setSendError(null);
    setError(null);
    setLoading(true);
  }, [conversationId]);

  useEffect(() => {
    let cancelled = false;

    async function loadThread() {
      const { data: conv, error: convError } = await getConversation(conversationId);
      if (cancelled) return;

      if (convError || !conv) {
        setError(messagingFriendlyError(convError) ?? 'Conversation not found.');
        setLoading(false);
        return;
      }

      const isParticipant = conv.mentee_id === user.id
        || (isMentorViewer && conv.mentor?.user_id === user.id);
      if (!isParticipant) {
        setError('You do not have access to this conversation.');
        setLoading(false);
        return;
      }

      const { data: msgs, error: msgError } = await listMessages(conversationId);
      if (cancelled) return;

      if (msgError) {
        setError(messagingFriendlyError(msgError) ?? 'Could not load messages.');
        setLoading(false);
        return;
      }

      setConversation(conv);
      setMessages(msgs ?? []);
      setLoading(false);
      markConversationRead(conversationId).then(() => onInboxRefreshRef.current?.());
      requestAnimationFrame(() => textareaRef.current?.focus());
    }

    loadThread();
    return () => { cancelled = true; };
  }, [conversationId, user.id, isMentorViewer]);

  useEffect(() => {
    if (!conversationId) return undefined;
    return subscribeToConversationMessages(conversationId, (row) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        return [...prev.filter((m) => !m._optimistic), row];
      });
      if (row.sender_id !== user.id) {
        markConversationRead(conversationId).then(() => onInboxRefreshRef.current?.());
      }
    });
  }, [conversationId, user.id]);

  useEffect(() => {
    if (!conversationId) return undefined;
    return subscribeToConversationUpdates(conversationId, (row) => {
      setConversation((prev) => (prev ? { ...prev, ...row, mentor: prev.mentor } : prev));
    });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user?.id) return undefined;
    const displayName = user.user_metadata?.full_name?.split(' ')[0] || 'You';
    const { notifyTyping, unsubscribe } = createTypingChannel(
      conversationId,
      user.id,
      (name) => {
        setPeerTyping(name);
        if (typingHideRef.current) clearTimeout(typingHideRef.current);
        typingHideRef.current = setTimeout(() => setPeerTyping(null), 2800);
      },
    );
    typingChannelRef.current = { notifyTyping, displayName };
    return () => {
      unsubscribe();
      typingChannelRef.current = null;
      if (typingHideRef.current) clearTimeout(typingHideRef.current);
    };
  }, [conversationId, user?.id, user?.user_metadata?.full_name]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, peerTyping, loading]);

  const grouped = useMemo(() => groupMessagesByDay(messages), [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!canSend || !draft.trim() || sending) return;
    setSendError(null);
    setSending(true);

    const body = draft.trim();
    const optimisticId = `opt-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      created_at: new Date().toISOString(),
      _optimistic: true,
    }]);
    setDraft('');

    const { data, error: err, message } = await sendMessage(conversationId, body);
    if (err || !data) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(body);
      setSendError(message ?? 'Could not send. Try again.');
    } else {
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== optimisticId && m.id !== data.id);
        return [...without, data];
      });
      onInboxRefreshRef.current?.();
    }
    setSending(false);
  }

  function handleDraftChange(e) {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    typingChannelRef.current?.notifyTyping(typingChannelRef.current.displayName);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  const mentorProfileLink = !isMentorViewer && conversation?.mentor?.id
    ? `/dashboard/mentors/${conversation.mentor.id}`
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-4 py-3 sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full lg:hidden ${ring}`}
            style={{ color: 'var(--bridge-text-secondary)' }}
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <MentorAvatar name={peerLabel} size="md" />
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-5 w-32 animate-pulse rounded-md bg-[var(--bridge-surface-muted)]" />
          ) : mentorProfileLink ? (
            <Link
              to={mentorProfileLink}
              className={`truncate text-base font-bold hover:underline ${ring}`}
              style={{ color: 'var(--bridge-text)' }}
            >
              {peerLabel}
            </Link>
          ) : (
            <p className="truncate text-base font-bold" style={{ color: 'var(--bridge-text)' }}>
              {peerLabel}
            </p>
          )}
          {!loading && (
            <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
              {peerTyping
                ? `${peerTyping} is typing…`
                : isMentorViewer
                  ? 'Mentee · live chat'
                  : 'Your mentor · live chat'}
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3 sm:px-5"
        style={{ background: 'color-mix(in srgb, var(--bridge-canvas) 50%, var(--bridge-surface))' }}
      >
        {loading && (
          <div className="flex flex-1 items-center justify-center py-16">
            <LoadingSpinner size="sm" label={null} className="py-0" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="max-w-xs text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>{error}</p>
            <Link to="/dashboard/messages" className={`text-sm font-bold ${ring}`} style={{ color: 'var(--color-primary)' }}>
              Back to inbox
            </Link>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-9 w-9 opacity-25" style={{ color: 'var(--bridge-text-muted)' }} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>
              {isMentorViewer
                ? 'When a mentee reaches out, your reply appears here instantly.'
                : 'Introduce yourself — ask about their experience or what a first session could cover.'}
            </p>
          </div>
        )}

        {!loading && !error && grouped.map((item) => {
          if (item.type === 'day') {
            return (
              <div key={item.key} className="flex justify-center py-2">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ color: 'var(--bridge-text-muted)', background: 'var(--bridge-surface-muted)' }}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.msg;
          const mine = msg.sender_id === user.id;
          const read = mine && peerReadAt && new Date(peerReadAt) >= new Date(msg.created_at);

          return (
            <div key={item.key} className={`flex ${mine ? 'justify-end' : 'justify-start'} py-0.5`}>
              <div
                className={`max-w-[min(88%,26rem)] rounded-[1.15rem] px-4 py-2.5 text-[15px] leading-relaxed ${
                  mine ? 'rounded-br-sm' : 'rounded-bl-sm'
                } ${msg._optimistic ? 'opacity-80' : ''}`}
                style={{
                  background: mine ? 'var(--color-primary)' : 'var(--bridge-surface-muted)',
                  color: mine ? 'var(--color-on-primary)' : 'var(--bridge-text)',
                }}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <div className={`mt-1 flex items-center gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] tabular-nums opacity-70">{messageTime(msg.created_at)}</span>
                  {mine && !msg._optimistic && (
                    read
                      ? <CheckCheck className="h-3 w-3 opacity-70" aria-label="Read" />
                      : <Check className="h-3 w-3 opacity-50" aria-label="Sent" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && !error && !canSend && (
        <div className="shrink-0 px-4 pb-2">
          <PaywallPrompt feature="messaging" />
        </div>
      )}

      {!loading && !error && canSend && (
        <form
          onSubmit={handleSend}
          className="shrink-0 px-4 py-3 sm:px-5 sm:py-4"
        >
          <div
            className="flex items-end gap-2 rounded-[1.35rem] p-2"
            style={{ background: 'var(--bridge-surface-muted)' }}
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={!canSend || sending}
              placeholder={canSend ? 'Message…' : 'Subscribe to send'}
              className={`max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-snug disabled:opacity-50 ${ring}`}
              style={{ color: 'var(--bridge-text)' }}
            />
            <button
              type="submit"
              disabled={!canSend || !draft.trim() || sending}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:opacity-35 ${ring}`}
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {sendError && (
            <p className="mt-2 text-center text-xs font-medium" style={{ color: 'var(--color-error)' }}>
              {sendError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, isSubscribed, settingsLoading } = useAuth();
  const { active: activeRole } = useActiveRole('mentee');
  const isMentorViewer = activeRole === 'mentor';

  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [mentorProfileLoading, setMentorProfileLoading] = useState(isMentorViewer);
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const inboxRefreshTimer = useRef(null);

  useEffect(() => {
    if (!user || !isMentorViewer) {
      setMentorProfileLoading(false);
      return;
    }
    setMentorProfileLoading(true);
    supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setMentorProfileId(data?.id ?? null);
        setMentorProfileLoading(false);
      });
  }, [user, isMentorViewer]);

  const loadList = useCallback(async ({ silent = false } = {}) => {
    if (!user) return;
    if (isMentorViewer && mentorProfileLoading) return;

    if (!silent) {
      setListLoading(true);
      setListError(null);
    }

    const res = isMentorViewer
      ? await listConversationsForMentor(mentorProfileId)
      : await listConversationsForMentee();

    if (res.error) {
      if (!silent) {
        setConversations([]);
        setListError(messagingFriendlyError(res.error) ?? 'Could not load conversations.');
      }
    } else {
      setConversations(res.data ?? []);
      if (!silent) setListError(null);
    }

    if (!silent) setListLoading(false);
  }, [user, isMentorViewer, mentorProfileId, mentorProfileLoading]);

  const refreshInbox = useCallback(() => {
    if (inboxRefreshTimer.current) clearTimeout(inboxRefreshTimer.current);
    inboxRefreshTimer.current = setTimeout(() => loadList({ silent: true }), 280);
  }, [loadList]);

  useEffect(() => {
    loadList();
    return () => {
      if (inboxRefreshTimer.current) clearTimeout(inboxRefreshTimer.current);
    };
  }, [loadList]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToInbox(user.id, mentorProfileId, isMentorViewer, refreshInbox);
  }, [user, mentorProfileId, isMentorViewer, refreshInbox]);

  const canSend = isMentorViewer || isSubscribed;
  const showUpgrade = !isMentorViewer && !settingsLoading && !isSubscribed;
  const showInbox = !conversationId;
  const showThread = Boolean(conversationId && user);

  return (
    <div
      className="flex flex-col"
      style={{ height: 'clamp(520px, calc(100dvh - var(--navbar-h, 4.75rem) - 7.5rem), 860px)' }}
    >
      <PageHeader
        title="Messages"
        subtitle={isMentorViewer ? 'Live chat with mentees' : 'Chat with your mentors'}
      />

      {showUpgrade && !conversationId && (
        <div className="mb-4">
          <PaywallPrompt feature="messaging" />
        </div>
      )}

      <div
        className="grid min-h-0 flex-1 overflow-hidden rounded-[1.25rem] lg:grid-cols-[minmax(240px,280px)_1fr]"
        style={{ background: 'var(--bridge-surface)' }}
      >
        <aside
          className={`min-h-0 flex-col border-b lg:border-b-0 lg:border-r ${showInbox ? 'flex' : 'hidden lg:flex'}`}
          style={{ borderColor: 'color-mix(in srgb, var(--bridge-border) 65%, transparent)' }}
        >
          <p
            className="shrink-0 px-4 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--bridge-text-faint)' }}
          >
            Inbox
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {listLoading || mentorProfileLoading ? (
              <InboxSkeleton />
            ) : listError ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>{listError}</p>
                <button
                  type="button"
                  onClick={() => loadList()}
                  className={`mt-3 text-sm font-bold ${ring}`}
                  style={{ color: 'var(--color-primary)' }}
                >
                  Try again
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <MessageSquare className="mx-auto h-8 w-8 opacity-25" style={{ color: 'var(--bridge-text-muted)' }} />
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>
                  {isMentorViewer
                    ? 'No messages yet.'
                    : 'Open a mentor profile and tap Message to start.'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((c) => {
                  const peerLabel = isMentorViewer
                    ? (c.mentee_name || 'Mentee')
                    : (c.mentor?.name || 'Mentor');
                  const preview = c.last_message_body || null;
                  const unread = user && conversationHasUnread(c, user.id, isMentorViewer);
                  return (
                    <ConversationListItem
                      key={c.id}
                      conversation={c}
                      active={c.id === conversationId}
                      peerLabel={peerLabel}
                      preview={preview}
                      unread={unread}
                      onSelect={(id) => navigate(`/dashboard/messages/${id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div className={`min-h-0 flex-col ${showThread ? 'flex' : 'hidden lg:flex'}`}>
          {showThread ? (
            <ThreadView
              key={conversationId}
              conversationId={conversationId}
              user={user}
              isMentorViewer={isMentorViewer}
              canSend={canSend}
              onInboxRefresh={refreshInbox}
              onBack={() => navigate('/dashboard/messages')}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <MessageSquare className="h-10 w-10 opacity-20" style={{ color: 'var(--bridge-text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
                Select a conversation
              </p>
              <p className="max-w-xs text-xs leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>
                Messages update live — no refresh needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
