import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Edit3, Flag } from 'lucide-react';
import supabase from '../../api/supabase';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole';
import TierDisputeModal from '../../components/TierDisputeModal';

function MentorPreviewCard({ profile }) {
  if (!profile) return null;
  const [disputeOpen, setDisputeOpen] = useState(false);
  const initials = (profile.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  return (
    <article
      className="flex flex-col gap-5 rounded-3xl p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Public profile preview
        </p>
        <Link
          to={`/mentors/${profile.id}`}
          className="bridge-focus inline-flex items-center gap-1.5 rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          View public page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="flex items-start gap-4">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt=""
            width={80}
            height={80}
            loading="lazy"
            className="bridge-photo h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="bridge-photo grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-[20px] font-black"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2
            className="font-display text-[22px] font-black tracking-[-0.02em]"
            style={{ color: 'var(--bridge-text)' }}
          >
            {profile.name || 'Your name'}
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
            {[profile.title, profile.company].filter(Boolean).join(' · ') || 'Add your title and company.'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className="rounded-full px-2 py-0.5 font-bold tabular-nums"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              {profile.years_experience ?? 0} years experience
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-bold tabular-nums"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              ${profile.session_rate ?? '—'} per session
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-bold tabular-nums"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              ★ {(profile.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      {profile.bio && (
        <p
          className="text-[13px]"
          style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
        >
          {profile.bio}
        </p>
      )}
      {Array.isArray(profile.expertise) && profile.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.expertise.map((tag) => (
            <span
              key={String(tag)}
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {String(tag)}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/profile"
          className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Edit3 className="h-3.5 w-3.5" aria-hidden /> Edit profile
        </Link>
        <button
          type="button"
          onClick={() => setDisputeOpen(true)}
          className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{
            boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          <Flag className="h-3 w-3" aria-hidden /> Dispute tier / rate
        </button>
      </div>
      {disputeOpen && (
        <TierDisputeModal
          profileId={profile.id}
          currentRate={profile.session_rate}
          currentTier={profile.tier}
          onClose={() => setDisputeOpen(false)}
        />
      )}
    </article>
  );
}

function MenteeAccountCard({ user, menteeProfile }) {
  return (
    <article
      className="flex flex-col gap-4 rounded-3xl p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.32em]"
        style={{ color: 'var(--color-primary)' }}
      >
        Your account
      </p>
      <h2
        className="font-display text-[22px] font-black tracking-[-0.02em]"
        style={{ color: 'var(--bridge-text)' }}
      >
        {user?.user_metadata?.full_name || user?.email}
      </h2>
      <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
        {user?.email}
      </p>
      {menteeProfile && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Current role', value: menteeProfile.current_position },
            { label: 'Target role', value: menteeProfile.target_role },
            { label: 'Target industry', value: menteeProfile.target_industry },
            { label: 'Years of experience', value: menteeProfile.years_experience },
          ].filter((r) => r.value != null && r.value !== '').map((r) => (
            <div
              key={r.label}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                {r.label}
              </p>
              <p className="mt-1 text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                {r.value}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          to="/profile"
          className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Edit3 className="h-3.5 w-3.5" aria-hidden /> Edit profile
        </Link>
        <Link
          to="/settings"
          className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{
            boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          Account settings
        </Link>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [profile, setProfile] = useState(null);
  const [menteeProfile, setMenteeProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setLoading(false); return undefined; }
    setLoading(true);
    void (async () => {
      try {
        if (isMentor) {
          const { data } = await supabase
            .from('mentor_profiles').select('*').eq('user_id', user.id).maybeSingle();
          if (!cancelled) setProfile(data ?? null);
        } else {
          const { data } = await supabase
            .from('mentee_profiles').select('*').eq('user_id', user.id).maybeSingle();
          if (!cancelled) setMenteeProfile(data ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, isMentor]);

  if (isLoading) {
    return <div className="bridge-skeleton h-64 w-full rounded-3xl" />;
  }

  return isMentor
    ? <MentorPreviewCard profile={profile} />
    : <MenteeAccountCard user={user} menteeProfile={menteeProfile} />;
}
