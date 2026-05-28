// ─── ProfileSkeleton ──────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>
      <AuroraBg />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12 pb-28">
        <div className="h-4 w-28 bridge-skeleton rounded-full mb-14" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16">
          <div className="flex items-start gap-6 sm:gap-8 lg:py-2">
            <div className="h-[96px] w-[96px] shrink-0 bridge-skeleton rounded-full sm:h-[136px] sm:w-[136px]" />
            <div className="min-w-0 flex-1 space-y-6 pt-1">
              <div className="space-y-3">
                <div className="h-10 w-64 bridge-skeleton rounded-xl" />
                <div className="h-5 w-48 bridge-skeleton rounded" />
              </div>
              <div className="h-4 w-56 bridge-skeleton rounded" />
              <div className="flex gap-2">
                <div className="h-7 w-24 bridge-skeleton rounded-full" />
                <div className="h-7 w-28 bridge-skeleton rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-[1.35rem] p-8 bridge-skeleton lg:min-h-[28rem]" />
        </div>
      </div>
    </div>
  );
}
