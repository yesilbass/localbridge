import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, CheckCircle2, User, Briefcase,
  GraduationCap, Tag, Loader2, X, Plus, ShieldCheck, CreditCard, Camera,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import {
  getMentorOnboardingProfile,
  updateMentorProfile,
} from '../api/mentorOnboarding';

/* ─── Constants ────────────────────────────────────────────────────────────── */

const INDUSTRIES = ['technology', 'finance', 'healthcare', 'education', 'marketing', 'design', 'other'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

/* ─── Shared style tokens ───────────────────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] transition focus:border-amber-400 focus:bg-[var(--bridge-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/30';

const labelCls =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]';

const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-amber-400/30';

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function tierBadgeClasses(tier) {
  switch (tier) {
    case 'professional': return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
    case 'senior':       return 'bg-sky-50 text-sky-800 border border-sky-200/80';
    case 'elite':        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm';
    default:             return 'bg-stone-100 text-stone-600'; // rising
  }
}

function formatIndustry(s) {
  if (!s?.trim()) return null;
  return s.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function Card({ children, footer }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-[0_24px_60px_-12px_color-mix(in srgb, var(--color-secondary) 10%, transparent)]">
      <div className="space-y-5 p-8">{children}</div>
      {footer && <div className="border-t border-[var(--bridge-border)] px-8 py-5">{footer}</div>}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-[var(--bridge-border)]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--bridge-text)]">{label}</p>
        {sub && <p className="text-xs text-[var(--bridge-text-muted)]">{sub}</p>}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function NextBtn({ onClick, disabled, loading, label = 'Continue' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {loading ? 'Processing…' : label}
      {!loading && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="rounded-xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900" role="alert">
      {msg}
    </div>
  );
}

/* ─── Tag input ─────────────────────────────────────────────────────────────── */

function TagInput({ tags, onChange, max = 8, placeholder = 'Type and press Enter…' }) {
  const [val, setVal] = useState('');

  function commit(raw) {
    const t = raw.trim();
    if (t && !tags.includes(t) && tags.length < max) onChange([...tags, t]);
    setVal('');
  }

  return (
    <div className="min-h-[3rem] rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/30">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="rounded-full text-amber-500 hover:text-amber-900">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(val); }
            else if (e.key === 'Backspace' && !val && tags.length > 0) onChange(tags.slice(0, -1));
          }}
          onBlur={() => val && commit(val)}
          placeholder={tags.length === 0 ? placeholder : tags.length < max ? 'Add more…' : `Max ${max} tags`}
          disabled={tags.length >= max}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] focus:outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}

/* ─── Work experience row ───────────────────────────────────────────────────── */

function WorkExpRow({ job, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Job title</label>
          <input type="text" value={job.title} onChange={(e) => onChange({ ...job, title: e.target.value })} className={inputCls} placeholder="Senior Engineer" />
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <input type="text" value={job.company} onChange={(e) => onChange({ ...job, company: e.target.value })} className={inputCls} placeholder="Acme Inc." />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Start year</label>
          <select value={job.start_year} onChange={(e) => onChange({ ...job, start_year: Number(e.target.value) })} className={inputCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>End year</label>
          <select value={job.end_year ?? ''} onChange={(e) => onChange({ ...job, end_year: e.target.value === '' ? null : Number(e.target.value) })} className={inputCls}>
            <option value="">Present</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onRemove} className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition">
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
      <div>
        <label className={labelCls}>One-line description</label>
        <input type="text" value={job.description} onChange={(e) => onChange({ ...job, description: e.target.value })} className={inputCls} placeholder="Led a team of 8 engineers to ship the payments platform…" />
      </div>
    </div>
  );
}

/* ─── Education row ─────────────────────────────────────────────────────────── */

