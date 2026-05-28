import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import PaywallPrompt from '../../components/PaywallPrompt';

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

export default forwardRef(function MentorHeroActions(
  {
    layout = 'inline',
    user,
    subscriberReady,
    onBook,
    onMessage,
    onToggleFavorite,
    isFavorited,
    favoritedLabel,
    heroCtaRef,
    subscriptionLoading,
    messageLoading,
    showBookingGate,
    signInPath = '/mentors',
  },
  _ref,
) {
  const showSignIn = !user;
  const isPanel = layout === 'panel';

  if (showBookingGate) {
    return <PaywallPrompt feature="booking" />;
  }

  const primaryClass = `inline-flex w-full items-center justify-center rounded-full px-7 py-4 text-[15px] font-black tracking-wide transition-all hover:-translate-y-0.5 ${ring}`;
  const primaryStyle = {
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
  };

  const secondaryClass = `inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold transition-all disabled:opacity-60 ${ring}`;

  if (isPanel) {
    return (
      <div className="flex w-full flex-col gap-3">
        {showSignIn && (
          <Link ref={heroCtaRef} to="/login" state={{ from: signInPath }} className={primaryClass} style={primaryStyle}>
            Sign in to book
          </Link>
        )}

        {user && subscriberReady && (
          <button
            ref={heroCtaRef}
            type="button"
            onClick={onBook}
            disabled={subscriptionLoading}
            className={`${primaryClass} disabled:opacity-60`}
            style={primaryStyle}
          >
            Book a session →
          </button>
        )}

        {user && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onMessage}
              disabled={subscriptionLoading || messageLoading}
              className={secondaryClass}
              style={{ borderColor: 'var(--bridge-border-strong)', backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              {messageLoading ? 'Opening…' : 'Message'}
            </button>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={favoritedLabel}
                className={secondaryClass}
                style={{
                  borderColor: isFavorited ? 'color-mix(in srgb, #ef4444 30%, var(--bridge-border))' : 'var(--bridge-border-strong)',
                  backgroundColor: isFavorited
                    ? 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface-muted))'
                    : 'var(--bridge-surface-muted)',
                  color: isFavorited ? '#ef4444' : 'var(--bridge-text-secondary)',
                }}
              >
                <Heart
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                  style={{ fill: isFavorited ? '#ef4444' : 'none', color: isFavorited ? '#ef4444' : 'currentColor' }}
                />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      {showSignIn && (
        <Link ref={heroCtaRef} to="/login" state={{ from: signInPath }} className={`${primaryClass} sm:w-auto sm:min-w-[12rem]`} style={primaryStyle}>
          Sign in to book
        </Link>
      )}

      {user && subscriberReady && (
        <button
          ref={heroCtaRef}
          type="button"
          onClick={onBook}
          disabled={subscriptionLoading}
          className={`${primaryClass} disabled:opacity-60 sm:w-auto sm:min-w-[12rem]`}
          style={primaryStyle}
        >
          Book a session →
        </button>
      )}

      {user && (
        <>
          <button
            type="button"
            onClick={onMessage}
            disabled={subscriptionLoading || messageLoading}
            className={`${secondaryClass} sm:w-auto`}
            style={{ borderColor: 'var(--bridge-border-strong)', backgroundColor: 'var(--bridge-surface)', color: 'var(--bridge-text-secondary)' }}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            {messageLoading ? 'Opening…' : 'Message'}
          </button>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={favoritedLabel}
              className={`${secondaryClass} sm:w-auto`}
              style={{
                borderColor: isFavorited ? 'color-mix(in srgb, #ef4444 30%, var(--bridge-border))' : 'var(--bridge-border-strong)',
                backgroundColor: isFavorited
                  ? 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface))'
                  : 'var(--bridge-surface)',
                color: isFavorited ? '#ef4444' : 'var(--bridge-text-secondary)',
              }}
            >
              <Heart
                className="h-4 w-4 shrink-0"
                aria-hidden
                style={{ fill: isFavorited ? '#ef4444' : 'none', color: isFavorited ? '#ef4444' : 'currentColor' }}
              />
              {isFavorited ? 'Saved' : 'Save'}
            </button>
          )}
        </>
      )}
    </div>
  );
});
