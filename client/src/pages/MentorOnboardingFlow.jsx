import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Image as ImageIcon } from 'lucide-react';
import supabase from '../api/supabase';
import { useAuth } from '../context/useAuth';
import { fetchOwnMentorProfileRow } from '../api/verification';
import { tagMentorCategories } from '../api/tagMentorCategories';
import { uploadMentorAvatar } from '../api/mentorAvatarStorage';
import { getCalendlyAuthUrl } from '../api/calendly';
import { filterExpertiseSuggestions } from '../utils/expertiseSuggestions';
import LoadingSpinner from '../components/LoadingSpinner';
import MentorAvatar from '../components/MentorAvatar';

function StepIndicator({ step }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: 'var(--bridge-text-muted)' }}>
      Step {step} of 5
    </p>
  );
}

function ProfilePreview({ profile }) {
  const tags = Array.isArray(profile.expertise) ? profile.expertise.slice(0, 4) : [];
  return (
    <article
      className="flex gap-4 rounded-2xl p-4"
      style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      {profile.image_url ? (
        <img src={profile.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
      ) : (
        <MentorAvatar name={profile.name} size="lg" className="!h-16 !w-16 rounded-xl" />
      )}
      <div className="min-w-0">
        <p className="font-bold" style={{ color: 'var(--bridge-text)' }}>{profile.name || 'Your name'}</p>
        <p className="text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>{profile.title || 'Your role'}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'var(--bridge-surface)', color: 'var(--bridge-text-secondary)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function MentorOnboardingFlow() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [profileId, setProfileId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [story, setStory] = useState({ mentorship_description: '', bio: '', why_i_mentor: '' });
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [expertise, setExpertise] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [calendlyConnected, setCalendlyConnected] = useState(false);
  const [skippedCalendly, setSkippedCalendly] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/onboarding/mentor', { replace: true });
      return;
    }

    void (async () => {
      const row = await fetchOwnMentorProfileRow(user.id);
      if (!row || row.mentor_status !== 'active') {
        navigate('/dashboard', { replace: true });
        return;
      }
      if (row.onboarding_complete === true) {
        navigate('/dashboard', { replace: true });
        return;
      }

      const app = row.verification_data?.application || {};
      setProfileId(row.id);
      setStep(Math.max(1, Math.min(5, (row.onboarding_step || 0) + 1)));
      setDisplayName(row.name || app.full_name || user.user_metadata?.full_name?.split(' ')[0] || 'there');
      setStory({
        mentorship_description: row.mentorship_description || app.mentorship_description || '',
        bio: row.bio || '',
        why_i_mentor: row.why_i_mentor || app.why_i_mentor || '',
      });
      setImageUrl(row.image_url || '');
      setExpertise(Array.isArray(row.expertise) ? row.expertise : []);
      setCalendlyConnected(Boolean(row.calendly_connected && row.calendly_event_type_uri));
      setLoading(false);
    })();
  }, [authLoading, user, navigate]);

  async function persistStep(nextStep) {
    if (!profileId) return;
    await supabase.from('mentor_profiles').update({ onboarding_step: nextStep }).eq('id', profileId);
    setStep(nextStep);
  }

  async function saveStory() {
    const errorsLocal = {};
    const desc = story.mentorship_description.trim();
    const bio = story.bio.trim();
    if (desc.length < 100 || desc.length > 1000) errorsLocal.mentorship_description = '100–1000 characters required';
    if (bio.length < 100 || bio.length > 600) errorsLocal.bio = '100–600 characters required';
    if (story.why_i_mentor.length > 280) errorsLocal.why_i_mentor = 'Max 280 characters';
    setErrors(errorsLocal);
    if (Object.keys(errorsLocal).length) return;

    setSaving(true);
    const { error } = await supabase.from('mentor_profiles').update({
      mentorship_description: desc,
      bio,
      why_i_mentor: story.why_i_mentor.trim() || null,
    }).eq('id', profileId);
    setSaving(false);
    if (error) return;
    tagMentorCategories(profileId);
    await persistStep(3);
  }

  async function handlePhoto(file) {
    if (!file || !user) return;
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!ok || file.size > 5 * 1024 * 1024) {
      setErrors({ photo: 'JPG, PNG, or WebP under 5MB' });
      return;
    }
    setUploadProgress(0);
    try {
      const url = await uploadMentorAvatar(user.id, file, setUploadProgress);
      await supabase.from('mentor_profiles').update({ image_url: url }).eq('id', profileId);
      setImageUrl(url);
      setErrors({});
    } catch {
      setErrors({ photo: 'Upload failed. Try again.' });
    } finally {
      setUploadProgress(null);
    }
  }

  async function saveExpertise() {
    if (expertise.length < 1) {
      setErrors({ expertise: 'Add at least one tag' });
      return;
    }
    setSaving(true);
    await supabase.from('mentor_profiles').update({ expertise }).eq('id', profileId);
    setSaving(false);
    await persistStep(5);
  }

  async function connectCalendly() {
    if (!profileId) return;
    try {
      const url = await getCalendlyAuthUrl(profileId);
      window.location.href = url;
    } catch {
      setErrors({ calendly: 'Could not open Calendly. Try from your dashboard later.' });
    }
  }

  async function goLive() {
    setSaving(true);
    await supabase.from('mentor_profiles').update({
      onboarding_complete: true,
      onboarding_step: 5,
      available: true,
    }).eq('id', profileId);
    setSaving(false);
    navigate('/dashboard', { replace: true });
  }

  if (authLoading || loading) {
    return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  }

  const previewProfile = {
    name: displayName,
    title: story.mentorship_description ? story.bio?.slice(0, 0) : '',
    image_url: imageUrl,
    expertise,
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-12 sm:px-8">
      {step > 1 && step < 5 && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      <StepIndicator step={step} />

      {step === 1 && (
        <section className="mt-8">
          <h1 className="font-display text-3xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Welcome to Bridge, {displayName}.
          </h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            Your profile is how mentees find you. A complete profile gets significantly more bookings. This takes about 5 minutes — and you only do it once.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Your story', 'Your photo', 'Your availability'].map((label) => (
              <div key={label} className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}>
                {label}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => persistStep(2)}
            className="bridge-focus mt-10 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            Let&apos;s go <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8">
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>Tell mentees who you are.</h1>
          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>What can you help people with?</label>
              <p className="mb-2 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>The first thing mentees read. Be specific — your story is more compelling than your job title.</p>
              <textarea
                rows={5}
                maxLength={1000}
                value={story.mentorship_description}
                onChange={(e) => setStory((s) => ({ ...s, mentorship_description: e.target.value }))}
                className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
                style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
              />
              <p className="mt-1 text-xs tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>{story.mentorship_description.length}/1000</p>
              {errors.mentorship_description && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.mentorship_description}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>Your bio</label>
              <p className="mb-2 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>First person. Who you are, your background, what drives you. How you&apos;d introduce yourself to someone you just met.</p>
              <textarea
                rows={4}
                maxLength={600}
                value={story.bio}
                onChange={(e) => setStory((s) => ({ ...s, bio: e.target.value }))}
                className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
                style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
              />
              <p className="mt-1 text-xs tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>{story.bio.length}/600</p>
              {errors.bio && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.bio}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>Why do you mentor?</label>
              <p className="mb-2 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Shows on your profile as a short quote. It&apos;s the most human part of your profile.</p>
              <textarea
                rows={2}
                maxLength={280}
                value={story.why_i_mentor}
                onChange={(e) => setStory((s) => ({ ...s, why_i_mentor: e.target.value }))}
                className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
                style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
              />
              <p className="mt-1 text-xs tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>{story.why_i_mentor.length}/280</p>
            </div>
          </div>
          <button type="button" disabled={saving} onClick={saveStory} className="bridge-focus mt-8 rounded-full px-8 py-3.5 text-[15px] font-bold disabled:opacity-60" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}>
            Continue
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8">
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>Add a photo.</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>Profiles with photos get significantly more bookings. A clear headshot works best.</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-32 w-32 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-32 w-32 place-items-center rounded-2xl" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>
                <ImageIcon className="h-10 w-10" style={{ color: 'var(--bridge-text-muted)' }} />
              </div>
            )}
            <label className="bridge-focus cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', color: 'var(--bridge-text)' }}>
              {imageUrl ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </label>
            {uploadProgress != null && (
              <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Uploading… {uploadProgress}%</p>
            )}
            {errors.photo && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.photo}</p>}
          </div>
          <button
            type="button"
            disabled={!imageUrl}
            onClick={() => persistStep(4)}
            className="bridge-focus mt-10 rounded-full px-8 py-3.5 text-[15px] font-bold disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            Continue
          </button>
        </section>
      )}

      {step === 4 && (
        <section className="mt-8">
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>What are your areas of expertise?</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>These tags help mentees find you. Pick what you genuinely know.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {expertise.map((tag) => (
              <button key={tag} type="button" onClick={() => setExpertise((t) => t.filter((x) => x !== tag))} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: 'var(--color-primary)' }}>
                {tag} ×
              </button>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setSuggestions(filterExpertiseSuggestions(e.target.value));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = tagInput.trim().replace(/,$/, '');
                if (val && expertise.length < 15 && !expertise.includes(val)) {
                  setExpertise((t) => [...t, val]);
                }
                setTagInput('');
                setSuggestions([]);
              }
            }}
            placeholder="Type and press Enter"
            className="mt-4 w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
            style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text)' }}
          />
          {suggestions.length > 0 && (
            <ul className="mt-2 rounded-xl py-1" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bridge-surface-muted)]" onClick={() => { if (!expertise.includes(s) && expertise.length < 15) setExpertise((t) => [...t, s]); setTagInput(''); setSuggestions([]); }}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.expertise && <p className="mt-2 text-xs" style={{ color: 'var(--color-error)' }}>{errors.expertise}</p>}
          <button type="button" disabled={saving} onClick={saveExpertise} className="bridge-focus mt-8 rounded-full px-8 py-3.5 text-[15px] font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}>
            Continue
          </button>
        </section>
      )}

      {step === 5 && (
        <section className="mt-8">
          <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>Set your availability.</h1>
          <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
            <p className="text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
              Bridge uses Calendly for scheduling. Connecting your calendar means mentees book directly — no back-and-forth.
            </p>
            {calendlyConnected ? (
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                <Check className="h-4 w-4" /> Calendly connected
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={connectCalendly} className="rounded-full px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}>
                  Connect Calendly
                </button>
                <button type="button" onClick={() => setSkippedCalendly(true)} className="text-sm font-medium underline" style={{ color: 'var(--bridge-text-muted)' }}>
                  Skip for now
                </button>
              </div>
            )}
            {skippedCalendly && !calendlyConnected && (
              <p className="mt-3 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>
                Without availability set, mentees can&apos;t book you. You can add it from your dashboard later.
              </p>
            )}
          </div>

          <hr className="my-8" style={{ borderColor: 'var(--bridge-border)' }} />

          <ProfilePreview profile={{ ...previewProfile, name: user?.user_metadata?.full_name || displayName, title: story.bio?.split('.')[0] || 'Mentor' }} />
          <h2 className="mt-6 font-bold" style={{ color: 'var(--bridge-text)' }}>This is how mentees will see you.</h2>
          <button type="button" disabled={saving} onClick={goLive} className="bridge-focus mt-6 rounded-full px-8 py-3.5 text-[15px] font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}>
            Go live →
          </button>
          <p className="mt-3 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>You can edit your profile anytime from your dashboard.</p>
        </section>
      )}
    </main>
  );
}
