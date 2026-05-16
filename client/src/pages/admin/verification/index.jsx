// Admin verification queue. Split-pane layout: queue list on the left, full
// detail (evidence / AI notes / references / activity) on the right.
//
// Auth: relies on /api/admin/review-list returning 404 for non-admins. We
// don't gate the route client-side; the API is the source of truth.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import supabase from '../../../api/supabase';
import TierBadge from '../../onboarding/mentor/verify/components/TierBadge.jsx';
import TestModeChip from '../../onboarding/mentor/verify/components/TestModeChip.jsx';
import { COMPONENT_LABELS, COMPONENT_WEIGHTS } from '../../onboarding/mentor/verify/scoring.js';
import { useContent } from '../../../content';

const TABS = ['evidence', 'ai_notes', 'references', 'activity'];

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getJson(path) {
  const res = await fetch(path, { headers: { ...(await authHeaders()) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
  return { ok: true, ...data };
}
async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
  return { ok: true, ...data };
}

export default function AdminVerification() {
  const { s } = useContent();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const r = await getJson(`/api/admin/review-list?status=${encodeURIComponent(filter)}`);
    setLoading(false);
    if (!r.ok) {
      if (r.error === 'Not found') setError('You don\'t have access to this page.');
      else setError(r.error);
      setItems([]);
      return;
    }
    setItems(r.items || []);
    if ((r.items || []).length > 0 && !selectedId) setSelectedId(r.items[0].id);
  }, [filter, selectedId]);

  useEffect(() => { load(); }, [load]);

  const loadDetail = useCallback(async (id) => {
    if (!id) { setDetail(null); return; }
    setDetailLoading(true);
    const r = await getJson(`/api/admin/review-detail?id=${encodeURIComponent(id)}`);
    setDetailLoading(false);
    if (r.ok) setDetail(r);
  }, []);
  useEffect(() => { loadDetail(selectedId); }, [selectedId, loadDetail]);

  return (
    <div className="mx-auto flex h-[calc(100vh-5.25rem)] max-w-[1500px] gap-4 px-4 py-6 sm:px-6">
      <TestModeChip />

      <aside className="flex w-[360px] shrink-0 flex-col gap-3">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-xl font-black" style={{ color: 'var(--bridge-text)' }}>
            {s.admin.verificationQueue}
          </h1>
          <ShieldCheck className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
        </header>

        <div
          className="inline-flex items-center gap-1 rounded-full p-1"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          {['pending', 'approve', 'reject', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setFilter(f); setSelectedId(null); }}
              className="bridge-focus rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{
                backgroundColor: filter === f ? 'var(--bridge-surface)' : 'transparent',
                color: filter === f ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                boxShadow: filter === f ? 'inset 0 0 0 1px var(--bridge-border-strong)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <section className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>Loading…</p>
          ) : error ? (
            <p className="text-[12px]" style={{ color: 'var(--color-error)' }}>{error}</p>
          ) : items.length === 0 ? (
            <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>Nothing in this filter.</p>
          ) : items.map((it) => (
            <QueueRow
              key={it.id}
              item={it}
              active={selectedId === it.id}
              onClick={() => setSelectedId(it.id)}
            />
          ))}
        </section>
      </aside>

      <section
        className="flex min-w-0 flex-1 flex-col rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {detailLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
          </div>
        ) : !detail ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>Select a queue item.</p>
          </div>
        ) : (
          <DetailPane detail={detail} onDecided={() => { setDetail(null); load(); }} />
        )}
      </section>
    </div>
  );
}

