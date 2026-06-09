import { useState, useEffect, useCallback } from 'react';
import { X, Hash, Trash2, Plus } from 'lucide-react';
import { getCommunityStructure, modAction } from '../../api/community';
import supabase from '../../api/supabase';

function StatusMsg({ msg }) {
  if (!msg) return null;
  const isError = msg.startsWith('Error');
  return (
    <p
      className="mt-2 text-xs font-medium"
      style={{ color: isError ? '#ef4444' : '#10b981' }}
    >
      {msg}
    </p>
  );
}

function inputStyle(extra) {
  return {
    backgroundColor: 'var(--bridge-canvas)',
    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
    color: 'var(--bridge-text)',
    ...extra,
  };
}

// ─── Channels Tab ─────────────────────────────────────────────────────────────

function ChannelsTab({ structure, onRefresh }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState(null);

  const allChannels = structure.flatMap((s) =>
    s.channels.map((ch) => ({ ...ch, sectionName: s.name }))
  );

  useEffect(() => {
    if (structure.length && !sectionId) setSectionId(structure[0].id);
  }, [structure, sectionId]);

  function flash(msg) {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  }

  async function handleRemove(channelId) {
    const res = await modAction('remove_channel', { channel_id: channelId });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    flash('Channel removed.');
    onRefresh();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !sectionId) return;
    const res = await modAction('add_channel', {
      section_id: sectionId,
      name: name.trim(),
      description: description.trim() || null,
      position: Number(position) || 0,
    });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setName(''); setDescription(''); setPosition('');
    flash('Channel added.');
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        {allChannels.length === 0 ? (
          <p className="text-xs text-[var(--bridge-text-muted)]">No channels yet.</p>
        ) : (
          allChannels.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <Hash className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)]" />
              <span className="flex-1 truncate text-[13px] text-[var(--bridge-text)]">{ch.name}</span>
              <span className="shrink-0 text-[11px] text-[var(--bridge-text-muted)]">{ch.sectionName}</span>
              <button
                onClick={() => handleRemove(ch.id)}
                className="shrink-0 rounded-md p-1 transition hover:opacity-80"
                style={{ backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444' }}
                title="Remove channel"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 rounded-xl p-3" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
        <p className="text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.1em' }}>
          Add channel
        </p>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        >
          {structure.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          placeholder="Position (number)"
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <button
          type="submit"
          disabled={!name.trim() || !sectionId}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add channel
        </button>
      </form>

      <StatusMsg msg={status} />
    </div>
  );
}

// ─── Sections Tab ─────────────────────────────────────────────────────────────

function SectionsTab({ structure, onRefresh }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState(null);

  function flash(msg) {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  }

  async function handleRemove(sectionId) {
    const res = await modAction('remove_section', { section_id: sectionId });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    flash('Section removed.');
    onRefresh();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await modAction('add_section', {
      name: name.trim(),
      position: Number(position) || 0,
    });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setName(''); setPosition('');
    flash('Section added.');
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p
        className="rounded-lg px-3 py-2 text-[12px]"
        style={{
          backgroundColor: 'color-mix(in srgb, #f59e0b 10%, transparent)',
          color: '#b45309',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #f59e0b 30%, transparent)',
        }}
      >
        Removing a section deletes all its channels.
      </p>

      <div className="space-y-1">
        {structure.length === 0 ? (
          <p className="text-xs text-[var(--bridge-text-muted)]">No sections yet.</p>
        ) : (
          structure.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <span className="flex-1 truncate text-[13px] font-medium text-[var(--bridge-text)]">{s.name}</span>
              <span className="shrink-0 text-[11px] text-[var(--bridge-text-muted)]">pos {s.position}</span>
              <button
                onClick={() => handleRemove(s.id)}
                className="shrink-0 rounded-md p-1 transition hover:opacity-80"
                style={{ backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444' }}
                title="Remove section"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 rounded-xl p-3" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
        <p className="text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.1em' }}>
          Add section
        </p>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <input
          placeholder="Position (number)"
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add section
        </button>
      </form>

      <StatusMsg msg={status} />
    </div>
  );
}

// ─── Blocked Users Tab ────────────────────────────────────────────────────────

function BlockedTab() {
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [blockedList, setBlockedList] = useState([]);
  const [status, setStatus] = useState(null);

  function flash(msg) {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  }

  const fetchBlocked = useCallback(async () => {
    // Full list requires service role — shown here is what anon RLS permits.
    // Moderators see the complete list via Supabase dashboard for now.
    const { data } = await supabase
      .from('community_blocked_users')
      .select('user_id, reason, created_at')
      .order('created_at', { ascending: false });
    setBlockedList(data ?? []);
  }, []);

  useEffect(() => { fetchBlocked(); }, [fetchBlocked]);

  async function handleBlock(e) {
    e.preventDefault();
    if (!userId.trim()) return;
    const res = await modAction('block_user', { user_id: userId.trim(), reason: reason.trim() || null });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setUserId(''); setReason('');
    flash('User blocked.');
    fetchBlocked();
  }

  async function handleUnblock(uid) {
    const res = await modAction('unblock_user', { user_id: uid });
    if (res.error) { flash(`Error: ${res.error}`); return; }
    flash('User unblocked.');
    fetchBlocked();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleBlock} className="space-y-2 rounded-xl p-3" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
        <p className="text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.1em' }}>
          Block user
        </p>
        <input
          placeholder="User ID (UUID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
          style={inputStyle()}
        />
        <button
          type="submit"
          disabled={!userId.trim()}
          className="w-full rounded-lg py-1.5 text-xs font-semibold transition disabled:opacity-40"
          style={{ backgroundColor: '#ef4444', color: '#fff' }}
        >
          Block
        </button>
      </form>

      <div>
        <p className="mb-2 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.1em' }}>
          Blocked users
        </p>
        {blockedList.length === 0 ? (
          <p className="text-xs text-[var(--bridge-text-muted)]">No blocked users visible via current permissions.</p>
        ) : (
          <div className="space-y-1">
            {blockedList.map((row) => (
              <div
                key={row.user_id}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-[var(--bridge-text)]">
                    {row.user_id.slice(0, 8)}…
                  </p>
                  {row.reason && (
                    <p className="truncate text-[11px] text-[var(--bridge-text-muted)]">{row.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleUnblock(row.user_id)}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold transition hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <StatusMsg msg={status} />
    </div>
  );
}

// ─── ModPanel ─────────────────────────────────────────────────────────────────

const TABS = ['Channels', 'Sections', 'Blocked Users'];

export default function ModPanel({ open, onClose }) {
  const [tab, setTab] = useState('Channels');
  const [structure, setStructure] = useState([]);

  const refresh = useCallback(() => {
    getCommunityStructure().then(({ data, error }) => {
      if (!error && data) setStructure(data);
    });
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          borderLeft: '1px solid var(--bridge-border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex h-12 shrink-0 items-center justify-between px-4"
          style={{ borderBottom: '1px solid var(--bridge-border)' }}
        >
          <span className="text-[13px] font-semibold text-[var(--bridge-text)]">Mod Tools</span>
          <button onClick={onClose} className="rounded-lg p-1 opacity-60 transition hover:opacity-100">
            <X className="h-4 w-4 text-[var(--bridge-text)]" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0 gap-1 px-3 py-2"
          style={{ borderBottom: '1px solid var(--bridge-border)' }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
              style={
                tab === t
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                  : { backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-muted)' }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'Channels' && (
            <ChannelsTab structure={structure} onRefresh={refresh} />
          )}
          {tab === 'Sections' && (
            <SectionsTab structure={structure} onRefresh={refresh} />
          )}
          {tab === 'Blocked Users' && (
            <BlockedTab />
          )}
        </div>
      </aside>
    </>
  );
}
