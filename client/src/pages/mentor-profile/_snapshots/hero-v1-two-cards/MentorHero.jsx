// ─── MentorHero ───────────────────────────────────────────────────────
function MentorHero({
  mentor,
  rawMentor,
  isFavorited,
  onToggleFavorite,
  onBook,
  onMessage,
  messageLoading,
  messageError,
  heroCtaRef,
  canEngage,
  subscriberReady,
  subscriptionLoading,
  user,
  mentorsListPath = '/mentors',
  embedded = false,
}) {
  const { s } = useContent();
  const roleHeadline = formatRoleHeadline(mentor.title, mentor.company);
  const showBookingGate = canEngage && user && !subscriberReady && !subscriptionLoading;
  const { nextSlot, durationMin, calendarMeta } = useCalendlySummary(mentor);
  const primaryNavHidden = useMentorProfileNavHidden(true);
  const panelStickyTop = `calc(${profileStickyNavTop(embedded, primaryNavHidden)} + 1.5rem)`;

  return (
    <section aria-labelledby="profile-heading" className={`relative ${embedded ? 'pt-6 pb-12 sm:pt-8 sm:pb-16' : 'pt-8 pb-20 sm:pt-12 sm:pb-28 lg:pb-32'}`}>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        <nav className="mb-12 lg:mb-14" aria-label="Back to mentors">
          <Link
            to={mentorsListPath}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${ring}`}
            style={{ color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {s.mentorProfile.allMentors}
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start gap-12 lg:gap-16 xl:gap-20">
          <div
            className={`relative min-w-0 overflow-hidden rounded-[1.75rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 ${canEngage ? '' : 'lg:col-span-2'}`}
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 88%, var(--bridge-canvas))',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <MentorHeroGeometry />
            <div className="relative z-10">
              <div className="flex items-start gap-6 sm:gap-8">
              <div
                className="h-[96px] w-[96px] shrink-0 overflow-hidden rounded-full sm:h-[136px] sm:w-[136px]"
                style={{
                  boxShadow: '0 0 0 4px var(--bridge-surface), 0 0 0 6px color-mix(in srgb, var(--color-primary) 22%, var(--bridge-border))',
                }}
              >
                {mentor.avatarUrl ? (
                  <img
                    src={mentor.avatarUrl}
                    alt={`${mentor.name}${mentor.title ? `, ${mentor.title}` : ''}`}
                    width={272}
                    height={272}
                    loading="eager"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ background: DARK_BG }}>
                    <span className="font-display font-black select-none text-[32px] sm:text-[44px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {(mentor.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1
                    id="profile-heading"
                    className="font-display font-black leading-[1.05]"
                    style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
                  >
                    {mentor.name}
                  </h1>
                  {mentor.isVerified && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-black uppercase whitespace-nowrap"
                      style={{ fontSize: '10px', letterSpacing: '0.14em', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
                    >
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Verified
                    </span>
                  )}
                </div>

                {roleHeadline && (
                  <p className="mt-2" style={{ fontSize: 'clamp(15px, 1.3vw, 18px)', color: 'var(--bridge-text-secondary)' }}>
                    {roleHeadline}
                  </p>
                )}

                <div className="mt-8 space-y-6 lg:mt-10">
                  <MentorHeroMeta mentor={mentor} rawMentor={rawMentor} />
                  <AtAGlance mentor={mentor} roleHeadline={roleHeadline} className="" />
                  <MentorSocialLinks rawMentor={rawMentor} />
                </div>
              </div>
            </div>
            </div>
          </div>

          {canEngage && (
            <MentorSessionPanel
              mentor={mentor}
              rawMentor={rawMentor}
              nextSlot={nextSlot}
              calendarMeta={calendarMeta}
              durationMin={durationMin}
              stickyTop={panelStickyTop}
              user={user}
              subscriberReady={subscriberReady}
              onBook={onBook}
              onMessage={onMessage}
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite}
              favoritedLabel={isFavorited ? s.mentorProfile.savedToFavorites : s.mentorProfile.saveToFavorites}
              signInPath={typeof window !== 'undefined' ? window.location.pathname : '/mentors'}
              heroCtaRef={heroCtaRef}
              subscriptionLoading={subscriptionLoading}
              messageLoading={messageLoading}
              showBookingGate={showBookingGate}
              messageError={messageError}
            />
          )}
        </div>

      </div>
    </section>
  );
}
