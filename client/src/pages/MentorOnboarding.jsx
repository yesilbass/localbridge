import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useContent } from '../content';
import {
  ArrowRight, ArrowLeft, CheckCircle2, User, Briefcase,
  GraduationCap, Tag, Loader2, X, Plus, ShieldCheck, CreditCard, Camera,
  Upload, FileText,
} from 'lucide-react';
import { uploadResumeFile } from '../api/resumeStorage';
import { devFetch } from './DevPortal/devAuth';
import { extractResumeData } from '../api/ai';
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
  const { s } = useContent();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {s.onboarding.back}
    </button>
  );
}

function NextBtn({ onClick, disabled, loading, label }) {
  const { s } = useContent();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {loading ? s.onboarding.processing : (label ?? s.onboarding.continue)}
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
  const { s } = useContent();
  return (
    <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{s.onboarding.jobTitle}</label>
          <input type="text" value={job.title} onChange={(e) => onChange({ ...job, title: e.target.value })} className={inputCls} placeholder="Senior Engineer" />
        </div>
        <div>
          <label className={labelCls}>{s.onboarding.company}</label>
          <input type="text" value={job.company} onChange={(e) => onChange({ ...job, company: e.target.value })} className={inputCls} placeholder="Acme Inc." />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>{s.onboarding.startYear}</label>
          <select value={job.start_year} onChange={(e) => onChange({ ...job, start_year: Number(e.target.value) })} className={inputCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{s.onboarding.endYear}</label>
          <select value={job.end_year ?? ''} onChange={(e) => onChange({ ...job, end_year: e.target.value === '' ? null : Number(e.target.value) })} className={inputCls}>
            <option value="">{s.common.present}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onRemove} className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition">
            <X className="h-3.5 w-3.5" /> {s.onboarding.removeEntry}
          </button>
        </div>
      </div>
      <div>
        <label className={labelCls}>Responsibilities &amp; achievements</label>
        <textarea
          rows={4}
          value={job.description}
          onChange={(e) => onChange({ ...job, description: e.target.value })}
          className={`${inputCls} resize-none leading-relaxed`}
          placeholder={'• Led a team of 8 engineers to deliver the payments platform on time\n• Reduced API latency by 40% through query optimization\n• Mentored 3 junior engineers to mid-level promotion'}
        />
        <p className="mt-1 text-[11px] text-[var(--bridge-text-faint)]">Use bullet points. Specific achievements and numbers score higher.</p>
      </div>
    </div>
  );
}

/* ─── Education row ─────────────────────────────────────────────────────────── */

function EduRow({ edu, onChange, onRemove }) {
  const { s } = useContent();
  const degreeLevels = [
    { value: 'phd',       label: s.onboarding.degreePhd },
    { value: 'masters',   label: s.onboarding.degreeMasters },
    { value: 'bachelors', label: s.onboarding.degreeBachelors },
    { value: 'associate', label: s.onboarding.degreeAssociate },
    { value: 'other',     label: s.onboarding.degreeOther },
  ];
  return (
    <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{s.onboarding.schoolLabel}</label>
          <input type="text" value={edu.school} onChange={(e) => onChange({ ...edu, school: e.target.value })} className={inputCls} placeholder="MIT, Harvard, Stanford…" />
        </div>
        <div>
          <label className={labelCls}>{s.onboarding.fieldOfStudy}</label>
          <input type="text" value={edu.degree} onChange={(e) => onChange({ ...edu, degree: e.target.value })} className={inputCls} placeholder="Computer Science, Finance…" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{s.onboarding.degreeLevel}</label>
          <select
            value={edu.degree_level ?? ''}
            onChange={(e) => onChange({ ...edu, degree_level: e.target.value })}
            className={inputCls}
          >
            <option value="">{s.onboarding.selectLevel}</option>
            {degreeLevels.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{s.onboarding.graduationYear}</label>
          <select value={edu.year} onChange={(e) => onChange({ ...edu, year: Number(e.target.value) })} className={inputCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{s.onboarding.diplomaUpload}</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-3 text-sm transition hover:border-amber-400">
            <GraduationCap className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)]" />
            <span className="truncate text-xs text-[var(--bridge-text-muted)]">
              {edu.diplomaFileName
                ? <span className="font-semibold text-[var(--bridge-text)]">{edu.diplomaFileName}</span>
                : s.onboarding.diplomaUploadHint}
            </span>
            <input type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange({ ...edu, diplomaFileName: f.name }); }} />
          </label>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onRemove} className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition">
            <X className="h-3.5 w-3.5" /> {s.onboarding.removeEntry}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile preview panel ─────────────────────────────────────────────────── */