function QueueRow({ item, active, onClick }) {
  const run = item.mentor_verification_runs;
  const profile = run?.mentor_profiles;
  return (
    <button
      type="button"
      onClick={onClick}
      className="bridge-focus group flex items-center gap-3 rounded-2xl p-3 text-left transition-colors"
      style={{
        backgroundColor: active ? 'var(--bridge-canvas)' : 'var(--bridge-surface)',
        boxShadow: `inset 0 0 0 1px ${active ? 'var(--bridge-border-strong)' : 'var(--bridge-border)'}`,
      }}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
        {profile?.image_url ? (
          <img src={profile.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[12px] font-black" style={{ color: 'var(--bridge-text-secondary)' }}>
            {(profile?.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
          {profile?.name || 'Unknown mentor'}
        </p>
        <p className="truncate text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {item.reason}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <TierBadge tier={run?.tier || 'bronze'} size="sm" showLabel={false} />
        <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
          {run?.score ?? 0}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
    </button>
  );
}

function DetailPane({ detail, onDecided }) {
  const { queue, steps, references } = detail;
  const run = queue.mentor_verification_runs;
  const profile = run?.mentor_profiles;
  const [tab, setTab] = useState('evidence');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header
        className="flex flex-wrap items-center justify-between gap-3 border-b p-5"
        style={{ borderColor: 'var(--bridge-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
            {profile?.image_url ? (
              <img src={profile.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[13px] font-black" style={{ color: 'var(--bridge-text-secondary)' }}>
                {(profile?.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}
              </span>
            )}
          </div>
          <div>
            <p className="text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>{profile?.name || 'Unknown mentor'}</p>
            <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
              {[profile?.title, profile?.company].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={run?.tier || 'bronze'} size="lg" />
          <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {run?.score ?? 0}/100
          </span>
        </div>
      </header>

      <nav
        className="flex shrink-0 items-center gap-1 border-b px-3 pt-3"
        style={{ borderColor: 'var(--bridge-border)' }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="bridge-focus rounded-t-md px-3 py-1.5 text-[12px] font-bold capitalize transition-colors"
            style={{
              color: tab === t ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
              borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`,
            }}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-5">
        {tab === 'evidence'    ? <EvidenceTab steps={steps} /> : null}
        {tab === 'ai_notes'    ? <AiNotesTab steps={steps} /> : null}
        {tab === 'references'  ? <ReferencesTab references={references} /> : null}
        {tab === 'activity'    ? <ActivityTab queue={queue} steps={steps} /> : null}
      </main>

      <DecisionBar queueId={queue.id} alreadyDecided={!!queue.decision} onDecided={onDecided} />
    </div>
  );
}

function EvidenceTab({ steps }) {
  return (
    <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--bridge-border)' }}>
      {Object.keys(COMPONENT_WEIGHTS).map((c) => {
        const step = (steps || []).filter((s) => s.component === c).pop();
        const weight = COMPONENT_WEIGHTS[c];
        return (
          <li key={c} className="flex items-center justify-between py-2.5">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                {COMPONENT_LABELS[c]}
              </span>
              {step?.payload ? (
                <span className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
                  {summarizePayload(c, step.payload)}
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: 'var(--bridge-text-faint)' }}>No submission</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={step?.status || 'pending'} />
              <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
                {step?.score ?? 0} / {weight}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AiNotesTab({ steps }) {
  const withEval = (steps || []).filter((s) => s.evaluation);
  if (withEval.length === 0) return <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>No AI evaluations recorded.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {withEval.map((s) => (
        <li key={s.id} className="rounded-2xl p-3" style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
          <p className="text-[12px] font-bold" style={{ color: 'var(--bridge-text)' }}>{COMPONENT_LABELS[s.component] || s.component}</p>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] font-mono" style={{ color: 'var(--bridge-text-secondary)' }}>
{JSON.stringify(s.evaluation, null, 2)}
          </pre>
        </li>
      ))}
    </ul>
  );
}

function ReferencesTab({ references }) {
  if (!references || references.length === 0) {
    return <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>No references submitted yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {references.map((r) => (
        <li key={r.id} className="rounded-2xl p-3" style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
              {r.reference_name || r.reference_email}
            </p>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
              {r.rating ?? '–'}/5 · auth {r.ai_authenticity_score ?? '–'}/10
            </span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {r.relationship || 'unknown'} · {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : 'pending'}
          </p>
          {r.comments ? (
            <p className="mt-2 text-[12px]" style={{ color: 'var(--bridge-text-secondary)' }}>"{r.comments}"</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ActivityTab({ queue, steps }) {
  const events = [
    { ts: queue.created_at, label: 'Queue item created', body: queue.reason },
    ...(steps || []).map((s) => ({ ts: s.decided_at || s.created_at, label: `${COMPONENT_LABELS[s.component] || s.component} → ${s.status}`, body: `${s.score}/${s.weight}` })),
    queue.decided_at ? { ts: queue.decided_at, label: `Decision: ${queue.decision}`, body: queue.decision_notes || '' } : null,
  ].filter(Boolean).sort((a, b) => new Date(b.ts) - new Date(a.ts));

  return (
    <ul className="flex flex-col gap-2">
      {events.map((e, i) => (
        <li key={i} className="flex items-start gap-3">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
          <div className="min-w-0">
            <p className="text-[12px] font-bold" style={{ color: 'var(--bridge-text)' }}>{e.label}</p>
            {e.body ? <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>{e.body}</p> : null}
            <p className="text-[10px]" style={{ color: 'var(--bridge-text-faint)' }}>{e.ts ? new Date(e.ts).toLocaleString() : ''}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DecisionBar({ queueId, alreadyDecided, onDecided }) {
  const { s } = useContent();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  if (alreadyDecided) {
    return (
      <footer className="border-t p-4 text-[12px]" style={{ borderColor: 'var(--bridge-border)', color: 'var(--bridge-text-muted)' }}>
        Already decided. The audit trail is locked.
      </footer>
    );
  }

  async function decide(decision) {
    setBusy(true); setError(null);
    const r = await postJson('/api/admin/review-decide', { queueId, decision, notes: notes || undefined });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    onDecided?.();
  }

  return (
    <footer className="flex flex-col gap-2 border-t p-4" style={{ borderColor: 'var(--bridge-border)' }}>
      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Decision notes (optional, visible in the audit trail)"
        className="bridge-focus w-full rounded-xl px-3 py-2 text-[13px] outline-none"
        style={{
          backgroundColor: 'var(--bridge-canvas)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text)',
        }}
      />
      {error ? (
        <p className="text-[12px]" style={{ color: 'var(--color-error)' }}>{error}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => decide('request_more_info')}
          disabled={busy}
          className="bridge-focus rounded-full px-4 py-1.5 text-[12px] font-bold disabled:opacity-50"
          style={{ backgroundColor: 'transparent', color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
        >
          {s.admin.requestMoreInfo}
        </button>
        <button
          type="button"
          onClick={() => decide('reject')}
          disabled={busy}
          className="bridge-focus rounded-full px-4 py-1.5 text-[12px] font-bold disabled:opacity-50"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 14%, transparent)', color: 'var(--color-error)' }}
        >
          {s.admin.reject}
        </button>
        <button
          type="button"
          onClick={() => decide('approve')}
          disabled={busy}
          className="bridge-focus rounded-full px-5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {s.admin.approve}
        </button>
      </div>
    </footer>
  );
}

function StatusPill({ status }) {
  const { s } = useContent();
  const map = {
    passed:        { bg: 'color-mix(in srgb, var(--color-success, #16a34a) 14%, transparent)', fg: 'var(--color-success, #16a34a)', label: s.onboardingVerify.pillPassed },
    failed:        { bg: 'color-mix(in srgb, var(--color-error) 14%, transparent)',           fg: 'var(--color-error)',             label: s.onboardingVerify.pillFailed },
    manual_review: { bg: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',         fg: 'var(--color-warning)',           label: s.onboardingVerify.pillReview },
    pending:       { bg: 'var(--bridge-surface-muted)',                                       fg: 'var(--bridge-text-muted)',       label: s.onboardingVerify.pillPending },
  };
  const style = map[status] || map.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}

function summarizePayload(component, p) {
  if (!p) return '';
  switch (component) {
    case 'identity':           return `${p.phone || ''} · ${p.email || ''}`;
    case 'gov_id':             return `${p.id_filename || ''} + ${p.selfie_filename || ''}`;
    case 'professional_email': return p.domain ? `@${p.domain}` : (p.email || '');
    case 'linkedin':           return p.url || '';
    case 'resume_ai':          return p.filename || `${p.length || 0} chars`;
    case 'expertise_interview':return `${p.transcript_length || 0} chars`;
    case 'reference':          return `${p.count || 0} refs · avg ${Number(p.avg_rating || 0).toFixed(1)}`;
    case 'track_record':       return `${p.total_sessions || 0} sessions · ${Number(p.rating || 0).toFixed(2)}★`;
    default:                   return '';
  }
}
