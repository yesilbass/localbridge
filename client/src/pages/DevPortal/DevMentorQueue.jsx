import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import {
  CheckCircle, XCircle, Clock, ShieldCheck, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, Zap, User, CreditCard, Camera, Bot,
} from 'lucide-react';

const STATUS_COLORS = {
  clear:     { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e',  label: 'Clear' },
  consider:  { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', text: 'var(--color-primary)',  label: 'Consider' },
  suspended: { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444',  label: 'Suspended' },
  pending:   { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8',  label: 'Pending' },
};

function Badge({ value }) {
  const cfg = STATUS_COLORS[value] || STATUS_COLORS.pending;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

function ApplicationRow({ item, onDecide, onSimulateClear, onAutoVerify, isPending = false }) {
  const [expanded, setExpanded] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [notes, setNotes] = useState('');
  const profile = item.mentor_profiles ?? item;

  async function decide(decision) {
    setDeciding(true);
    await onDecide(item.id, decision, notes);
    setDeciding(false);
  }

  async function simulateClear() {
    setDeciding(true);
    await onSimulateClear(profile.id);
    setDeciding(false);
  }

  async function autoVerify() {
    setDeciding(true);
    await onAutoVerify(profile.id);
    setDeciding(false);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#111118', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {profile.image_url ? (
          <img src={profile.image_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">{profile.name}</p>
            {item.checkr_result && <Badge value={item.checkr_result} />}
            {isPending && !item.checkr_result && <Badge value="pending" />}
            {profile.tier_dispute && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400">Dispute</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 truncate">{profile.title} · {profile.company}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.verification_score != null && (
            <span
              className="text-[10px] font-black tabular-nums"
              style={{ color: item.verification_score >= 75 ? '#22c55e' : item.verification_score >= 50 ? 'var(--color-primary)' : '#ef4444' }}
            >
              {item.verification_score}/100
            </span>
          )}
          {item.decided_at ? (
            <span className={`text-[10px] font-black uppercase tracking-wider ${item.decision === 'approve' ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.decision === 'approve' ? '✓ Approved' : '✗ Rejected'}
            </span>
          ) : isPending ? (
            <span className="text-[10px] font-semibold text-amber-400">Awaiting review</span>
          ) : null}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-stone-600 hover:text-stone-400 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <p className="text-stone-600 mb-0.5">Email</p>
              <p className="text-stone-300">{profile.email}</p>
            </div>
            <div>
              <p className="text-stone-600 mb-0.5">Experience</p>
              <p className="text-stone-300">{profile.years_experience ? `${profile.years_experience} yrs` : '—'}</p>
            </div>
            <div>
              <p className="text-stone-600 mb-0.5">Industry</p>
              <p className="text-stone-300">{profile.industry || '—'}</p>
            </div>
            <div>
              <p className="text-stone-600 mb-0.5">Applied</p>
              <p className="text-stone-300">
                {profile.application_submitted_at
                  ? new Date(profile.application_submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Assigned tier & rate */}
          {(profile.tier || profile.session_rate != null) && (
            <div className="flex items-center gap-4 rounded-xl bg-white/3 px-3 py-2.5 text-xs">
              <span className="text-stone-500">Assigned rate:</span>
              <span className="font-black text-white">${profile.session_rate ?? '—'}/hr</span>
              <span className="text-stone-500">Tier:</span>
              <span className={`font-bold capitalize ${profile.tier === 'elite' ? 'text-amber-400' : profile.tier === 'rising' ? 'text-emerald-400' : 'text-stone-400'}`}>
                {profile.tier ?? '—'}
              </span>
            </div>
          )}

          {/* Tier/rate dispute */}
          {profile.tier_dispute && (
            <div className="rounded-xl bg-red-500/8 border border-red-500/20 px-3 py-2.5 text-xs space-y-1">
              <p className="text-red-400 font-bold uppercase tracking-wider text-[9px]">⚠ Tier/rate dispute open</p>
              <p className="text-stone-300">Reason: {profile.tier_dispute.reason?.replace(/_/g, ' ')}</p>
              {profile.tier_dispute.preferred_rate && (
                <p className="text-stone-400">Requested: ${profile.tier_dispute.preferred_rate}/hr</p>
              )}
              {profile.tier_dispute.notes && (
                <p className="text-stone-400 italic">"{profile.tier_dispute.notes}"</p>
              )}
              <p className="text-stone-600">{profile.tier_dispute.submitted_at ? new Date(profile.tier_dispute.submitted_at).toLocaleDateString() : ''}</p>
            </div>
          )}

          {/* Social verification */}
          {profile.verification_data?.socialVerified ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-semibold capitalize">{profile.verification_data.socialVerified.provider} verified</span>
              <span className="text-stone-400">· @{profile.verification_data.socialVerified.username}</span>
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-sky-400 hover:text-sky-300">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ) : profile.verification_data?.socialSkipped ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/3 px-3 py-2.5 text-xs text-stone-500">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              No social network connected (skipped)
            </div>
          ) : profile.linkedin_url ? (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2.5 text-xs font-semibold text-sky-400 hover:bg-white/6 transition-colors">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {profile.linkedin_url}
            </a>
          ) : null}

          {/* Expertise tags */}
          {Array.isArray(profile.expertise) && profile.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.map((tag, i) => (
                <span key={i} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-semibold text-stone-400">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{profile.bio}</p>
          )}

          {/* Verification data */}
          {profile.verification_data && (Object.keys(profile.verification_data).length > 0) && (
            <div className="rounded-xl bg-white/3 px-3 py-2.5 space-y-2 text-xs">
              <p className="text-stone-500 font-semibold uppercase tracking-wider text-[9px]">Identity verification</p>
              {profile.verification_data.govIdNumber && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-stone-500 shrink-0" />
                  <span className="text-stone-500">Gov ID:</span>
                  <span className="font-mono text-stone-300">{profile.verification_data.govIdNumber}</span>
                </div>
              )}
              {profile.verification_data.govIdFileName && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-stone-500 shrink-0" />
                  <span className="text-stone-500">ID photo:</span>
                  <span className="text-stone-300">{profile.verification_data.govIdFileName}</span>
                </div>
              )}
              {profile.verification_data.faceFileName && (
                <div className="flex items-center gap-2">
                  <Camera className="h-3 w-3 text-stone-500 shrink-0" />
                  <span className="text-stone-500">Selfie:</span>
                  <span className="text-stone-300">{profile.verification_data.faceFileName}</span>
                </div>
              )}
            </div>
          )}

          {/* Checkr info */}
          {(item.checkr_result || profile.checkr_report_id) && (
            <div className="rounded-xl bg-white/3 px-3 py-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Checkr result</span>
                {item.checkr_result ? <Badge value={item.checkr_result} /> : <span className="text-stone-600">—</span>}
              </div>
              {profile.checkr_report_id && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Report ID</span>
                  <span className="font-mono text-stone-400 text-[10px]">{profile.checkr_report_id.slice(0, 16)}…</span>
                </div>
              )}
            </div>
          )}

          {/* Verification score breakdown */}
          {(item.verification_score != null || item.verification_breakdown) && (
            <div className="rounded-xl bg-white/3 px-3 py-2.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-stone-500 font-semibold uppercase tracking-wider text-[9px]">Algo verification score</p>
                <span className={`text-xs font-black ${item.verification_score >= 75 ? 'text-emerald-400' : item.verification_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {item.verification_score ?? '—'}/100
                  {item.auto_decision === 'auto_approved' && ' · Auto-approved'}
                  {item.auto_decision === 'flagged_review' && ' · Flagged for review'}
                  {item.auto_decision === 'auto_rejected' && ' · Auto-rejected'}
                </span>
              </div>
              {item.verification_breakdown && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  {Object.entries(item.verification_breakdown).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-1">
                      <span className="text-stone-600 truncate">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className={v > 0 ? 'text-emerald-400 font-bold' : 'text-stone-700'}>+{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Motivation essay */}
          {profile.verification_data?.motivationEssay && (
            <div className="rounded-xl bg-white/3 px-3 py-2.5 space-y-1 text-xs">
              <p className="text-stone-500 font-semibold uppercase tracking-wider text-[9px]">Why Bridge?</p>
              <p className="text-stone-400 leading-relaxed line-clamp-4">{profile.verification_data.motivationEssay}</p>
            </div>
          )}

          {/* Dev: auto-verify + simulate Checkr clear */}
          {isPending && (
            <div className="flex gap-2">
              <button
                onClick={autoVerify}
                disabled={deciding}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/8 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/15 transition-colors disabled:opacity-50"
              >
                <Bot className="h-3.5 w-3.5" />
                {deciding ? 'Running…' : 'Auto-verify (dev)'}
              </button>
              <button
                onClick={simulateClear}
                disabled={deciding}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/15 transition-colors disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5" />
                {deciding ? 'Simulating…' : 'Manual → review'}
              </button>
            </div>
          )}

          {/* Approve / Reject */}
          {!item.decided_at && !isPending && (
            <div className="space-y-2 pt-1">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes (visible to team)…"
                rows={2}
                className="w-full resize-none rounded-xl bg-white/4 px-3 py-2 text-xs text-white placeholder:text-stone-600 outline-none focus:ring-1 focus:ring-white/15"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => decide('approve')}
                  disabled={deciding}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {deciding ? 'Saving…' : 'Approve'}
                </button>
                <button
                  onClick={() => decide('reject')}
                  disabled={deciding}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/12 border border-red-500/25 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {deciding ? 'Saving…' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DevMentorQueue() {
  const [tab, setTab] = useState('ready');
  const [readyItems, setReadyItems] = useState([]);
  const [awaitingItems, setAwaitingItems] = useState([]);
  const [decidedItems, setDecidedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [r1, r2, r3] = await Promise.all([
      devFetch('/mentor-queue?status=pending').then(r => r.json()).catch(() => ({ items: [] })),
      devFetch('/mentor-queue/pending-profiles').then(r => r.json()).catch(() => ({ items: [] })),
      devFetch('/mentor-queue?status=all').then(r => r.json()).catch(() => ({ items: [] })),
    ]);
    setReadyItems(r1.items || []);
    setAwaitingItems(r2.items || []);
    setDecidedItems((r3.items || []).filter(i => i.decision));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleDecide(queueId, decision, notes) {
    const r = await devFetch('/mentor-queue/decide', {
      method: 'POST',
      body: JSON.stringify({ queueId, decision, notes }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) { setError(json.error || `Request failed (${r.status})`); return; }
    setTab('decided');
    await loadAll();
  }

  async function handleSimulateClear(mentorProfileId) {
    const r = await devFetch('/mentor-queue/simulate-clear', {
      method: 'POST',
      body: JSON.stringify({ mentorProfileId }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) { setError(json.error || `Request failed (${r.status})`); return; }
    setTab('ready');
    await loadAll();
  }

  async function handleAutoVerify(mentorProfileId) {
    const r = await devFetch('/mentor-queue/auto-verify', {
      method: 'POST',
      body: JSON.stringify({ mentorProfileId }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) { setError(json.error || `Request failed (${r.status})`); return; }
    if (json.autoDecision === 'flagged_review') setTab('ready');
    else if (json.autoDecision) setTab('decided');
    await loadAll();
  }

  const tabs = [
    { id: 'ready', label: 'Ready for Review', count: readyItems.length, icon: ShieldCheck },
    { id: 'awaiting', label: 'Awaiting Checkr', count: awaitingItems.length, icon: Clock },
    { id: 'decided', label: 'Decided', count: decidedItems.length, icon: CheckCircle },
  ];

  const currentItems =
    tab === 'ready' ? readyItems :
    tab === 'awaiting' ? awaitingItems :
    decidedItems;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-400">Review and approve mentor applications after background checks complete.</p>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/8 px-3 py-2 text-xs font-semibold text-stone-400 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 transition-colors text-base leading-none">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/4 p-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                active ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${active ? 'bg-orange-500/25 text-orange-300' : 'bg-white/8 text-stone-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && currentItems.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-stone-600 text-sm">Loading…</div>
      ) : currentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-stone-600" />
          </div>
          <p className="text-sm font-semibold text-stone-500">Nothing here</p>
          <p className="text-xs text-stone-700">
            {tab === 'ready' ? 'No applications ready for review.' :
             tab === 'awaiting' ? 'No mentors waiting on Checkr results.' :
             'No decisions made yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map(item => (
            <ApplicationRow
              key={item.id}
              item={item}
              isPending={tab === 'awaiting'}
              onDecide={handleDecide}
              onSimulateClear={handleSimulateClear}
              onAutoVerify={handleAutoVerify}
            />
          ))}
        </div>
      )}
    </div>
  );
}
