import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Menu, X, Trash2, Shield } from 'lucide-react';
import {
  getCommunityStructure,
  getChannelMessages,
  sendChannelMessage,
  modAction,
  checkIfBlocked,
} from '../../api/community';
import { useAuth } from '../../context/useAuth';
import supabase from '../../api/supabase';
import { formatRelativeTime } from '../dashboard/dashboardHooks';
import LoadingSpinner from '../../components/LoadingSpinner';

// ─── Mod Panel ───────────────────────────────────────────────────────────────

function ModPanel({ onClose }) {
  const [tab, setTab] = useState('users');
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [status, setStatus] = useState(null);

  async function run(action, payload) {
    setStatus('loading');
    const res = await modAction(action, payload);
    setStatus(res.error ? `Error: ${res.error}` : 'Done');
    setTimeout(() => setStatus(null), 3000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 24px 64px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-semibold text-[var(--bridge-text)]">Mod Tools</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 opacity-60 transition hover:opacity-100">
            <X className="h-4 w-4 text-[var(--bridge-text)]" />
          </button>
        </div>

        <div className="mb-4 flex gap-1.5">
          {['users', 'structure'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={
                tab === t
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                  : { backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-muted)' }
              }
            >
              {t === 'structure' ? 'Structure' : 'Users'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="space-y-3">
            <input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bridge-canvas)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                color: 'var(--bridge-text)',
              }}
            />
            <input
              placeholder="Reason (block only)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bridge-canvas)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                color: 'var(--bridge-text)',
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => run('block_user', { user_id: userId, reason })}
                disabled={!userId}
                className="flex-1 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-40"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}
              >
                Block
              </button>
              <button
                onClick={() => run('unblock_user', { user_id: userId })}
                disabled={!userId}
                className="flex-1 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--bridge-surface-muted)',
                  color: 'var(--bridge-text)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                Unblock
              </button>
            </div>
          </div>
        )}

        {tab === 'structure' && (
          <div className="space-y-3">
            <input
              placeholder="New section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bridge-canvas)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                color: 'var(--bridge-text)',
              }}
            />
            <button
              onClick={() => run('add_section', { name: sectionName, position: 999 })}
              disabled={!sectionName}
              className="w-full rounded-xl py-2 text-xs font-semibold transition disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Add section
            </button>
          </div>
        )}

        {status && (
          <p
            className="mt-4 text-center text-xs font-medium"
            style={{
              color:
                status === 'loading'
                  ? 'var(--bridge-text-muted)'
                  : status.startsWith('Error')
                  ? '#ef4444'
                  : '#10b981',
            }}
          >
            {status === 'loading' ? 'Processing…' : status}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Message Row ─────────────────────────────────────────────────────────────

function MessageRow({ msg, isGrouped, isMod, isOwn, onDelete }) {
  return (
    <div
      className="group relative flex gap-3 px-4 py-0.5 transition-colors"
      style={{ '--hover-bg': 'color-mix(in srgb, var(--bridge-border) 30%, transparent)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-border) 25%, transparent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
    >
      <div className="w-9 shrink-0 pt-0.5">
        {!isGrouped ? (
          msg.author.avatar ? (
            <img src={msg.author.avatar} alt={msg.author.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {msg.author.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {!isGrouped && (
          <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-semibold text-[var(--bridge-text)]">{msg.author.name}</span>
            {msg.author.is_mentor && (
              <span
                className="rounded-full px-1.5 py-px text-[9px] font-black uppercase"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.06em',
                }}
              >
                Mentor
              </span>
            )}
            <span className="text-[11px] text-[var(--bridge-text-muted)]">
              {formatRelativeTime(msg.created_at)}
            </span>
          </div>
        )}
        <p
          className="text-[14px] leading-[1.6] text-[var(--bridge-text)]"
          style={{ wordBreak: 'break-word' }}
        >
          {msg.body}
        </p>
      </div>

      {(isMod || isOwn) && (
        <button
          onClick={() => onDelete(msg.id)}
          className="absolute right-3 top-2 rounded-lg p-1 opacity-0 transition group-hover:opacity-100 hover:text-[#ef4444]"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
          title="Delete message"
        >
          <Trash2 className="h-3.5 w-3.5 text-[var(--bridge-text-muted)]" />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { channelId: urlChannelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [structure, setStructure] = useState([]);
  const [structureLoading, setStructureLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showModPanel, setShowModPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const realtimeRef = useRef(null);

  useEffect(() => {
    getCommunityStructure().then(({ data, error }) => {
      if (!error && data) setStructure(data);
      setStructureLoading(false);
    });
  }, []);

  useEffect(() => {
    if (urlChannelId || !structure.length) return;
    const first = structure[0]?.channels?.[0];
    if (first) navigate(`/community/${first.id}`, { replace: true });
  }, [structure, urlChannelId, navigate]);

  useEffect(() => {
    if (!urlChannelId || !structure.length) return;
    for (const section of structure) {
      const ch = section.channels.find((c) => c.id === urlChannelId);
      if (ch) { setActiveChannel(ch); return; }
    }
  }, [urlChannelId, structure]);

  useEffect(() => {
    if (user) {
      checkIfBlocked().then(setIsBlocked);
      supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(Boolean(data)));
    }
  }, [user]);

  useEffect(() => {
    if (!urlChannelId) return;

    setMessagesLoading(true);
    setMessages([]);

    getChannelMessages(urlChannelId, { limit: 50 }).then(({ data, error }) => {
      if (!error) {
        setMessages(data);
        setHasMore(data.length === 50);
      }
      setMessagesLoading(false);
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }));
    });

    if (realtimeRef.current) {
      supabase.removeChannel(realtimeRef.current);
      realtimeRef.current = null;
    }

    const sub = supabase
      .channel(`community:${urlChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${urlChannelId}`,
        },
        async () => {
          const { data } = await getChannelMessages(urlChannelId, { limit: 1 });
          if (data?.length) {
            setMessages((prev) =>
              prev.some((m) => m.id === data[0].id) ? prev : [...prev, data[0]]
            );
            requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
          }
        },
      )
      .subscribe();

    realtimeRef.current = sub;

    return () => {
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current);
        realtimeRef.current = null;
      }
    };
  }, [urlChannelId]);

  async function loadOlderMessages() {
    if (!urlChannelId || !messages.length || loadingMore) return;
    setLoadingMore(true);
    const before = messages[0].created_at;
    const container = messagesContainerRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    const { data, error } = await getChannelMessages(urlChannelId, { limit: 50, before });
    if (!error && data.length) {
      setMessages((prev) => [...data, ...prev]);
      setHasMore(data.length === 50);
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight;
      });
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }

  async function handleSend() {
    if (!input.trim() || sending || isBlocked || !user) return;
    const body = input.trim();
    setInput('');
    setSending(true);
    const { data, error } = await sendChannelMessage(urlChannelId, body);
    setSending(false);
    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleDeleteMessage(msgId) {
    if (isAdmin) {
      await modAction('delete_message', { message_id: msgId });
    } else {
      await supabase.from('community_messages').delete().eq('id', msgId);
    }
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }

  const enrichedMessages = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const isGrouped =
      prev &&
      prev.author?.id === msg.author?.id &&
      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
    return { ...msg, isGrouped: Boolean(isGrouped) };
  });

  const sidebarContent = (
    <nav className="flex h-full flex-col" style={{ backgroundColor: 'var(--bridge-surface)' }}>
      <div
        className="flex h-12 shrink-0 items-center gap-2 px-4"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <Hash className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
        <span className="flex-1 truncate text-[13px] font-semibold text-[var(--bridge-text)]">
          Bridge Community
        </span>
        <button
          className="rounded-lg p-1 opacity-60 transition hover:opacity-100 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4 text-[var(--bridge-text)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {structureLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          structure.map((section) => (
            <div key={section.id} className="mb-5">
              <p
                className="mb-1 px-4 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]"
                style={{ letterSpacing: '0.1em' }}
              >
                {section.name}
              </p>
              <div className="space-y-px px-2">
                {section.channels.map((ch) => {
                  const isActive = ch.id === urlChannelId;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { navigate(`/community/${ch.id}`); setSidebarOpen(false); }}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition"
                      style={
                        isActive
                          ? {
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                              color: 'var(--color-primary)',
                            }
                          : { color: 'var(--bridge-text-muted)' }
                      }
                    >
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-[13px] font-medium">{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--bridge-border)' }}>
          <button
            onClick={() => setShowModPanel(true)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Mod Tools
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bridge-canvas)' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden w-60 shrink-0 lg:block"
        style={{ borderRight: '1px solid var(--bridge-border)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden"
            style={{ borderRight: '1px solid var(--bridge-border)' }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex h-12 shrink-0 items-center gap-3 px-4"
          style={{
            borderBottom: '1px solid var(--bridge-border)',
            backgroundColor: 'var(--bridge-surface)',
          }}
        >
          <button
            className="rounded-lg p-1.5 opacity-70 transition hover:opacity-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4 text-[var(--bridge-text)]" />
          </button>
          <Hash className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" />
          <span className="text-[13px] font-semibold text-[var(--bridge-text)]">
            {activeChannel?.name ?? '—'}
          </span>
          {activeChannel?.description && (
            <>
              <span className="hidden text-[var(--bridge-text-muted)] opacity-30 sm:inline" aria-hidden>|</span>
              <span className="hidden truncate text-[12px] text-[var(--bridge-text-muted)] sm:block">
                {activeChannel.description}
              </span>
            </>
          )}
        </header>

        {/* Message area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-2">
          {hasMore && (
            <div className="flex justify-center py-3">
              <button
                onClick={loadOlderMessages}
                disabled={loadingMore}
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bridge-surface-muted)',
                  color: 'var(--bridge-text-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </button>
            </div>
          )}

          {messagesLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--bridge-surface-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <Hash className="h-6 w-6 text-[var(--bridge-text-muted)]" />
              </div>
              <p className="text-[14px] font-semibold text-[var(--bridge-text)]">
                Welcome to #{activeChannel?.name ?? 'this channel'}
              </p>
              <p className="text-[12px] text-[var(--bridge-text-muted)]">
                {activeChannel?.description ?? 'Be the first to start the conversation.'}
              </p>
            </div>
          ) : (
            enrichedMessages.map((msg) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                isGrouped={msg.isGrouped}
                isMod={isAdmin}
                isOwn={user?.id === msg.author?.id}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="shrink-0 px-4 pb-4 pt-2"
          style={{
            borderTop: '1px solid var(--bridge-border)',
            backgroundColor: 'var(--bridge-surface)',
          }}
        >
          {!user ? (
            <div
              className="flex h-10 items-center justify-center rounded-xl text-[13px] text-[var(--bridge-text-muted)]"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              Sign in to chat
            </div>
          ) : isBlocked ? (
            <div
              className="flex h-10 items-center justify-center rounded-xl text-[13px]"
              style={{
                backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
                color: '#ef4444',
                boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 30%, transparent)',
              }}
            >
              You have been removed from this community
            </div>
          ) : (
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{
                backgroundColor: 'var(--bridge-canvas)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                placeholder={`Message #${activeChannel?.name ?? 'channel'}`}
                disabled={sending}
                className="flex-1 resize-none bg-transparent text-[14px] leading-[1.5] text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-muted)] outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      {showModPanel && <ModPanel onClose={() => setShowModPanel(false)} />}
    </div>
  );
}
