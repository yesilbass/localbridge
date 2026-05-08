import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllMentors } from '../../api/mentors';
import { getMyFavorites, toggleFavorite } from '../../api/favorites';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import Reveal from '../../components/Reveal';
import { focusRing } from '../../ui';
import MentorMatchWizard from '../../components/MentorMatchWizard';
import { getAIMatchedMentors, saveMenteeAssessment, loadMenteeAssessment } from '../../api/aiMatching';
import { getRemainingUses, hasReachedLimit, LIMITS } from '../../api/aiUsage';
import { PAGE_SIZE, INDUSTRIES, TIERS, SORT_OPTIONS, normalizeMentorId } from './constants';
import MentorCard, { MentorGridSkeleton } from './MentorCard';
import { AiMatchCard, AiHonorableCard } from './AiMatchCards';
import MentorTiersModal from './MentorTiersModal';
import { AuroraBg } from '../dashboard/dashboardCinematic.jsx';

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div
      className="relative mb-6 flex items-start gap-4 overflow-hidden rounded-2xl px-5 py-4"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface))',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-error) 30%, var(--bridge-border))',
      }}
    >
      <div
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: 'var(--color-error)' }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="font-semibold" style={{ color: 'var(--color-error)' }}>Mentors didn't load</p>
        <p className="mt-0.5 text-[13px]" style={{ color: 'color-mix(in srgb, var(--color-error) 75%, var(--bridge-text))' }}>{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-110 ${focusRing}`}
            style={{ backgroundColor: 'var(--color-error)' }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const asMentor  = user ? isMentorAccount(user) : false;

  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry]   = useState('');
  const [activeTier, setActiveTier]           = useState('');
  const [sortBy, setSortBy]                   = useState('rating');
  const [page, setPage]                       = useState(0);
  const [mentors, setMentors]                 = useState([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [reloadKey, setReloadKey]             = useState(0);
  const [favoriteIds, setFavoriteIds]         = useState(() => new Set());
  const [favoriteBusyId, setFavoriteBusyId]   = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState(null);
  const [filterOpen, setFilterOpen]           = useState(false);
  const [sortOpen, setSortOpen]               = useState(false);
  const [rateMin, setRateMin]                 = useState('');
  const [rateMax, setRateMax]                 = useState('');
  const [availableOnly, setAvailableOnly]     = useState(false);
  const gridRef = useRef(null);
  const sortRef = useRef(null);

  const [showTiersModal, setShowTiersModal]         = useState(false);
  const [wizardOpen, setWizardOpen]                 = useState(false);
  const [aiMode, setAiMode]                         = useState(false);
  const [aiLoading, setAiLoading]                   = useState(false);
  const [aiError, setAiError]                       = useState(null);
  const [remainingUses, setRemainingUses]           = useState(null);
  const [aiResults, setAiResults]                   = useState(null);
  const [allMentorsForAi, setAllMentorsForAi]       = useState([]);
  const [savedMenteeProfile, setSavedMenteeProfile] = useState(null);
  const [prefillData, setPrefillData]               = useState(null);
  const didAutoOpenRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 0 when any filter/sort changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeIndustry, activeTier, sortBy, rateMin, rateMax, availableOnly]);

  // Load favorites for mentee users
  useEffect(() => {
    if (!user || isMentorAccount(user)) { setFavoriteIds(new Set()); return; }
    void getMyFavorites().then(({ data, error: e }) => {
      if (e) {
        const m = e.message || String(e);
        if (m.includes('favorites') || m.includes('schema cache') || m.includes('does not exist')) {
          setFavoriteMessage("Hearts need a favorites table.");
        }
        setFavoriteIds(new Set());
        return;
      }
      setFavoriteMessage(null);
      setFavoriteIds(new Set(data ?? []));
    });
  }, [user]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function outside(e) { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [sortOpen]);

  // Fetch mentors from server — all active filters applied server-side so pagination counts are accurate
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({
        search: debouncedSearch, industry: activeIndustry, tier: activeTier,
        availableOnly, rateMin, rateMax, sortBy, page, pageSize: PAGE_SIZE,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) { setMentors([]); setTotalCount(0); setError(fetchError.message || 'Something went wrong.'); return; }
      setMentors(data ?? []); setTotalCount(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch, activeIndustry, activeTier, availableOnly, rateMin, rateMax, sortBy, page, reloadKey]);

  const loadMentors = useCallback(() => { setLoading(true); setError(null); setReloadKey(k => k + 1); }, []);

  // Load remaining AI uses for mentees
  useEffect(() => {
    if (!user || isMentorAccount(user)) return;
    void getRemainingUses(user.id, 'mentor_match').then(setRemainingUses);
  }, [user]);

  // Auto-open AI wizard if navigated here with that intent
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (location.state?.openAIMatch && user) {
      didAutoOpenRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      handleAiMatchClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state?.openAIMatch]);

  async function handleAiMatchClick() {
    if (!user) { navigate('/login', { state: { message: 'Please log in to use AI mentor matching' } }); return; }
    if (await hasReachedLimit(user.id, 'mentor_match')) return;
    const { data: existing } = await loadMenteeAssessment(user.id);
    setPrefillData(existing ?? null);
    setWizardOpen(true);
  }

  async function handleWizardComplete(formData) {
    setWizardOpen(false); setAiLoading(true); setAiError(null); setAiMode(true);
    try {
      const profilePayload = {
        current_position: formData.currentPosition,
        target_role: formData.targetRole,
        target_industry: formData.targetIndustry,
        years_experience: formData.yearsExperience,
        top_goals: formData.topGoals,
        session_types_needed: formData.sessionTypesNeeded,
        availability: formData.availability,
        bio_summary: formData.bioSummary,
        resume_uploaded: Boolean(formData.resumeBase64),
        assessment_completed_at: new Date().toISOString(),
      };
      const { data: savedProfile } = await saveMenteeAssessment(user.id, profilePayload);
      setSavedMenteeProfile(savedProfile ?? profilePayload);
      const { data: mentorData } = await getAllMentors({ pageSize: 200 });
      const fetchedMentors = mentorData ?? [];
      setAllMentorsForAi(fetchedMentors);
      const results = await getAIMatchedMentors({
        menteeProfile: savedProfile ?? profilePayload,
        mentors: fetchedMentors,
        resumeText: formData.resumeBase64 ?? null,
      });
      setAiResults(results);
      setRemainingUses(prev => Math.max(0, (prev ?? 1) - 1));
    } catch (e) {
      setAiError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  function exitAiMode() { setAiMode(false); setAiResults(null); setAiError(null); setAllMentorsForAi([]); }
  function getMentorForMatch(id) { return allMentorsForAi.find(m => m.id === id) ?? mentors.find(m => m.id === id) ?? null; }

  const onToggleFavorite = useCallback(async mentorId => {
    const key = normalizeMentorId(mentorId);
    setFavoriteBusyId(key); setFavoriteMessage(null);
    const { error: err } = await toggleFavorite(mentorId);
    if (err) {
      const msg = err.message || String(err);
      setFavoriteMessage(
        msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache')
          ? 'Could not save — favorites table missing.'
          : msg
      );
    }
    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) setFavoriteIds(new Set(data));
    setFavoriteBusyId(null);
  }, []);

  function changePage(next) {
    setPage(next);
    const rect = gridRef.current?.getBoundingClientRect();
    if (rect && rect.top < 0) gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetFilters() {
    setSearch(''); setActiveIndustry(''); setActiveTier(''); setSortBy('rating');
    setRateMin(''); setRateMax(''); setAvailableOnly(false); setPage(0);
  }

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx   = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev  = page > 0;
  const canNext  = endIdx < totalCount;

  const activeFilterCount =
    (activeIndustry ? 1 : 0) + (activeTier ? 1 : 0) + (debouncedSearch ? 1 : 0) +
    (rateMin !== '' || rateMax !== '' ? 1 : 0) + (availableOnly ? 1 : 0);

  // Only exclude the mentor's own card — all other filters are applied server-side
  const visibleMentors = mentors.filter(m => !(asMentor && user?.id && m.user_id === user.id));

  return (
    <main role="main" className="relative isolate min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <AuroraBg />

      {/* Hero — directory-page header: confident, compact, anchored to context.
          Mentors are the protagonist; the hero exists to frame them, not eclipse them. */}
      {!aiMode && (
        <section
          aria-labelledby="mentors-heading"
          className="relative overflow-hidden px-5 pt-12 pb-6 sm:px-8 lg:pt-14 lg:pb-8"
        >
          {/* Subtle accent glow — sits behind the headline, fades into the grid below */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-[8%] top-[-30%] h-[100%] w-[55%] rounded-full blur-[100px]"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 30%, transparent) 0%, transparent 70%)',
                opacity: 0.32,
              }}
            />
            <div
              className="absolute -right-[10%] top-[-20%] h-[80%] w-[40%] rounded-full blur-[110px]"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 36%, transparent) 0%, transparent 70%)',
                opacity: 0.20,
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              {/* Left: live-count, headline, supporting line */}
              <div className="min-w-0 max-w-2xl">
                {/* Live-count eyebrow pill */}
                <div
                  className="mb-3 inline-flex items-center gap-2.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow:
                      '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: '#10b981' }}
                  />
                  <span style={{ color: 'var(--bridge-text-muted)' }}>
                    {totalCount > 0
                      ? `${totalCount.toLocaleString()} mentors live · updated in real-time`
                      : 'Browse the Bridge mentor directory'}
                  </span>
                </div>

                {/* Compact, single-line headline */}
                <h1
                  id="mentors-heading"
                  className="font-display font-black"
                  style={{
                    fontSize: 'clamp(1.85rem, 3.6vw, 2.75rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.025em',
                    color: 'var(--bridge-text)',
                    fontFeatureSettings: '"kern" 1, "ss01" 1',
                  }}
                >
                  Find the mentor who's{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)',
                    }}
                  >
                    already done it
                  </span>
                  .
                </h1>

                {/* One supporting line — context, not pitch */}
                <p
                  className="mt-2 max-w-xl text-[14px] sm:text-[15px]"
                  style={{ color: 'var(--bridge-text-muted)', lineHeight: 1.55 }}
                >
                  Vetted founders, executives, and specialists. Search, filter, book in 60 seconds.
                </p>
              </div>

              {/* Right: inline secondary affordances — AI match + compare tiers */}
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  {!asMentor && remainingUses !== 0 && (
                    <button
                      type="button"
                      onClick={handleAiMatchClick}
                      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-bold transition hover:-translate-y-0.5 ${focusRing}`}
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        boxShadow:
                          '0 14px 32px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                      }}
                    >
                      <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
                      <svg className="relative z-10 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                      <span className="relative z-10">AI match</span>
                    </button>
                  )}
                  {!asMentor && remainingUses === 0 && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium"
                      style={{
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                        color: 'var(--bridge-text-faint)',
                      }}
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                      AI matching used up
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTiersModal(true)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${focusRing}`}
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      backgroundColor: 'transparent',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border-strong)';
                      e.currentTarget.style.color = 'var(--bridge-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
                      e.currentTarget.style.color = 'var(--bridge-text-secondary)';
                    }}
                  >
                    Compare tiers
                  </button>
                </div>

                {/* Tiny usage indicator beneath the AI button — preserves the "X uses left" feedback */}
                {!asMentor && remainingUses !== null && remainingUses > 0 && (
                  <div className="flex items-center gap-1.5 pr-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: LIMITS.mentor_match }).map((_, i) => {
                        const used = i < LIMITS.mentor_match - remainingUses;
                        return (
                          <span
                            key={i}
                            className="h-1 w-1 rounded-full"
                            style={{
                              backgroundColor: used
                                ? 'var(--bridge-border-strong)'
                                : 'var(--color-primary)',
                              boxShadow: used
                                ? 'none'
                                : '0 0 4px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                            }}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--bridge-text-faint)' }}>
                      {remainingUses} AI {remainingUses === 1 ? 'match' : 'matches'} left
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sticky control bar — softened: no top accent strip, palette-token shadow */}
      <div
        className={`sticky top-[3.75rem] z-30 backdrop-blur-xl sm:top-16 ${aiMode ? 'opacity-60 pointer-events-none' : ''}`}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 88%, transparent)',
          borderBottom: '1px solid var(--bridge-border)',
          boxShadow: '0 10px 30px -28px color-mix(in srgb, var(--color-primary) 35%, transparent)',
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-2 py-2.5">
            {/* Search */}
            <div className="group relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition"
                style={{ color: 'var(--bridge-text-faint)' }}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, role, company…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl py-0 pl-9 pr-8 text-[13px] font-medium transition focus:outline-none"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 88%, transparent)',
                  color: 'var(--bridge-text)',
                  boxShadow: '0 0 0 1px var(--bridge-border) inset',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in srgb, var(--color-primary) 55%, var(--bridge-border)) inset, 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--bridge-border) inset';
                }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear"
                  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[var(--bridge-text-faint)] transition hover:text-[var(--bridge-text)]">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Sort */}
            <div ref={sortRef} className="relative hidden sm:block">
              <button type="button" onClick={() => setSortOpen(o => !o)} aria-haspopup="listbox" aria-expanded={sortOpen}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/88 px-3 text-[12px] font-semibold text-[var(--bridge-text-secondary)] shadow-bridge-tile transition hover:-translate-y-px hover:border-[var(--bridge-border-strong)] hover:text-[var(--bridge-text)] ${focusRing}`}>
                <svg className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 12h12M10 16.5h4" /></svg>
                <span className="hidden lg:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <span className="lg:hidden">Sort</span>
                <svg className={`h-3 w-3 shrink-0 text-[var(--bridge-text-faint)] transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {sortOpen && (
                <div
                  role="listbox"
                  className="animate-pop-in absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl backdrop-blur-xl"
                  style={{
                    backgroundColor: 'var(--bridge-surface-raised)',
                    boxShadow:
                      'inset 0 0 0 1px var(--bridge-border), 0 18px 40px -18px color-mix(in srgb, var(--color-primary) 28%, transparent)',
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" role="option" aria-selected={sortBy === opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition ${sortBy === opt.value ? 'bg-[var(--bridge-surface-muted)] font-semibold text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
                      {opt.label}
                      {sortBy === opt.value && (
                        <span
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                          aria-hidden
                        >
                          <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold transition hover:-translate-y-px ${focusRing}`}
              style={
                filterOpen || activeFilterCount > 0
                  ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                    }
                  : {
                      backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 88%, transparent)',
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }
              }
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="hidden h-5 w-px bg-[var(--bridge-border)] sm:block" />

            {activeFilterCount > 0 && (
              <button type="button" onClick={resetFilters}
                className={`hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[var(--bridge-text-faint)] transition hover:text-[var(--bridge-text)] sm:inline-flex ${focusRing}`}>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>

          {/* Industry chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INDUSTRIES.map(({ label, value }) => (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => setActiveIndustry(value)}
                className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${focusRing}`}
                style={
                  activeIndustry === value
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        boxShadow: '0 4px 14px -6px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--bridge-text-muted)',
                      }
                }
                onMouseEnter={(e) => {
                  if (activeIndustry === value) return;
                  e.currentTarget.style.backgroundColor = 'var(--bridge-surface-muted)';
                  e.currentTarget.style.color = 'var(--bridge-text)';
                }}
                onMouseLeave={(e) => {
                  if (activeIndustry === value) return;
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--bridge-text-muted)';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <div
            style={{
              borderTop: '1px solid var(--bridge-border)',
              backgroundColor: 'color-mix(in srgb, var(--bridge-surface-muted) 60%, transparent)',
            }}
          >
            <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
              <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Tier</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIERS.map(({ label, value }) => (
                      <button
                        key={value || 'all-t'}
                        type="button"
                        onClick={() => setActiveTier(value)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${focusRing}`}
                        style={
                          activeTier === value
                            ? {
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-on-primary)',
                                boxShadow: '0 4px 14px -6px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                              }
                            : {
                                backgroundColor: 'var(--bridge-surface)',
                                color: 'var(--bridge-text-secondary)',
                                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                              }
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Rate / session</p>
                  <div className="flex items-center gap-2">
                    {[['rateMin', rateMin, setRateMin, 'Min'], ['rateMax', rateMax, setRateMax, 'Max']].map(([key, val, set, ph]) => (
                      <div key={key} className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--bridge-text-faint)]">$</span>
                        <input
                          type="number"
                          min="0"
                          placeholder={ph}
                          value={val}
                          onChange={e => set(e.target.value)}
                          aria-label={`${ph} rate`}
                          className="w-24 rounded-xl py-2 pl-5 pr-2.5 text-[13px] font-medium focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bridge-surface)',
                            color: 'var(--bridge-text)',
                            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                          }}
                          onFocus={(e) => { e.currentTarget.style.boxShadow = `inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 60%, var(--bridge-border))`; }}
                          onBlur={(e) => { e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Status</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={availableOnly}
                    onClick={() => setAvailableOnly(v => !v)}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${focusRing}`}
                    style={
                      availableOnly
                        ? {
                            backgroundColor: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
                            color: 'var(--color-success)',
                            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-success) 35%, transparent)',
                          }
                        : {
                            backgroundColor: 'var(--bridge-surface)',
                            color: 'var(--bridge-text-secondary)',
                            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                          }
                    }
                  >
                    <span
                      className="flex h-3 w-5 rounded-full transition-colors"
                      style={{ backgroundColor: availableOnly ? 'var(--color-success)' : 'var(--bridge-border-strong)' }}
                    >
                      <span className={`m-0.5 h-2 w-2 rounded-full bg-white shadow transition-transform ${availableOnly ? 'translate-x-2' : ''}`} />
                    </span>
                    Available now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI results section — sits on the same canvas, no boxed slabs */}
      {aiMode && (
        <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-10 sm:px-8 lg:pt-16">
          {aiLoading && (
            <div
              className="flex flex-col items-center justify-center rounded-3xl py-24 text-center"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 30px 60px -28px color-mix(in srgb, var(--color-primary) 24%, transparent)',
              }}
            >
              <div
                className="animate-blob-breathe relative flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                  boxShadow: '0 0 32px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                }}
              >
                <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="mt-5 font-display text-xl font-bold" style={{ color: 'var(--bridge-text)' }}>Finding your best mentors…</p>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>Our AI is reviewing all profiles for you.</p>
            </div>
          )}

          {!aiLoading && aiError && (
            <div
              className="rounded-3xl px-6 py-10 text-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-error) 6%, var(--bridge-surface))',
                boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-error) 25%, var(--bridge-border))',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--color-error)' }}>Something went wrong.</p>
              <p className="mt-1 text-[13px]" style={{ color: 'color-mix(in srgb, var(--color-error) 70%, var(--bridge-text))' }}>{aiError}</p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => { setAiError(null); handleAiMatchClick(); }}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-error)' }}
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={exitAiMode}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  ← Browse all
                </button>
              </div>
            </div>
          )}

          {!aiLoading && !aiError && aiResults && (
            <>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div
                    className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)',
                    }}
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                    AI-Powered Matches
                  </div>
                  <h2
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                      letterSpacing: '-0.025em',
                      color: 'var(--bridge-text)',
                      lineHeight: 1.05,
                    }}
                  >
                    Your top mentor matches.
                  </h2>
                  {savedMenteeProfile && (
                    <p className="mt-2 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                      Goal: <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{savedMenteeProfile.target_role ?? 'your target role'}</span>
                      {savedMenteeProfile.target_industry && <> in <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{savedMenteeProfile.target_industry}</span></>}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAiMatchClick}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold transition hover:-translate-y-px ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={exitAiMode}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold transition hover:-translate-y-px ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    ← Browse all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {aiResults.top_matches.map(match => {
                  const mentor = getMentorForMatch(match.mentor_id);
                  if (!mentor) return null;
                  return <AiMatchCard key={match.mentor_id} mentor={mentor} match={match} />;
                })}
              </div>

              {aiResults.honorable_mentions.length > 0 && (
                <div className="mt-14">
                  <h3 className="mb-5 font-display text-lg font-bold" style={{ color: 'var(--bridge-text-secondary)' }}>Honorable Mentions</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {aiResults.honorable_mentions.map(match => {
                      const mentor = getMentorForMatch(match.mentor_id);
                      if (!mentor) return null;
                      return <AiHonorableCard key={match.mentor_id} mentor={mentor} match={match} />;
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mentor grid — flows directly on the page canvas, tight to the sticky bar so cards appear above the fold */}
      <div
        ref={gridRef}
        className={`relative mx-auto max-w-7xl scroll-mt-28 px-5 pt-6 pb-24 sm:px-8 lg:pb-32 ${aiMode ? 'hidden' : ''}`}
      >

        {asMentor && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, var(--bridge-surface))',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 28%, var(--bridge-border))',
            }}
          >
            <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-warning)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <p className="text-[13px]" style={{ color: 'color-mix(in srgb, var(--color-warning) 80%, var(--bridge-text))' }}>
              You're signed in as a mentor.{' '}
              <Link to="/dashboard" className={`font-semibold underline underline-offset-2 hover:no-underline ${focusRing} rounded-sm`}>Open your dashboard →</Link>
            </p>
          </div>
        )}

        {favoriteMessage && (
          <div
            className="mb-6 rounded-2xl px-4 py-3 text-[13px]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, var(--bridge-surface))',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-warning) 28%, var(--bridge-border))',
              color: 'color-mix(in srgb, var(--color-warning) 80%, var(--bridge-text))',
            }}
            role="status"
          >
            {favoriteMessage}
          </div>
        )}

        {error && <FetchErrorBanner message={error} onRetry={loadMentors} />}

        {!loading && !error && totalCount > 0 && (
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{startIdx}–{endIdx}</span> of <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{totalCount.toLocaleString()}</span> mentors
              {activeFilterCount > 0 && <span className="ml-2 text-[11px]" style={{ color: 'var(--bridge-text-faint)' }}>· filtered</span>}
            </p>
            {(canPrev || canNext) && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  ← Prev
                </button>
                <span
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-bold tabular-nums"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-faint)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  {page + 1}
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => changePage(page + 1)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <MentorGridSkeleton />
        ) : visibleMentors.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleMentors.map((mentor, i) => (
                <Reveal key={mentor.id} delay={Math.min(i * 25, 120)} className="h-full">
                  <MentorCard
                    mentor={mentor}
                    isFavorite={favoriteIds.has(normalizeMentorId(mentor.id))}
                    onToggleFavorite={onToggleFavorite}
                    user={user}
                    navigate={navigate}
                    favoriteBusy={favoriteBusyId === normalizeMentorId(mentor.id)}
                    favoritesEnabled={!asMentor}
                  />
                </Reveal>
              ))}
            </div>

            {(canPrev || canNext) && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  ← Previous
                </button>
                <span
                  className="rounded-full px-4 py-2 text-[12px] font-bold tabular-nums"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-faint)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  Page {page + 1}
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => changePage(page + 1)}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    color: 'var(--bridge-text-secondary)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        ) : !error ? (
          <div
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-24 text-center"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 30px 60px -28px color-mix(in srgb, var(--color-primary) 22%, transparent)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 h-48 w-48 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%)' }}
            />
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 8px 20px -10px color-mix(in srgb, var(--color-primary) 24%, transparent)',
              }}
            >
              <svg className="h-6 w-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            </div>
            <p className="relative mt-5 font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>Nobody fits that combo</p>
            <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: 'var(--bridge-text-muted)' }}>Try loosening a filter or using a different keyword.</p>
            <button
              type="button"
              onClick={resetFilters}
              className={`relative mt-6 rounded-full px-6 py-3 text-[13px] font-bold transition hover:-translate-y-0.5 hover:brightness-110 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 14px 32px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              }}
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      {wizardOpen && (
        <MentorMatchWizard prefill={prefillData} onComplete={handleWizardComplete} onClose={() => setWizardOpen(false)} />
      )}
      {showTiersModal && <MentorTiersModal onClose={() => setShowTiersModal(false)} />}
    </main>
  );
}
