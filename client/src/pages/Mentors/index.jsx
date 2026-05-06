import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CustomCursor from '../../components/CustomCursor.jsx';
import { getAllMentors } from '../../api/mentors';
import { getMyFavorites, toggleFavorite } from '../../api/favorites';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import Reveal from '../../components/Reveal';
import { focusRing } from '../../ui';
import MentorMatchWizard from '../../components/MentorMatchWizard';
import { getAIMatchedMentors, saveMenteeAssessment, loadMenteeAssessment } from '../../api/aiMatching';
import { getRemainingUses, hasReachedLimit, recordUsage, LIMITS } from '../../api/aiUsage';
import { PAGE_SIZE, INDUSTRIES, TIERS, SORT_OPTIONS, normalizeMentorId } from './constants';
import MentorCard, { MentorGridSkeleton } from './MentorCard';
import { AiMatchCard, AiHonorableCard } from './AiMatchCards';
import MentorTiersModal from './MentorTiersModal';

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="relative mb-6 flex items-start gap-4 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 shadow-sm dark:border-red-400/25 dark:bg-red-500/8">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="font-semibold text-red-800 dark:text-red-200">Mentors didn't load</p>
        <p className="mt-0.5 text-[13px] text-red-700/80 dark:text-red-300/80">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-red-500 ${focusRing}`}>
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

  // Fetch mentors from server
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({
        search: debouncedSearch, industry: activeIndustry, sortBy, page, pageSize: PAGE_SIZE,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) { setMentors([]); setTotalCount(0); setError(fetchError.message || 'Something went wrong.'); return; }
      setMentors(data ?? []); setTotalCount(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch, activeIndustry, sortBy, page, reloadKey]);

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
      try { await recordUsage(user.id, 'mentor_match'); setRemainingUses(prev => Math.max(0, (prev ?? 1) - 1)); } catch { /* non-fatal */ }
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

  const visibleMentors = mentors.filter(m => {
    if (asMentor && user?.id && m.user_id === user.id) return false;
    if (activeTier && m.tier !== activeTier) return false;
    if (rateMin !== '' && (m.session_rate == null || m.session_rate < Number(rateMin))) return false;
    if (rateMax !== '' && (m.session_rate == null || m.session_rate > Number(rateMax))) return false;
    if (availableOnly && !m.available) return false;
    return true;
  });

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden">

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -10%, var(--bridge-aurora-1), transparent 60%)' }} />

      {/* Hero header */}
      {!aiMode && (
        <section className="bridge-hero-strip relative overflow-hidden pb-8 pt-8 sm:pb-10 sm:pt-12">
          <div aria-hidden className="bridge-ambient-orb absolute -left-28 -top-24 h-80 w-80 opacity-80" />
          <div aria-hidden className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-96 w-96 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)' }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/45 to-transparent" />

          <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/82 px-3.5 py-1.5 shadow-bridge-tile backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--bridge-text-muted)]">
                    {totalCount > 0 ? `${totalCount} mentors available` : 'Browse mentors'}
                  </span>
                </div>
                <h1 className="max-w-4xl font-display text-4xl font-black tracking-[-0.045em] text-[var(--bridge-text)] sm:text-5xl lg:text-6xl">
                  Find the mentor who changes your <span className="text-gradient-bridge">next move</span>.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--bridge-text-muted)] sm:text-lg">
                  Browse vetted operators, founders, executives, and specialists. Compare fit, expertise, availability, and session style before you book.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={`inline-flex items-center justify-center rounded-full bg-[var(--bridge-text)] px-5 py-3 text-sm font-bold text-[var(--bridge-canvas)] shadow-bridge-accent transition hover:-translate-y-0.5 hover:brightness-110 ${focusRing}`}>
                    Explore mentors
                  </button>
                  <button type="button" onClick={() => setShowTiersModal(true)}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/82 px-4 py-3 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-bridge-tile backdrop-blur-xl transition hover:border-orange-400/50 hover:bg-orange-500/8 hover:text-orange-600 dark:hover:border-orange-400/40 dark:hover:text-orange-300 ${focusRing}`}>
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                    Compare tiers
                  </button>
                </div>
              </div>

              {!asMentor && (
                <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/76 p-5 shadow-bridge-float backdrop-blur-xl">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/12 blur-3xl" />
                  <div className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">Personalized search</p>
                    <h2 className="mt-2 font-display text-xl font-black tracking-tight text-[var(--bridge-text)]">Let AI shortlist your best-fit mentors</h2>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--bridge-text-muted)]">Answer a few questions and Bridge will rank mentors against your goals, role, industry, and timeline.</p>
                  {remainingUses !== null && remainingUses > 0 && (
                    <div className="mt-4 flex items-center gap-1.5">
                      {Array.from({ length: LIMITS.mentor_match }).map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i < LIMITS.mentor_match - remainingUses ? 'bg-[var(--bridge-border-strong)]' : 'bg-violet-500 shadow-[0_0_4px_rgba(139,92,246,0.5)]'}`} />
                      ))}
                      <span className="text-[11px] text-[var(--bridge-text-faint)]">{remainingUses} use{remainingUses !== 1 ? 's' : ''} left</span>
                    </div>
                  )}
                  {remainingUses === 0 ? (
                    <span className="mt-4 inline-flex rounded-full border border-[var(--bridge-border)] px-4 py-2 text-[12px] font-medium text-[var(--bridge-text-faint)]">AI matching used up</span>
                  ) : (
                    <button type="button" onClick={handleAiMatchClick}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-3 text-[13px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.55)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_8px_24px_-4px_rgba(139,92,246,0.7)] ${focusRing}`}>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                      Start AI match
                    </button>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Sticky control bar */}
      <div className={`sticky top-[3.75rem] z-30 border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/92 shadow-[0_10px_30px_-28px_rgba(120,45,8,0.6)] backdrop-blur-xl sm:top-16 ${aiMode ? 'opacity-60 pointer-events-none' : ''}`}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 dark:opacity-100"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 12%, transparent) 40%, color-mix(in srgb, var(--color-primary) 12%, transparent) 60%, transparent)' }} />

        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5">
            {/* Search */}
            <div className="group relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search by name, role, company…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/88 py-0 pl-9 pr-8 text-[13px] font-medium text-[var(--bridge-text)] shadow-bridge-tile placeholder:text-[var(--bridge-text-faint)] transition focus:border-orange-400/60 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in srgb, var(--color-primary) 12%, transparent)]" />
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
                <div role="listbox" className="animate-pop-in absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] shadow-bridge-float backdrop-blur-xl">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" role="option" aria-selected={sortBy === opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition ${sortBy === opt.value ? 'bg-[var(--bridge-surface-muted)] font-semibold text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
                      {opt.label}
                      {sortBy === opt.value && (
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-white" aria-hidden>
                          <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <button type="button" onClick={() => setFilterOpen(o => !o)} aria-expanded={filterOpen}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold shadow-bridge-tile transition hover:-translate-y-px ${filterOpen || activeFilterCount > 0 ? 'border-orange-400/50 bg-orange-500/8 text-orange-600 dark:text-orange-300' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)]/88 text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-border-strong)] hover:text-[var(--bridge-text)]'} ${focusRing}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">{activeFilterCount}</span>
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
              <button key={value || 'all'} type="button" onClick={() => setActiveIndustry(value)}
                className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                  activeIndustry === value
                    ? 'bg-[var(--bridge-text)] text-[var(--bridge-canvas)] shadow-bridge-tile'
                    : 'border border-transparent text-[var(--bridge-text-muted)] hover:border-[var(--bridge-border)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'
                } ${focusRing}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <div className="border-t border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/48">
            <div className="mx-auto max-w-[90rem] px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-start gap-6 rounded-[1.25rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/72 p-4 shadow-bridge-tile backdrop-blur-xl">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Tier</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIERS.map(({ label, value }) => (
                      <button key={value || 'all-t'} type="button" onClick={() => setActiveTier(value)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${activeTier === value ? 'bg-[var(--bridge-text)] text-[var(--bridge-canvas)] shadow-bridge-tile' : 'border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
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
                        <input type="number" min="0" placeholder={ph} value={val} onChange={e => set(e.target.value)} aria-label={`${ph} rate`}
                          className="w-24 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-2 pl-5 pr-2.5 text-[13px] font-medium text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] focus:border-orange-400/60 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Status</p>
                  <button type="button" role="switch" aria-checked={availableOnly} onClick={() => setAvailableOnly(v => !v)}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${availableOnly ? 'bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-400/30 dark:text-emerald-300' : 'border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
                    <span className={`flex h-3 w-5 rounded-full transition-colors ${availableOnly ? 'bg-emerald-500' : 'bg-[var(--bridge-border-strong)]'}`}>
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

      {/* AI results section */}
      {aiMode && (
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          {aiLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-24 text-center shadow-bridge-card">
              <div className="animate-blob-breathe relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(139,92,246,0.4)]">
                <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="mt-5 font-display text-xl font-bold text-[var(--bridge-text)]">Finding your best mentors…</p>
              <p className="mt-1.5 text-[13px] text-[var(--bridge-text-muted)]">Our AI is reviewing all profiles for you.</p>
            </div>
          )}

          {!aiLoading && aiError && (
            <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-8 text-center dark:border-red-400/25 dark:bg-red-500/8">
              <p className="font-semibold text-red-800 dark:text-red-200">Something went wrong.</p>
              <p className="mt-1 text-[13px] text-red-700/80 dark:text-red-300/80">{aiError}</p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button type="button" onClick={() => { setAiError(null); handleAiMatchClick(); }}
                  className={`rounded-full bg-red-600 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-red-500 ${focusRing}`}>Retry</button>
                <button type="button" onClick={exitAiMode}
                  className={`rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2 text-[13px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>← Browse all</button>
              </div>
            </div>
          )}

          {!aiLoading && !aiError && aiResults && (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                    AI-Powered Matches
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">Your Top Mentor Matches</h2>
                  {savedMenteeProfile && (
                    <p className="mt-1.5 text-[13px] text-[var(--bridge-text-muted)]">
                      Goal: <span className="font-semibold text-[var(--bridge-text)]">{savedMenteeProfile.target_role ?? 'your target role'}</span>
                      {savedMenteeProfile.target_industry && <> in <span className="font-semibold text-[var(--bridge-text)]">{savedMenteeProfile.target_industry}</span></>}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAiMatchClick}
                    className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>Retake</button>
                  <button type="button" onClick={exitAiMode}
                    className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>← Browse all</button>
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
                <div className="mt-10">
                  <h3 className="mb-4 font-display text-lg font-bold text-[var(--bridge-text-secondary)]">Honorable Mentions</h3>
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

      {/* Mentor grid */}
      <div ref={gridRef} className={`mx-auto max-w-[90rem] scroll-mt-28 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${aiMode ? 'hidden' : ''}`}>

        {asMentor && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/6 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <p className="text-[13px] text-amber-700 dark:text-amber-300">
              You're signed in as a mentor.{' '}
              <Link to="/dashboard" className={`font-semibold underline underline-offset-2 hover:no-underline ${focusRing} rounded-sm`}>Open your dashboard →</Link>
            </p>
          </div>
        )}

        {favoriteMessage && (
          <div className="mb-5 rounded-xl border border-amber-400/25 bg-amber-500/6 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-300" role="status">{favoriteMessage}</div>
        )}

        {error && <FetchErrorBanner message={error} onRetry={loadMentors} />}

        {!loading && !error && totalCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/62 px-4 py-3 shadow-bridge-tile backdrop-blur-xl">
            <p className="text-[13px] text-[var(--bridge-text-muted)]">
              Showing <span className="font-semibold text-[var(--bridge-text)]">{startIdx}–{endIdx}</span> of <span className="font-semibold text-[var(--bridge-text)]">{totalCount}</span> mentors
              {activeFilterCount > 0 && <span className="ml-2 text-[11px] text-[var(--bridge-text-faint)]">· filtered</span>}
            </p>
            {(canPrev || canNext) && (
              <div className="flex items-center gap-2">
                <button type="button" disabled={!canPrev} onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:-translate-y-px hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>← Prev</button>
                <span className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-[12px] font-bold text-[var(--bridge-text-faint)]">{page + 1}</span>
                <button type="button" disabled={!canNext} onClick={() => changePage(page + 1)}
                  className={`rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:-translate-y-px hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>Next →</button>
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
              <div className="mt-12 flex items-center justify-center gap-2">
                <button type="button" disabled={!canPrev} onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-[13px] font-semibold text-[var(--bridge-text-secondary)] shadow-bridge-tile transition hover:-translate-y-px hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>← Previous</button>
                <span className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-2 text-[12px] font-bold text-[var(--bridge-text-faint)] shadow-bridge-tile">Page {page + 1}</span>
                <button type="button" disabled={!canNext} onClick={() => changePage(page + 1)}
                  className={`rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-[13px] font-semibold text-[var(--bridge-text-secondary)] shadow-bridge-tile transition hover:-translate-y-px hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>Next →</button>
              </div>
            )}
          </div>
        ) : !error ? (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface)]/66 px-6 py-24 text-center shadow-bridge-card backdrop-blur-xl">
            <div aria-hidden className="pointer-events-none absolute -top-20 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-tile">
              <svg className="h-6 w-6 text-orange-500/80" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            </div>
            <p className="relative mt-4 font-display text-xl font-bold text-[var(--bridge-text)]">Nobody fits that combo</p>
            <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--bridge-text-muted)]">Try loosening a filter or using a different keyword.</p>
            <button type="button" onClick={resetFilters}
              className={`relative mt-5 rounded-xl bg-[var(--bridge-text)] px-5 py-2.5 text-[13px] font-bold text-[var(--bridge-canvas)] shadow-bridge-accent transition hover:-translate-y-px hover:brightness-110 ${focusRing}`}>
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
