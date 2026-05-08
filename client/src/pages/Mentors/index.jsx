import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import MentorMatchWizard from '../../components/MentorMatchWizard';
import { getAllMentors } from '../../api/mentors';
import { getAIMatchedMentors, saveMenteeAssessment, loadMenteeAssessment } from '../../api/aiMatching';
import { getRemainingUses, hasReachedLimit, recordUsage, LIMITS } from '../../api/aiUsage';
import { focusRing } from '../../ui';
import { AiMatchCard, AiHonorableCard } from './AiMatchCards';
import MentorTiersModal from './MentorTiersModal';
import MentorsHeader from './MentorsHeader';
import LiveFilter from './LiveFilter';
import ResultsMeta from './ResultsMeta';
import MentorsGrid from './MentorsGrid';
import MentorsPagination from './MentorsPagination';
import { useMentorFilters, useMentorQuery, useMentorDensity } from './mentorsHooks';

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const asMentor = user ? isMentorAccount(user) : false;
  const gridRef = useRef(null);

  const { filters, setFilter, clearAll, activeCount } = useMentorFilters();
  const { mentors, total, isLoading, isError, reload } = useMentorQuery(filters, filters.page);
  const [density, setDensity] = useMentorDensity();

  // Exclude the mentor's own card
  const visibleMentors = mentors.filter(
    m => !(asMentor && user?.id && m.user_id === user.id)
  );

  // AI matching state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [remainingUses, setRemainingUses] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [allMentorsForAi, setAllMentorsForAi] = useState([]);
  const [savedMenteeProfile, setSavedMenteeProfile] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const didAutoOpenRef = useRef(false);

  useEffect(() => {
    if (!user || isMentorAccount(user)) return;
    void getRemainingUses(user.id, 'mentor_match').then(setRemainingUses);
  }, [user]);

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
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to use AI mentor matching' } });
      return;
    }
    if (await hasReachedLimit(user.id, 'mentor_match')) return;
    const { data: existing } = await loadMenteeAssessment(user.id);
    setPrefillData(existing ?? null);
    setWizardOpen(true);
  }

  async function handleWizardComplete(formData) {
    setWizardOpen(false);
    setAiLoading(true);
    setAiError(null);
    setAiMode(true);
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
      setAllMentorsForAi(mentorData ?? []);
      const results = await getAIMatchedMentors({
        menteeProfile: savedProfile ?? profilePayload,
        mentors: mentorData ?? [],
        resumeText: formData.resumeBase64 ?? null,
      });
      setAiResults(results);
      try {
        await recordUsage(user.id, 'mentor_match');
        setRemainingUses(prev => Math.max(0, (prev ?? 1) - 1));
      } catch { /* non-fatal */ }
    } catch (e) {
      setAiError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  function exitAiMode() {
    setAiMode(false);
    setAiResults(null);
    setAiError(null);
    setAllMentorsForAi([]);
  }

  function getMentorForMatch(id) {
    return allMentorsForAi.find(m => m.id === id) ?? mentors.find(m => m.id === id) ?? null;
  }

  const handleSortChange = useCallback(
    (value) => setFilter('sort', value),
    [setFilter]
  );

  const handlePageChange = useCallback(
    (n) => setFilter('page', n),
    [setFilter]
  );

  return (
    <main role="main" className="relative isolate min-h-screen overflow-x-hidden">

      {/* AI mode: full-screen results */}
      {aiMode && (
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8">
          {aiLoading && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-24 text-center"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div className="animate-blob-breathe relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(139,92,246,0.4)]">
                <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="mt-5 font-display text-xl font-bold" style={{ color: 'var(--bridge-text)' }}>
                Finding your best mentors…
              </p>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                Reviewing all profiles for your goals.
              </p>
            </div>
          )}

          {!aiLoading && aiError && (
            <div
              className="rounded-2xl px-6 py-8 text-center"
              style={{
                border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-error) 6%, transparent)',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--bridge-text)' }}>Something went wrong.</p>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>{aiError}</p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => { setAiError(null); handleAiMatchClick(); }}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={exitAiMode}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${focusRing}`}
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    color: 'var(--bridge-text-secondary)',
                  }}
                >
                  ← Browse all
                </button>
              </div>
            </div>
          )}

          {!aiLoading && !aiError && aiResults && (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    AI-Powered Matches
                  </div>
                  <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--bridge-text)' }}>
                    Your Top Mentor Matches
                  </h2>
                  {savedMenteeProfile && (
                    <p className="mt-1.5 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                      Goal:{' '}
                      <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
                        {savedMenteeProfile.target_role ?? 'your target role'}
                      </span>
                      {savedMenteeProfile.target_industry && (
                        <> in{' '}
                          <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>
                            {savedMenteeProfile.target_industry}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAiMatchClick}
                    className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                      color: 'var(--bridge-text-secondary)',
                    }}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={exitAiMode}
                    className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                      color: 'var(--bridge-text-secondary)',
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
                <div className="mt-10">
                  <h3 className="mb-4 font-display text-lg font-bold" style={{ color: 'var(--bridge-text-secondary)' }}>
                    Honorable Mentions
                  </h3>
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

      {/* Main browse view */}
      {!aiMode && (
        <section aria-labelledby="mentors-heading">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <MentorsHeader total={total} />

            {/* AI match CTA (mentee-only) */}
            {!asMentor && (
              <div
                className="mb-6 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                    AI matching
                  </p>
                  <p className="text-[14px] mt-0.5" style={{ color: 'var(--bridge-text-secondary)' }}>
                    Let Bridge rank mentors against your goals, role, and timeline.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {remainingUses !== null && remainingUses > 0 && (
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                      {remainingUses} use{remainingUses !== 1 ? 's' : ''} left
                    </span>
                  )}
                  {remainingUses === 0 ? (
                    <span
                      className="rounded-full px-4 py-2 text-[12px] font-medium"
                      style={{
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                        color: 'var(--bridge-text-faint)',
                      }}
                    >
                      AI matching used up
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAiMatchClick}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-0.5 ${focusRing}`}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        boxShadow: '0 4px 16px -4px rgba(139,92,246,0.55)',
                      }}
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      Start AI match
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTiersModal(true)}
                    className={`text-[12px] font-semibold transition ${focusRing}`}
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    Compare tiers
                  </button>
                </div>
              </div>
            )}

            <LiveFilter
              total={total}
              density={density}
              onDensityChange={setDensity}
            />

            <ResultsMeta
              total={total}
              sort={filters.sort}
              onSortChange={handleSortChange}
              density={density}
              onDensityChange={setDensity}
            />

            <MentorsGrid
              mentors={visibleMentors}
              total={total}
              isLoading={isLoading}
              isError={isError}
              density={density}
              filters={filters}
              activeCount={activeCount}
              onClearAll={clearAll}
              onRetry={reload}
              gridRef={gridRef}
            />

            <MentorsPagination
              page={filters.page}
              total={total}
              onPageChange={handlePageChange}
              gridRef={gridRef}
            />
          </div>
        </section>
      )}

      {wizardOpen && (
        <MentorMatchWizard
          prefill={prefillData}
          onComplete={handleWizardComplete}
          onClose={() => setWizardOpen(false)}
        />
      )}
      {showTiersModal && <MentorTiersModal onClose={() => setShowTiersModal(false)} />}
    </main>
  );
}