function ProfilePreview({ data }) {
  const { s } = useContent();
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
              <p className="text-xs text-[var(--bridge-text-muted)]">{s.onboarding.perSession}</p>
              <p className="text-2xl font-bold text-[var(--bridge-text)]">${data.session_rate}</p>
            </div>
          )}
        </div>
      </div>

      {data.bio && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-2">{s.onboarding.aboutLabel}</p>
          <p className="text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{data.bio}</p>
        </div>
      )}

      {data.expertise?.length > 0 && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-3">{s.onboarding.expertiseLabel}</p>
          <div className="flex flex-wrap gap-2">
            {data.expertise.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {data.work_experience?.length > 0 && (
        <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-4">{s.onboarding.experienceLabel}</p>
          <div className="space-y-4">
            {[...data.work_experience].sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)).map((job, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                  <Briefcase className="h-3.5 w-3.5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--bridge-text)]">{job.title}</p>
                  <p className="text-xs text-[var(--bridge-text-secondary)]">
                    {job.company} · {job.start_year}–{job.end_year ?? s.common.present}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-4">{s.onboarding.educationLabel}</p>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)] mb-3">{s.onboarding.detailsLabel}</p>
          <dl className="space-y-2 text-sm">
            {data.years_experience && (
              <div className="flex justify-between">
                <dt className="text-[var(--bridge-text-muted)]">{s.onboarding.experienceLabel}</dt>
                <dd className="font-medium text-[var(--bridge-text)]">{s.onboarding.yearsLabel.replace('{n}', data.years_experience)}</dd>
              </div>
            )}
            {data.languages?.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--bridge-text-muted)]">{s.onboarding.languagesLabel}</dt>
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


/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */

export default function MentorOnboarding() {
  const { s } = useContent();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMentor = user?.user_metadata?.role === 'mentor';
  const SCREEN_META = {
    'checkr':    { title: 'Identity verification',           sub: 'Bridge runs an automated background check on every mentor applicant.' },
    'resume':    { title: 'Start your application',          sub: 'Upload your resume to auto-fill, or fill in manually.' },
    'app-1':     { title: s.onboarding.applyTitle,          sub: s.onboarding.applySub },
    'app-2':     { title: 'Professional profiles',           sub: 'Step 2 of 3 — your online professional presence.' },
    'app-3':     { title: s.onboarding.motivationTitle,     sub: s.onboarding.motivationSub },
    'profile-1': { title: s.onboarding.completeProfileTitle, sub: s.onboarding.completeProfileSub },
    'profile-2': { title: s.onboarding.skillsTitle,         sub: s.onboarding.skillsSub },
  };

  const [screen, setScreen] = useState('checkr');
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
    linkedinUrl: '', githubUrl: '',
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

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeExtracting, setResumeExtracting] = useState(false);
  const [resumeStoragePath, setResumeStoragePath] = useState(null);
  const [checkrDone, setCheckrDone] = useState(false);
  const [checkrRunning, setCheckrRunning] = useState(false);


  /* ── Load existing profile ── */
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isMentor) { setLoadingProfile(false); return; }
    void (async () => {
      try {
        const profile = await getMentorOnboardingProfile(user.id);
        if (!profile) { setLoadingProfile(false); return; }

        if (profile.onboarding_complete && profile.mentor_status !== 'rejected') {
          navigate('/dashboard', { replace: true }); return;
        }

        // Already submitted — send back to dashboard (pending/under_review screen)
        if (profile.application_submitted_at && ['pending', 'under_review'].includes(profile.mentor_status)) {
          navigate('/dashboard', { replace: true }); return;
        }

        setProfileId(profile.id);

        if (profile.mentor_status === 'active' && !profile.onboarding_complete) {
          // Approved — skip to profile completion
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
          // Not submitted yet (new, rejected reapply, or partial fill) — start application
          setAppForm((p) => ({
            ...p,
            name:             profile.name ?? '',
            years_experience: profile.years_experience ? String(profile.years_experience) : '',
            work_experience:  Array.isArray(profile.work_experience) ? profile.work_experience : [],
            education:        Array.isArray(profile.education) ? profile.education : [],
          }));
          const vd = profile.verification_data || {};
          if (vd.govIdNumber || vd.linkedinUrl || vd.motivationEssay) {
            setVerifyData((v) => ({
              ...v,
              govIdNumber:     vd.govIdNumber ?? '',
              govIdFileName:   vd.govIdFileName ?? '',
              faceFileName:    vd.faceFileName ?? '',
              linkedinUrl:     vd.linkedinUrl ?? '',
              githubUrl:       vd.githubUrl ?? '',
              socialVerified:  vd.socialVerified ?? null,
              socialSkipped:   vd.socialSkipped ?? false,
              motivationEssay: vd.motivationEssay ?? '',
            }));
          }
          // Skip checkr screen if already completed in a previous session
          if (vd.govIdNumber) {
            setCheckrDone(true);
            go('resume');
          } else {
            go('checkr');
          }
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

  /* ── Checkr background check simulation ── */
  async function handleRunCheckr() {
    if (!verifyData.govIdNumber.trim()) {
      setError('Please enter your government ID number to proceed.');
      return;
    }
    setError('');
    setCheckrRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCheckrRunning(false);
    setCheckrDone(true);
  }

  /* ── Resume upload + AI extraction ── */
  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }
    setError('');
    setResumeUploading(true);
    try {
      const uploaded = await uploadResumeFile(user.id, file);
      setResumeStoragePath(uploaded.path);
      setResumeUploading(false);
      setResumeExtracting(true);
      const resumeBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result || '';
          resolve(typeof result === 'string' ? result.split(',')[1] || result : '');
        };
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });
      const parsed = await extractResumeData(resumeBase64);
      if (parsed) {
        patchApp({
          name: parsed.name || appForm.name,
          years_experience: parsed.years_experience ? String(parsed.years_experience) : appForm.years_experience,
          work_experience: parsed.work_experience?.length
            ? parsed.work_experience.slice(0, 3).map((j) => ({
                title: j.title || '',
                company: j.company || '',
                start_year: j.start_year || CURRENT_YEAR - 1,
                end_year: j.end_year ?? null,
                description: j.description || '',
              }))
            : appForm.work_experience,
          education: parsed.education?.length
            ? parsed.education.slice(0, 2).map((ed) => ({
                school: ed.school || '',
                degree: ed.degree || '',
                degree_level: ed.degree_level || '',
                year: ed.year || CURRENT_YEAR - 4,
                diplomaFileName: '',
              }))
            : appForm.education,
        });
        setVerifyData((v) => ({
          ...v,
          ...(parsed.linkedin_url ? { linkedinUrl: parsed.linkedin_url } : {}),
          ...(parsed.github_url ? { githubUrl: parsed.github_url } : {}),
        }));
        patchProfile({
          title: parsed.title || profileForm.title,
          company: parsed.company || profileForm.company,
          industry: parsed.industry || profileForm.industry,
          bio: parsed.bio || profileForm.bio,
          expertise: parsed.expertise?.length ? parsed.expertise.slice(0, 8) : profileForm.expertise,
          languages: parsed.languages?.length ? parsed.languages.slice(0, 10) : profileForm.languages,
          location: parsed.location || profileForm.location,
        });
      }
      go('app-1');
    } catch {
      setResumeExtracting(false);
      setResumeUploading(false);
      setError('Could not extract resume data automatically. Review the uploaded file and continue manually.');
    } finally {
      setResumeExtracting(false);
      setResumeUploading(false);
    }
  }

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
      const supabaseMod = await import('../api/supabase');
      const { data: { session } } = await supabaseMod.default.auth.getSession();
      const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

      // Submit application — sets mentor_status='pending' and application_submitted_at
      const applyRes = await fetch(`${serverUrl}/api/verification/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ verificationData: { ...verifyData, resumeStoragePath } }),
      });
      if (!applyRes.ok) {
        const body = await applyRes.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to submit application. Please try again.');
      }

      // Trigger background check simulation (auto-verify scores the application)
      if (import.meta.env.VITE_DEV_ACCESS_CODE && profileId) {
        await devFetch('/mentor-queue/auto-verify', {
          method: 'POST',
          body: JSON.stringify({ mentorProfileId: profileId }),
        }).catch(() => {});
      }

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
    (essayWords >= 150 ? 12 : essayWords >= 100 ? 8 : essayWords >= 20 ? 4 : 0) +
    ((!yearsOk && appForm.work_experience.length > 0 && yearDelta > claimedYrs * 0.6) ? -10 : (!yearsOk && appForm.work_experience.length > 0) ? -5 : 0) +
    ((!eduSane && appForm.education.length > 0) ? -5 : 0)
  );
  const scoreColor = liveScore >= 75 ? '#22c55e' : liveScore >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = liveScore >= 75 ? s.onboarding.likelyApproved : liveScore >= 50 ? s.onboarding.mayNeedReview : s.onboarding.lowAddMoreInfo;

  const canSubmitApp = checkrDone && (verifyData.socialVerified || verifyData.socialSkipped) && essayWords >= 20;

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
          {(['checkr', 'resume', 'app-1', 'app-2', 'app-3'].includes(screen)
            ? ['checkr', 'resume', 'app-1', 'app-2', 'app-3']
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
            CHECKR: Background check initiation (first step)
        ══════════════════════════════════════════════════════ */}
        {screen === 'checkr' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}
                >
                  <ArrowLeft className="h-4 w-4" /> Back to dashboard
                </button>
                {checkrDone ? (
                  <button
                    type="button"
                    onClick={() => go('resume')}
                    className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
                  >
                    Continue to application <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunCheckr}
                    disabled={checkrRunning || !verifyData.govIdNumber.trim()}
                    className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition ${focusRing}`}
                  >
                    {checkrRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {checkrRunning ? 'Running check…' : 'Run background check'}
                  </button>
                )}
              </div>
            }
          >
            <SectionHeader icon={ShieldCheck} label="Background check" sub="Step 1 of 5 — required before applying" />

            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-4 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">
              Bridge runs an automated identity and background check on every mentor applicant to protect our mentees. This check is performed before you complete your application.
            </div>

            {/* Gov ID */}
            <div>
              <label className={labelCls}>Government ID number *</label>
              <input
                type="text"
                value={verifyData.govIdNumber}
                onChange={(e) => setVerifyData((v) => ({ ...v, govIdNumber: e.target.value }))}
                className={inputCls}
                placeholder="Driver's licence, passport, or state ID number"
              />
              <p className="mt-1 text-xs text-[var(--bridge-text-faint)]">Reviewed by Bridge admins only. Never shared publicly.</p>
            </div>

            {/* ID + selfie uploads */}
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
                <label className={labelCls}><Camera className="inline h-3 w-3 mr-1" />Selfie</label>
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

            {/* Status indicator */}
            {checkrRunning && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Running background check…</p>
                  <p className="text-xs text-amber-700">Verifying your identity. This takes a moment.</p>
                </div>
              </div>
            )}
            {checkrDone && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Identity verified</p>
                  <p className="text-xs text-emerald-700">Background check complete. Continue to your application.</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            RESUME: Upload & AI extraction (optional entry)
        ══════════════════════════════════════════════════════ */}
        {screen === 'resume' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('checkr')} />
                <button
                  type="button"
                  onClick={() => go('app-1')}
                  className={`text-sm font-semibold text-[var(--bridge-text-muted)] underline underline-offset-2 hover:text-[var(--bridge-text)] transition ${focusRing} rounded-sm`}
                >
                  Fill in manually →
                </button>
              </div>
            }
          >
            <SectionHeader icon={FileText} label="Upload your resume" sub="Optional — auto-fills your application" />

            <p className="text-sm leading-relaxed text-[var(--bridge-text-secondary)]">
              Upload your resume PDF and we'll extract your work history, education, and skills automatically. You can review and edit everything before submitting.
            </p>

            {resumeUploading || resumeExtracting ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-6 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-[var(--bridge-text)]">
                    {resumeUploading ? 'Uploading your resume…' : 'Reading your resume with AI…'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--bridge-text-muted)]">
                    {resumeUploading ? 'Saving securely to Bridge' : 'Extracting work history, education, and skills'}
                  </p>
                </div>
              </div>
            ) : resumeStoragePath ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--bridge-text)]">{resumeStoragePath.split('/').pop()}</p>
                    <p className="text-xs text-[var(--bridge-text-muted)]">Resume uploaded</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => go('app-1')}
                  className={`w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 ${focusRing}`}
                >
                  Continue to application →
                </button>
                <label className={`cursor-pointer text-center text-xs text-[var(--bridge-text-muted)] underline underline-offset-2 hover:text-[var(--bridge-text)] transition ${focusRing} rounded-sm`}>
                  Replace resume
                  <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                </label>
              </div>
            ) : (
              <label className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-6 py-12 text-center transition hover:border-amber-400 hover:bg-[var(--bridge-surface)] ${focusRing}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                  <Upload className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--bridge-text)]">Click to upload your resume</p>
                  <p className="mt-1 text-xs text-[var(--bridge-text-muted)]">PDF only · Max 10 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
              </label>
            )}

            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3">
              <p className="text-xs text-[var(--bridge-text-muted)]">
                <span className="font-semibold text-[var(--bridge-text)]">No resume handy?</span>{' '}
                Use the "Fill in manually" link below to complete the application yourself — it only takes a few minutes.
              </p>
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════
            APP-1: Personal background
        ══════════════════════════════════════════════════════ */}
        {screen === 'app-1' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('resume')} />
                <NextBtn
                  onClick={() => {
                    if (!appForm.name.trim()) { setError('Please enter your full name.'); return; }
                    if (appForm.work_experience.length === 0) { setError('Please add at least one work experience entry.'); return; }
                    const missingDegreeLevel = appForm.education.some((e) => e.school.trim() && !e.degree_level);
                    if (missingDegreeLevel) { setError('Please select the degree level for each education entry.'); return; }
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
                  <Plus className="h-4 w-4" /> {s.onboarding.addJobCta}
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
                    education: [...appForm.education, { school: '', degree: '', degree_level: '', year: CURRENT_YEAR - 4, diplomaFileName: '' }],
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
            APP-2: Professional profiles
        ══════════════════════════════════════════════════════ */}
        {screen === 'app-2' && (
          <Card
            footer={
              <div className="flex items-center justify-between">
                <BackBtn onClick={() => go('app-1')} />
                <NextBtn
                  onClick={() => {
                    const li = (verifyData.linkedinUrl ?? '').trim();
                    if (!li) { setError('Please enter your LinkedIn profile URL.'); return; }
                    if (!/linkedin\.com\/in\//i.test(li)) { setError('LinkedIn URL must be in the format linkedin.com/in/your-name.'); return; }
                    const gh = (verifyData.githubUrl ?? '').trim();
                    if (gh && !/github\.com\//i.test(gh)) { setError('GitHub URL must be in the format github.com/your-username.'); return; }
                    const socialVerified = { provider: 'linkedin', username: li, displayName: appForm.name || li };
                    setVerifyData((v) => ({ ...v, socialVerified, socialSkipped: false }));
                    go('app-3');
                  }}
                  label="Continue"
                />
              </div>
            }
          >
            <SectionHeader icon={ShieldCheck} label="Professional profiles" sub="Step 2 of 3" />

            <p className="text-xs text-[var(--bridge-text-muted)]">
              Your LinkedIn profile URL is required. GitHub is optional but strengthens your application. Profiles must be publicly visible.
            </p>

            <div>
              <label className={labelCls}>
                <svg className="inline h-3 w-3 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn profile URL *
              </label>
              <input
                type="url"
                value={verifyData.linkedinUrl ?? ''}
                onChange={(e) => setVerifyData((v) => ({ ...v, linkedinUrl: e.target.value }))}
                className={inputCls}
                placeholder="https://linkedin.com/in/your-name"
              />
            </div>

            <div>
              <label className={labelCls}>
                <svg className="inline h-3 w-3 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub profile URL <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(optional, +bonus)</span>
              </label>
              <input
                type="url"
                value={verifyData.githubUrl ?? ''}
                onChange={(e) => setVerifyData((v) => ({ ...v, githubUrl: e.target.value }))}
                className={inputCls}
                placeholder="https://github.com/your-username"
              />
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
                  min 20 words · {essayWords} so far
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
                This is scored algorithmically for clarity and relevance. Minimum 20 words required.
                {essayWords >= 20 && <span className="ml-1 text-emerald-600 font-semibold">✓ Meets minimum</span>}
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
                <label className={labelCls}>{s.onboarding.jobTitleLabel}</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => patchProfile({ title: e.target.value })}
                  className={inputCls}
                  placeholder="Senior Product Manager"
                />
              </div>
              <div>
                <label className={labelCls}>{s.onboarding.company}</label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => patchProfile({ company: e.target.value })}
                  className={inputCls}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className={labelCls}>{s.onboarding.locationLabel}</label>
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
              <label className={labelCls}>{s.onboarding.industryLabel}</label>
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
                <label className={`${labelCls} mb-0`}>{s.onboarding.bioLabel}</label>
                <button
                  type="button"
                  onClick={handleDraftBio}
                  disabled={bioLoading}
                  className={`flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100/80 disabled:opacity-50 ${focusRing}`}
                >
                  {bioLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {bioLoading ? s.onboarding.draftingBio : s.onboarding.draftBioWithAI}
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
              <label className={labelCls}>{s.onboarding.expertiseTagsLabel} <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(max 8)</span></label>
              <TagInput
                tags={profileForm.expertise}
                onChange={(tags) => patchProfile({ expertise: tags })}
                max={8}
                placeholder="e.g. Product Management, System Design…"
              />
              <p className="mt-1.5 text-xs text-[var(--bridge-text-faint)]">Press Enter or comma after each skill.</p>
            </div>

            <div>
              <label className={labelCls}>{s.onboarding.languagesTagsLabel} <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(max 10)</span></label>
              <TagInput
                tags={profileForm.languages}
                onChange={(langs) => patchProfile({ languages: langs })}
                max={10}
                placeholder="e.g. English, Spanish…"
              />
            </div>

            <div>
              <label className={labelCls}>{s.onboarding.profileImageUrl} <span className="normal-case font-normal text-[var(--bridge-text-faint)]">(optional)</span></label>
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
