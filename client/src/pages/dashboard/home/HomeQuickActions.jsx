import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock, DollarSign, Star, UserRound, Link as LinkIcon,
  Search, Heart, CreditCard, FileText,
} from 'lucide-react';
import supabase from '../../../api/supabase';
import { useAuth } from '../../../context/useAuth.js';

const TIP_KEY = 'bridge.dashboard.tipShown';

function Chip({ icon: Icon, label, kbd, onClick, to }) {
  const cn = 'bridge-focus inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors';
  const style = {
    backgroundColor: 'var(--bridge-surface)',
    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
    color: 'var(--bridge-text-secondary)',
  };
  const inner = (
    <>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
      <span>{label}</span>
      {kbd ? (
        <kbd
          aria-hidden
          className="ml-1 hidden rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline-flex"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            borderColor: 'var(--bridge-border)',
            color: 'var(--bridge-text-muted)',
          }}
        >
          {kbd}
        </kbd>
      ) : null}
    </>
  );
  if (to) return <Link to={to} className={cn} style={style}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cn} style={style}>{inner}</button>;
}

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const id = setTimeout(onDone, 2400);
    return () => clearTimeout(id);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-1/2 z-[120] -translate-x-1/2 rounded-full px-4 py-2 text-[12px] font-semibold shadow-bridge-float lg:bottom-8"
      style={{
        backgroundColor: 'var(--bridge-surface-raised)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
        color: 'var(--bridge-text)',
      }}
    >
      {message}
    </div>
  );
}

export default function HomeQuickActions({ activeRole }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const tipShownRef = useRef(false);

  useEffect(() => {
    if (activeRole !== 'mentor' || !user) return undefined;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from('mentor_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (!cancelled) setMentorProfileId(data?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, [user, activeRole]);

  const isMentor = activeRole === 'mentor';

  const copyProfileLink = async () => {
    if (!mentorProfileId) return;
    const url = `${window.location.origin}/mentors/${mentorProfileId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Profile link copied');
    } catch {
      setToast('Could not copy — try again.');
    }
  };

  // tip toast on first open
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(TIP_KEY) === '1';
      if (seen || tipShownRef.current) return;
      tipShownRef.current = true;
      const id = setTimeout(() => {
        setToast(isMentor ? 'Tip: ⌃H to set hours' : 'Tip: ⌃M to browse mentors');
        window.localStorage.setItem(TIP_KEY, '1');
      }, 1200);
      return () => clearTimeout(id);
    } catch {
      return undefined;
    }
  }, [isMentor]);

  // keyboard shortcuts (home only — mounted from DashboardHome)
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName?.toLowerCase();
      const editable = e.target?.isContentEditable;
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || editable) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key?.toLowerCase();
      const fire = (fn) => { e.preventDefault(); fn(); };
      if (isMentor) {
        if (k === 'h') return fire(() => navigate('/dashboard/availability'));
        if (k === 'e') return fire(() => navigate('/dashboard/earnings'));
        if (k === 'r') return fire(() => navigate('/dashboard/reviews'));
        if (k === 'p') return fire(() => navigate('/dashboard/profile'));
      } else {
        if (k === 'm') return fire(() => navigate('/mentors'));
        if (k === 's') return fire(() => navigate('/dashboard/saved'));
        if (k === 'b') return fire(() => navigate('/dashboard/billing'));
        if (k === 'p') return fire(() => navigate('/dashboard/profile'));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMentor, navigate]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isMentor ? (
        <>
          <Chip icon={Clock} label="Set hours" kbd="⌃H" to="/dashboard/availability" />
          <Chip icon={DollarSign} label="Open earnings" kbd="⌃E" to="/dashboard/earnings" />
          <Chip icon={Star} label="Open reviews" kbd="⌃R" to="/dashboard/reviews" />
          <Chip icon={UserRound} label="Edit profile" kbd="⌃P" to="/dashboard/profile" />
          <Chip icon={LinkIcon} label="Copy profile link" onClick={copyProfileLink} />
        </>
      ) : (
        <>
          <Chip icon={Search} label="Browse mentors" kbd="⌃M" to="/mentors" />
          <Chip icon={Heart} label="Open saved" kbd="⌃S" to="/dashboard/saved" />
          <Chip icon={CreditCard} label="Open billing" kbd="⌃B" to="/dashboard/billing" />
          <Chip icon={UserRound} label="Edit profile" kbd="⌃P" to="/dashboard/profile" />
          <Chip icon={FileText} label="Resume review" to="/resume" />
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