function EduRow({ edu, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>School</label>
          <input type="text" value={edu.school} onChange={(e) => onChange({ ...edu, school: e.target.value })} className={inputCls} placeholder="MIT" />
        </div>
        <div>
          <label className={labelCls}>Degree</label>
          <input type="text" value={edu.degree} onChange={(e) => onChange({ ...edu, degree: e.target.value })} className={inputCls} placeholder="B.S. Computer Science" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Graduation year</label>
          <select value={edu.year} onChange={(e) => onChange({ ...edu, year: Number(e.target.value) })} className={inputCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-end">
          <button type="button" onClick={onRemove} className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition">
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile preview panel ─────────────────────────────────────────────────── */

function ProfilePreview({ data }) {
  const industryLabel = formatIndustry(data.industry);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-bold text-amber-700">
            {(data.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[var(--bridge-text)]">{data.name || '—'}</h2>
            <p className="text-sm text-[var(--bridge-text-secondary)]">
              {data.title}{data.company ? ` · ${data.company}` : ''}
            </p>
            {data.location && <p className="mt-1 text-xs text-[var(--bridge-text-muted)]">📍 {data.location}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {industryLabel && (
                <span className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900">
                  {industryLabel}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tierBadgeClasses('rising')}`}>
                Rising
              </span>
            </div>
          </div>
          {data.session_rate && (
            <div className="text-right">
              <p className="text-xs text-[var(--bridge-text-muted)]">Per session</p>
              <p className="text-2xl font-bold text-[var(--bridge-text)]">${data.session_rate}</p>
            </div>
          )}
        </div>
      </div>

      {data.bio && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-2">About</p>
          <p className="text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{data.bio}</p>
        </div>
      )}

      {data.expertise?.length > 0 && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-3">Expertise</p>
          <div className="flex flex-wrap gap-2">
            {data.expertise.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {data.work_experience?.length > 0 && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-4">Experience</p>
          <div className="space-y-4">
            {[...data.work_experience].sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)).map((job, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                  <Briefcase className="h-3.5 w-3.5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--bridge-text)]">{job.title}</p>
                  <p className="text-xs text-[var(--bridge-text-secondary)]">
                    {job.company} · {job.start_year}–{job.end_year ?? 'Present'}
                  </p>
                  {job.description && <p className="mt-1 text-xs text-[var(--bridge-text-muted)]">{job.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education?.length > 0 && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-4">Education</p>
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                  <GraduationCap className="h-3.5 w-3.5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--bridge-text)]">{edu.school}</p>
                  <p className="text-xs text-[var(--bridge-text-muted)]">{edu.degree} · {edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.languages?.length > 0 || data.years_experience) && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-3">Details</p>
          <dl className="space-y-2 text-sm">
            {data.years_experience && (
              <div className="flex justify-between">
                <dt className="text-[var(--bridge-text-muted)]">Experience</dt>
                <dd className="font-medium text-[var(--bridge-text)]">{data.years_experience} years</dd>
              </div>
            )}
            {data.languages?.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--bridge-text-muted)]">Languages</dt>
                <dd className="font-medium text-[var(--bridge-text)]">{data.languages.join(', ')}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SCREEN META
═══════════════════════════════════════════════════════════════════════════════ */

const SCREEN_META = {
  'app-1':     { title: 'Apply to become a mentor',   sub: 'Tell us about your professional background.' },
  'app-2':     { title: 'Verify your identity',       sub: 'We verify all mentors to keep Bridge trustworthy.' },
  'app-3':     { title: 'Why do you want to mentor?', sub: 'This essay is scored algorithmically.' },
  'profile-1': { title: 'Complete your profile',      sub: 'Your application was approved. You\'re almost live.' },
  'profile-2': { title: 'Skills & presence',          sub: 'Help mentees find the right match.' },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */

export default function MentorOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMentor = user?.user_metadata?.role === 'mentor';

  const [screen, setScreen] = useState('app-1');
  const [profileId, setProfileId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Application data
  const [appForm, setAppForm] = useState({
    name: '', years_experience: '',
    work_experience: [], education: [],
  });

  // Verification data
  const [verifyData, setVerifyData] = useState({
    govIdNumber: '', govIdFileName: '', faceFileName: '',
    socialVerified: null, socialSkipped: false, motivationEssay: '',
  });

  // Profile completion data (phase 2)
  const [profileForm, setProfileForm] = useState({
    title: '', company: '', industry: 'technology', location: '',
    bio: '', expertise: [], languages: [], image_url: '',
  });
  // Algorithm-assigned values — read-only for the mentor
  const [assignedTier, setAssignedTier] = useState(null);
  const [assignedRate, setAssignedRate] = useState(null);
  const [bioLoading, setBioLoading] = useState(false);

  // Social verify modal
  const [socialModal, setSocialModal] = useState(null);
  const [socialInput, setSocialInput] = useState('');

  /* ── Load existing profile ── */
  useEffect(() => {
    if (authLoading || !user || !isMentor) return;
    void (async () => {
      try {
        const profile = await getMentorOnboardingProfile(user.id);
        if (!profile) { setLoadingProfile(false); return; }

        if (profile.onboarding_complete && profile.mentor_status !== 'rejected') {
          navigate('/dashboard', { replace: true }); return;
        }

        setProfileId(profile.id);

        if (profile.mentor_status === 'active' && !profile.onboarding_complete) {
          setProfileForm((p) => ({
            ...p,
            title:         profile.title && profile.title !== 'Mentor' ? profile.title : '',
            company:       profile.company ?? '',
            industry:      profile.industry ?? 'technology',
            location:      profile.location ?? '',
            bio:           profile.bio ?? '',
            expertise:     Array.isArray(profile.expertise) ? profile.expertise : [],
            languages:     Array.isArray(profile.languages) ? profile.languages : [],
            image_url:     profile.image_url ?? '',
          }));
          setAssignedTier(profile.tier ?? null);
          setAssignedRate(profile.session_rate ?? null);
          go('profile-1');
        } else {
          setAppForm((p) => ({
            ...p,
            name:             profile.name ?? '',
            years_experience: profile.years_experience ? String(profile.years_experience) : '',
            work_experience:  Array.isArray(profile.work_experience) ? profile.work_experience : [],
            education:        Array.isArray(profile.education) ? profile.education : [],
          }));
          go('app-1');
        }
      } catch (err) {
        setError(err.message ?? 'Could not load profile.');
      } finally {
        setLoadingProfile(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isMentor]);

  /* ── Guards ── */
  if (authLoading || loadingProfile) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner message="Loading…" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isMentor) return <Navigate to="/dashboard" replace />;

  /* ── Helpers ── */
  function go(s) {
    setError('');
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function patchApp(patch) { setAppForm((p) => ({ ...p, ...patch })); setError(''); }
  function patchProfile(patch) { setProfileForm((p) => ({ ...p, ...patch })); setError(''); }

  /* ── Phase 1 submit ── */
  async function handleSubmitApplication() {
    setSaving(true);
    try {
      await updateMentorProfile(profileId, {
        name:             appForm.name.trim(),
        years_experience: appForm.years_experience ? Number(appForm.years_experience) : null,
        work_experience:  appForm.work_experience,
        education:        appForm.education,
      });
      const serverUrl = import.meta.env.VITE_SERVER_URL ?? '';
      const { data: { session } } = await (await import('../api/supabase')).default.auth.getSession();
      await fetch(`${serverUrl}/api/verification/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ verificationData: verifyData }),
      }).catch(() => {});
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Failed to submit. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Phase 2 submit ── */
  async function handleCompleteProfile() {
    setSaving(true);
    try {
      await updateMentorProfile(profileId, {
        ...profileForm,
        available:          true,
        onboarding_complete: true,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Draft bio with AI ── */
  async function handleDraftBio() {
    setBioLoading(true);
    try {
      const { polishMentorProfile } = await import('../api/ai');
      const result = await polishMentorProfile(
        `Work: ${JSON.stringify(appForm.work_experience)}. Motivation: ${verifyData.motivationEssay}`,
        appForm.work_experience,
      );
      if (result?.bio) patchProfile({ bio: result.bio });
    } catch {}
    setBioLoading(false);
  }

  /* ── Live score (app-3) ── */
  const essayWords = verifyData.motivationEssay.trim().split(/\s+/).filter(Boolean).length;
  const CURRENT_YR = new Date().getFullYear();
  let coveredYrs = 0, workDatesOk = true;
  for (const job of appForm.work_experience) {
    const s = Number(job.start_year), e = job.end_year ? Number(job.end_year) : CURRENT_YR;
    if (isNaN(s) || s < 1950 || s > CURRENT_YR || e < s) { workDatesOk = false; continue; }
    coveredYrs += e - s;
  }
  const claimedYrs = Number(appForm.years_experience) || 0;
  const yearDelta = Math.abs(coveredYrs - claimedYrs);
  const yearsOk = appForm.work_experience.length > 0 && workDatesOk && yearDelta <= Math.max(3, claimedYrs * 0.4);
  const eduSane = appForm.education.length === 0 || appForm.education.every((e) => {
    const yr = Number(e.year); return e.school?.trim().length >= 2 && (!e.year || (yr >= 1950 && yr <= CURRENT_YR));
  });
  const liveScore = Math.max(0,
    (verifyData.govIdNumber.trim() ? 15 : 0) +
    (verifyData.govIdFileName ? 8 : 0) +
    (verifyData.faceFileName ? 5 : 0) +
    (verifyData.socialVerified ? 15 : 0) +
    (appForm.work_experience.length >= 2 ? 12 : appForm.work_experience.length >= 1 ? 8 : 0) +
    (yearsOk ? 8 : (workDatesOk && appForm.work_experience.length > 0) ? 3 : 0) +
    (eduSane && appForm.education.length >= 1 ? 8 : 0) +
    (profileForm.expertise.length >= 5 ? 5 : profileForm.expertise.length >= 3 ? 3 : profileForm.expertise.length >= 1 ? 1 : 0) +
    (essayWords >= 150 ? 12 : essayWords >= 100 ? 8 : essayWords >= 50 ? 4 : 0) +
    ((!yearsOk && appForm.work_experience.length > 0 && yearDelta > claimedYrs * 0.6) ? -10 : (!yearsOk && appForm.work_experience.length > 0) ? -5 : 0) +
    ((!eduSane && appForm.education.length > 0) ? -5 : 0)
  );
  const scoreColor = liveScore >= 75 ? '#22c55e' : liveScore >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = liveScore >= 75 ? 'Likely approved' : liveScore >= 50 ? 'May need review' : 'Low — add more info';

  const canSubmitApp = verifyData.govIdNumber.trim() && (verifyData.socialVerified || verifyData.socialSkipped) && essayWords >= 50;

  const meta = SCREEN_META[screen];

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <main className="relative min-h-screen bg-[var(--bridge-canvas)]" aria-label="Mentor onboarding">
      <PageGutterAtmosphere />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-amber-200/90 bg-[var(--bridge-surface)]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-sm">
            {['profile-1', 'profile-2'].includes(screen) ? 'Profile setup' : 'Mentor application'}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--bridge-text-muted)]">
            {meta.sub}
          </p>
        </div>

        {/* Step dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(['app-1', 'app-2', 'app-3'].includes(screen)
            ? ['app-1', 'app-2', 'app-3']
            : ['profile-1', 'profile-2']
          ).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === screen ? 'w-6 bg-amber-500' : 'w-2 bg-[var(--bridge-border)]'
              }`}
            />
          ))}
        </div>

        <ErrorBanner msg={error} />
        {error && <div className="mb-4" />}

        {/* ══════════════════════════════════════════════════════
            APP-1: Personal background
        ══════════════════════════════════════════════════════ */}
        {screen === 'app-1' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => navigate('/dashboard')} />
                <NextBtn
                  onClick={() => {
                    if (!appForm.name.trim()) { setError('Please enter your full name.'); return; }
                    if (appForm.work_experience.length === 0) { setError('Please add at least one work experience entry.'); return; }
                    go('app-2');
                  }}
                  label="Continue"
                />
              </div>
            }
          >
            <SectionHeader icon={User} label="Personal background" sub="Step 1 of 3" />

            <div>
              <label className={labelCls}>Full name *</label>
              <input
                type="text"
                value={appForm.name}
                onChange={(e) => patchApp({ name: e.target.value })}
                className={inputCls}
                placeholder="Alex Rivera"
                autoComplete="name"
              />
            </div>

            <div>
              <label className={labelCls}>Years of experience</label>
              <input
                type="number"
                min="0"
                max="60"
                value={appForm.years_experience}
                onChange={(e) => patchApp({ years_experience: e.target.value })}
                className={inputCls}
                placeholder="8"
              />
            </div>

            <div className="space-y-3">
              <SectionHeader icon={Briefcase} label="Work experience" sub="Up to 3 positions" />
              {appForm.work_experience.map((job, i) => (
                <WorkExpRow
                  key={i}
                  job={job}
                  onChange={(updated) => {
                    const arr = [...appForm.work_experience];
                    arr[i] = updated;
                    patchApp({ work_experience: arr });
                  }}
                  onRemove={() => patchApp({ work_experience: appForm.work_experience.filter((_, j) => j !== i) })}
                />
              ))}
              {appForm.work_experience.length < 3 && (
                <button
                  type="button"
                  onClick={() => patchApp({
                    work_experience: [
                      ...appForm.work_experience,
                      { title: '', company: '', start_year: CURRENT_YEAR - 1, end_year: null, description: '' },
                    ],
                  })}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--bridge-border)] py-3 text-sm font-semibold text-[var(--bridge-text-muted)] transition hover:border-amber-400 hover:text-amber-600 ${focusRing}`}
                >
                  <Plus className="h-4 w-4" /> Add job
                </button>
              )}
              {appForm.work_experience.length === 0 && (
                <p className="text-center text-xs text-[var(--bridge-text-faint)]">At least one position is required.</p>
              )}
            </div>

            <div className="space-y-3">
              <SectionHeader icon={GraduationCap} label="Education" sub="Up to 2 entries (optional)" />
              {appForm.education.map((edu, i) => (
                <EduRow
                  key={i}
                  edu={edu}
                  onChange={(updated) => {
                    const arr = [...appForm.education];
                    arr[i] = updated;
                    patchApp({ education: arr });
                  }}
                  onRemove={() => patchApp({ education: appForm.education.filter((_, j) => j !== i) })}
                />
              ))}
              {appForm.education.length < 2 && (
                <button
                  type="button"
                  onClick={() => patchApp({
                    education: [...appForm.education, { school: '', degree: '', year: CURRENT_YEAR - 4 }],
                  })}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--bridge-border)] py-3 text-sm font-semibold text-[var(--bridge-text-muted)] transition hover:border-amber-400 hover:text-amber-600 ${focusRing}`}
                >
                  <Plus className="h-4 w-4" /> Add education
                </button>
              )}
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            APP-2: Identity proof
        ══════════════════════════════════════════════════════ */}
        {screen === 'app-2' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('app-1')} />
                <NextBtn
                  onClick={() => {
                    if (!verifyData.govIdNumber.trim()) { setError('Please enter your government ID number.'); return; }
                    if (!verifyData.socialVerified && !verifyData.socialSkipped) { setError('Please verify a social account or select the skip option.'); return; }
                    go('app-3');
                  }}
                  label="Continue"
                />
              </div>
            }
          >
            <SectionHeader icon={ShieldCheck} label="Identity proof" sub="Step 2 of 3" />

            <div className="rounded-xl border border-amber-200/50 bg-amber-50/60 px-4 py-3 text-xs text-amber-900 flex items-center justify-between gap-3">
              <span><strong>Test mode:</strong> Any values work — gov ID can be anything, LinkedIn just needs any username.</span>
              <button
                type="button"
                onClick={() => setVerifyData({
                  govIdNumber: 'DL-TEST-' + Math.floor(Math.random() * 90000 + 10000),
                  govIdFileName: 'test-id-front.jpg',
                  faceFileName: 'test-selfie.jpg',
                  socialVerified: { provider: 'linkedin', username: 'test-user-' + Math.floor(Math.random() * 9000 + 1000), displayName: appForm.name || 'Test User' },
                  socialSkipped: false,
                  motivationEssay: verifyData.motivationEssay,
                })}
                className="shrink-0 rounded-lg border border-amber-400 bg-amber-400/20 px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:bg-amber-400/30 transition-colors whitespace-nowrap"
              >
                Fill test data
              </button>
            </div>

            {/* Gov ID number */}
            <div>
              <label className={labelCls}>Government ID number *</label>
              <input
                type="text"
                value={verifyData.govIdNumber}
                onChange={(e) => setVerifyData((v) => ({ ...v, govIdNumber: e.target.value }))}
                className={inputCls}
                placeholder="Driver's licence, passport, state ID — e.g. DL-TEST-12345"
              />
            </div>

            {/* Photo uploads */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}><CreditCard className="inline h-3 w-3 mr-1" />Photo of ID</label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-4 text-center transition hover:border-amber-400">
                  <CreditCard className="h-5 w-5 text-[var(--bridge-text-faint)]" />
                  <span className="text-xs text-[var(--bridge-text-muted)]">
                    {verifyData.govIdFileName
                      ? <span className="font-semibold text-[var(--bridge-text)] break-all">{verifyData.govIdFileName}</span>
                      : 'JPEG, PNG, PDF'}
                  </span>
                  <input type="file" accept="image/*,.pdf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setVerifyData((v) => ({ ...v, govIdFileName: f.name })); }} />
                </label>
              </div>
              <div>
                <label className={labelCls}><Camera className="inline h-3 w-3 mr-1" />Selfie / face scan</label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-4 text-center transition hover:border-amber-400">
                  <Camera className="h-5 w-5 text-[var(--bridge-text-faint)]" />
                  <span className="text-xs text-[var(--bridge-text-muted)]">
                    {verifyData.faceFileName
                      ? <span className="font-semibold text-[var(--bridge-text)] break-all">{verifyData.faceFileName}</span>
                      : 'Clear face photo'}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setVerifyData((v) => ({ ...v, faceFileName: f.name })); }} />
                </label>
              </div>
            </div>

            {/* Social verification */}
            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--bridge-text-faint)]">Professional identity</p>
              <p className="text-xs text-[var(--bridge-text-muted)]">
                Connect your LinkedIn or GitHub to prove professional ownership. We only read your public name — we never post or store your password.
              </p>

              {verifyData.socialVerified ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/40 bg-emerald-500/8 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-emerald-400">
                      ✓ {verifyData.socialVerified.provider === 'linkedin' ? 'LinkedIn' : 'GitHub'} verified
                    </p>
                    <p className="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      @{verifyData.socialVerified.username} · {verifyData.socialVerified.displayName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerifyData((v) => ({ ...v, socialVerified: null, socialSkipped: false }))}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : verifyData.socialSkipped ? (
                <div className="flex items-center justify-between rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--bridge-text-muted)]">Skipped</p>
                    <p className="text-xs text-[var(--bridge-text-faint)] mt-0.5">No social network linked — other signals carry your score</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerifyData((v) => ({ ...v, socialSkipped: false }))}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Connect instead
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setSocialModal('linkedin'); setSocialInput(''); }}
                      className={`flex items-center gap-2.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--bridge-text)] transition hover:border-sky-400/60 hover:bg-sky-500/5 ${focusRing}`}
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSocialModal('github'); setSocialInput(''); }}
                      className={`flex items-center gap-2.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--bridge-text)] transition hover:border-purple-400/60 hover:bg-purple-500/5 ${focusRing}`}
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      GitHub
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerifyData((v) => ({ ...v, socialSkipped: true }))}
                    className="w-full text-center text-xs text-[var(--bridge-text-faint)] hover:text-[var(--bridge-text-muted)] py-1.5 transition-colors"
                  >
                    I don't use LinkedIn or GitHub →
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--bridge-text-faint)]">
              All submitted information is reviewed by Bridge admins only and is never shared publicly.
            </p>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            APP-3: Motivation essay
        ══════════════════════════════════════════════════════ */}
        {screen === 'app-3' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('app-2')} />
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={saving || !canSubmitApp}
                  className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {saving ? 'Submitting…' : 'Submit application'}
                </button>
              </div>
            }
          >
            <SectionHeader icon={ShieldCheck} label="Motivation" sub="Step 3 of 3 · scored algorithmically" />

            {/* Live score preview */}
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--bridge-text-muted)]">Verification score estimate</span>
                <span className="text-sm font-black" style={{ color: scoreColor }}>{liveScore}<span className="text-xs font-normal text-[var(--bridge-text-faint)]">/100</span></span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bridge-border)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(liveScore, 100)}%`, background: scoreColor }} />
              </div>
              <p className="text-xs" style={{ color: scoreColor }}>{scoreLabel} · ≥75 auto-approves, 50–74 admin review, &lt;50 rejected</p>
            </div>

            <div>
              <label className={labelCls}>
                Why do you want to mentor on Bridge? *
                <span className="normal-case font-normal text-[var(--bridge-text-faint)] ml-2">
                  min 50 words · {essayWords} so far
                </span>
              </label>
              <textarea
                rows={7}
                value={verifyData.motivationEssay}
                onChange={(e) => setVerifyData((v) => ({ ...v, motivationEssay: e.target.value }))}
                className={`${inputCls} resize-none`}
                placeholder="Describe your motivation to mentor — what experiences shaped you, what impact you hope to make, and why Bridge aligns with your goals. Be specific and genuine."
              />
              <p className="mt-1.5 text-xs text-[var(--bridge-text-faint)]">
                This essay is scored algorithmically for clarity and relevance. Minimum 50 words required.
                {essayWords >= 50 && <span className="ml-1 text-emerald-600 font-semibold">✓ Meets minimum</span>}
              </p>
            </div>

            {/* Work experience summary */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--bridge-text-faint)]">Work experience summary</p>
              {appForm.work_experience.length === 0 ? (
                <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-xs text-[var(--bridge-text-faint)]">
                  No jobs entered. Go back to add at least one position.
                </div>
              ) : (
                <div className="space-y-2">
                  {appForm.work_experience.map((job, i) => (
                    <div key={i} className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--bridge-text)]">{job.title || '—'} · {job.company || '—'}</p>
                      <p className="text-xs text-[var(--bridge-text-faint)] mt-0.5">{job.start_year} – {job.end_year ?? 'present'}</p>
                    </div>
                  ))}
                  <p className="text-xs text-[var(--bridge-text-faint)]">To edit, go back to step 1.</p>
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--bridge-text-faint)]">
              By submitting, you agree to Bridge's Terms of Service and consent to identity verification.
            </p>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            PROFILE-1: Professional identity
        ══════════════════════════════════════════════════════ */}
        {screen === 'profile-1' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => go('profile-2')}
                  className="text-xs text-[var(--bridge-text-faint)] hover:text-[var(--bridge-text-muted)] transition-colors"
                >
                  Skip for now →
                </button>
                <NextBtn
                  onClick={() => {
                    if (!profileForm.title.trim()) { setError('Please enter your job title.'); return; }
                    go('profile-2');
                  }}
                  label="Continue"
                />
              </div>
            }
          >
            <SectionHeader icon={Briefcase} label="Professional identity" sub="Step 1 of 2" />

            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
              Your application was approved. Complete your public profile to go live on Bridge.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Job title *</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => patchProfile({ title: e.target.value })}
                  className={inputCls}
                  placeholder="Senior Product Manager"
                />
              </div>
              <div>
                <label className={labelCls}>Company</label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => patchProfile({ company: e.target.value })}
                  className={inputCls}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => patchProfile({ location: e.target.value })}
                  className={inputCls}
                  placeholder="San Francisco, USA"
                />
              </div>
            </div>

            {/* Assigned tier & rate (read-only) */}
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--bridge-text-faint)] mb-2">Assigned by Bridge</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] text-[var(--bridge-text-muted)]">Session rate</p>
                  <p className="text-xl font-black text-[var(--bridge-text)]">
                    {assignedRate != null ? `$${assignedRate}` : '—'}
                    <span className="text-sm font-normal text-[var(--bridge-text-muted)] ml-1">/hr</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-[var(--bridge-border)]" />
                <div>
                  <p className="text-[11px] text-[var(--bridge-text-muted)]">Tier</p>
                  <p className="text-sm font-bold capitalize" style={{ color: assignedTier === 'elite' ? '#d97706' : assignedTier === 'senior' ? '#0284c7' : assignedTier === 'professional' ? '#059669' : 'var(--bridge-text-secondary)' }}>
                    {assignedTier ?? '—'}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-[var(--bridge-text-faint)]">
                Rates are set algorithmically based on education, experience, and verification score. You can request a review from your dashboard after going live.
              </p>
            </div>

            <div>
              <label className={labelCls}>Industry</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => patchProfile({ industry: ind })}
                    className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                      profileForm.industry === ind
                        ? 'bg-stone-900 text-amber-50 shadow-sm'
                        : `border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:border-amber-300/60 ${focusRing}`
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelCls} mb-0`}>Bio</label>
                <button
                  type="button"
                  onClick={handleDraftBio}
                  disabled={bioLoading}
                  className={`flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100/80 disabled:opacity-50 ${focusRing}`}
                >
                  {bioLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {bioLoading ? 'Drafting…' : 'Draft bio with AI'}
                </button>
              </div>
              <textarea
                rows={5}
                value={profileForm.bio}
                onChange={(e) => patchProfile({ bio: e.target.value })}
                className={`${inputCls} resize-none`}
                placeholder="A compelling bio helps mentees decide to book with you. Click 'Draft bio with AI' to generate one from your experience."
              />
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            PROFILE-2: Skills & presence
        ══════════════════════════════════════════════════════ */}
        {screen === 'profile-2' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('profile-1')} />
                <button
                  type="button"
                  onClick={handleCompleteProfile}
                  disabled={saving}
                  className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {saving ? 'Publishing…' : 'Go live'}
                </button>
              </div>
            }
          >
            <SectionHeader icon={Tag} label="Skills & presence" sub="Step 2 of 2" />

            <div>
              <label className={labelCls}>Expertise tags <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(max 8)</span></label>
              <TagInput
                tags={profileForm.expertise}
                onChange={(tags) => patchProfile({ expertise: tags })}
                max={8}
                placeholder="e.g. Product Management, System Design…"
              />
              <p className="mt-1.5 text-xs text-[var(--bridge-text-faint)]">Press Enter or comma after each skill.</p>
            </div>

            <div>
              <label className={labelCls}>Languages spoken <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(max 10)</span></label>
              <TagInput
                tags={profileForm.languages}
                onChange={(langs) => patchProfile({ languages: langs })}
                max={10}
                placeholder="e.g. English, Spanish…"
              />
            </div>

            <div>
              <label className={labelCls}>Profile photo URL <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(optional)</span></label>
              <input
                type="url"
                value={profileForm.image_url}
                onChange={(e) => patchProfile({ image_url: e.target.value })}
                className={inputCls}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            {/* Preview */}
            {(profileForm.title || profileForm.bio || profileForm.expertise.length > 0) && (
              <div className="pt-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-[var(--bridge-text-faint)] mb-3">Profile preview</p>
                <ProfilePreview data={{
                  name: appForm.name,
                  title: profileForm.title,
                  company: profileForm.company,
                  industry: profileForm.industry,
                  location: profileForm.location,
                  session_rate: assignedRate,
                  bio: profileForm.bio,
                  expertise: profileForm.expertise,
                  languages: profileForm.languages,
                  years_experience: appForm.years_experience,
                  work_experience: appForm.work_experience,
                  education: appForm.education,
                  tier: 'rising',
                }} />
              </div>
            )}
          </Card>
        )}

        {/* ── OAuth simulate modal ── */}
        {socialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
              className="w-full max-w-sm rounded-3xl p-6 space-y-4"
              style={{ background: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 32px 64px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-[var(--bridge-text)]">
                  {socialModal === 'linkedin' ? 'Connect LinkedIn' : 'Connect GitHub'}
                  <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase tracking-wide">Test mode</span>
                </h2>
                <button onClick={() => setSocialModal(null)} className="text-[var(--bridge-text-faint)] hover:text-[var(--bridge-text)]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-xs text-[var(--bridge-text-muted)]">
                In production this opens a real {socialModal === 'linkedin' ? 'LinkedIn' : 'GitHub'} OAuth popup. In test mode, enter any username to simulate ownership verification.
              </div>

              <div>
                <label className={labelCls}>
                  {socialModal === 'linkedin' ? 'LinkedIn username (linkedin.com/in/…)' : 'GitHub username'}
                </label>
                <input
                  type="text"
                  value={socialInput}
                  onChange={(e) => setSocialInput(e.target.value)}
                  className={inputCls}
                  placeholder={socialModal === 'linkedin' ? 'john-doe-123' : 'johndoe'}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="flex-1 rounded-xl border border-[var(--bridge-border)] py-2.5 text-xs font-semibold text-[var(--bridge-text-muted)] hover:bg-white/4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!socialInput.trim()}
                  onClick={() => {
                    const username = socialInput.trim().replace(/^@/, '');
                    setVerifyData((v) => ({
                      ...v,
                      socialVerified: { provider: socialModal, username, displayName: username },
                      socialSkipped: false,
                    }));
                    setSocialModal(null);
                  }}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Simulate verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard link */}
        <p className="mt-8 text-center text-xs text-[var(--bridge-text-faint)]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`font-semibold text-[var(--bridge-text-secondary)] underline hover:text-[var(--bridge-text)] rounded-sm ${focusRing}`}
          >
            Go to dashboard
          </button>
        </p>
      </div>
    </main>
  );
}
