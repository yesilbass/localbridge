import { Link } from 'react-router-dom';
import { Github, ShieldCheck, Star, UsersRound } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0112 4.9c1.76 0 3.35.64 4.58 1.68l3.4-3.4A11.94 11.94 0 0012 0 12 12 0 001.08 6.54l4.19 3.22z" />
      <path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0112 19.1a7.08 7.08 0 01-6.72-4.87L1.07 17.44A12 12 0 0012 24c3.24 0 6.3-1.23 8.6-3.37l-4.56-2.62z" />
      <path fill="#4A90E2" d="M20.6 12.22c0-.76-.07-1.49-.18-2.2H12v4.16h4.84a4.14 4.14 0 01-1.8 2.72l4.56 2.62C21.38 17.5 20.6 15 20.6 12.22z" />
      <path fill="#FBBC05" d="M5.28 14.23A7.1 7.1 0 014.9 12c0-.77.13-1.52.36-2.23L1.07 6.54A11.96 11.96 0 000 12c0 1.92.46 3.73 1.08 5.44l4.2-3.21z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#1877F2" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function SocialAuthButtons({ onSocialAuth }) {
  const providers = [
    { name: 'Google', icon: <GoogleIcon />, label: 'Google' },
    { name: 'GitHub', icon: <Github className="h-4 w-4 shrink-0" />, label: 'GitHub' },
    { name: 'Facebook', icon: <FacebookIcon />, label: 'Facebook' },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {providers.map((provider) => (
        <button
          key={provider.name}
          type="button"
          onClick={() => onSocialAuth?.(provider.name)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderColor: 'var(--bridge-border)',
            backgroundColor: 'var(--bridge-surface)',
            color: 'var(--bridge-text-secondary)',
            outlineColor: 'var(--color-primary)',
          }}
        >
          {provider.icon}
          Continue with {provider.label}
        </button>
      ))}
    </div>
  );
}

function SignupSidePanel() {
  return (
    <div className="hidden lg:block">
      <p
        className="text-[10px] font-black uppercase tracking-[0.28em]"
        style={{ color: 'var(--color-primary)' }}
      >
        For job seekers
      </p>
      <h2
        className="mt-4 font-display text-[2.5rem] font-black leading-[1.02] tracking-[-0.04em] xl:text-[3.5rem]"
        style={{ color: 'var(--bridge-text)' }}
      >
        Your next move starts<br />with one conversation.
      </h2>
      <p className="mt-5 max-w-lg text-[17px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
        Browse 2,400+ mentors from Google, Stripe, and top startups. Book a session, get honest feedback, and leave with a clear next step.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3.5 max-w-lg">
        {[
          ['2,400+', 'Vetted mentors'],
          ['4.9/5', 'Avg rating'],
          ['97%', 'Recommend'],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl p-4 sm:p-5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              border: '1px solid var(--bridge-border)',
            }}
          >
            <div className="font-display text-2xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>
              {value}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--bridge-text-muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 max-w-lg rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          border: '1px solid var(--bridge-border)',
        }}
      >
        <div className="flex gap-0.5" style={{ color: 'var(--color-primary)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
          ))}
        </div>
        <p className="mt-3 text-[15px] font-semibold leading-relaxed" style={{ color: 'var(--bridge-text)' }}>
          &ldquo;One session saved me six months of guessing. Worth every penny.&rdquo;
        </p>
        <p className="mt-3 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
          — Product manager, Series B startup
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {[
          { Icon: ShieldCheck, text: 'Secure auth' },
          { Icon: UsersRound, text: 'Vetted mentors' },
        ].map(({ Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              border: '1px solid var(--bridge-border)',
              color: 'var(--bridge-text-secondary)',
            }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function AuthCard({
  title,
  subtitle,
  children,
  footer,
  onSocialAuth,
}) {
  return (
    <div
      className="relative z-10 w-full max-w-[540px] rounded-[1.35rem] p-8 sm:p-9 lg:max-w-none lg:rounded-[1.5rem] lg:p-10"
      style={{
        backgroundColor: 'var(--bridge-surface-raised)',
        border: '1px solid var(--bridge-border)',
        boxShadow: '0 24px 64px -32px color-mix(in srgb, var(--bridge-text) 18%, transparent)',
      }}
    >
      <h1
        id="auth-heading"
        className="font-display font-black leading-[1.08] tracking-[-0.03em]"
        style={{
          color: 'var(--bridge-text)',
          fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
          {subtitle}
        </p>
      ) : null}

      <div className="mt-7">{children}</div>

      {onSocialAuth ? (
        <>
          <div
            className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--bridge-text-faint)' }}
          >
            <span className="h-px flex-1" style={{ backgroundColor: 'var(--bridge-border)' }} />
            or continue with
            <span className="h-px flex-1" style={{ backgroundColor: 'var(--bridge-border)' }} />
          </div>
          <SocialAuthButtons onSocialAuth={onSocialAuth} />
        </>
      ) : null}

      {footer ? (
        <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--bridge-border)' }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export default function FuturisticAuthFrame({
  mode,
  title,
  subtitle,
  children,
  footer,
  onSocialAuth,
}) {
  const isSignup = mode === 'signup';

  return (
    <main
      className={`relative flex min-h-screen flex-col px-4 py-8 sm:px-6 sm:py-10 ${isSignup ? 'justify-start pt-6 lg:pt-8' : 'items-center justify-center'}`}
      style={{ backgroundColor: 'var(--bridge-canvas)', color: 'var(--bridge-text)' }}
      aria-labelledby="auth-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 15% 10%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 15%, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 50% 95%, color-mix(in srgb, var(--color-secondary) 10%, transparent) 0%, transparent 70%)',
        }}
      />

      {isSignup ? (
        <div className="relative z-10 mx-auto w-full max-w-[min(1280px,calc(100vw-2rem))]">
          <header className="mb-8 lg:mb-10">
            <Link
              to="/"
              className="inline-block font-display text-[1.35rem] font-black tracking-[-0.04em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-xl"
              style={{ color: 'var(--bridge-text)', outlineColor: 'var(--color-primary)' }}
            >
              mentorshipbridge
            </Link>
          </header>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,580px)_1.12fr] xl:gap-20">
            <div className="mx-auto w-full max-w-[580px] lg:mx-0 lg:max-w-none lg:justify-self-start">
              <AuthCard
                title={title}
                subtitle={subtitle}
                footer={footer}
                onSocialAuth={onSocialAuth}
              >
                {children}
              </AuthCard>
            </div>
            <SignupSidePanel />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex w-full max-w-[min(580px,calc(100vw-2rem))] flex-col items-center px-1 sm:px-0">
          <Link
            to="/"
            className="mb-8 font-display text-[1.35rem] font-black tracking-[-0.04em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 sm:mb-10 sm:text-xl"
            style={{ color: 'var(--bridge-text)', outlineColor: 'var(--color-primary)' }}
          >
            mentorshipbridge
          </Link>
          <AuthCard
            title={title}
            subtitle={subtitle}
            footer={footer}
            onSocialAuth={onSocialAuth}
          >
            {children}
          </AuthCard>
        </div>
      )}
    </main>
  );
}
