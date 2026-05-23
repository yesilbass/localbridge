import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, MessageSquareQuote, ShieldCheck, Star, UsersRound } from 'lucide-react';

function useIsDark() {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('theme-dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('theme-dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0112 4.9c1.76 0 3.35.64 4.58 1.68l3.4-3.4A11.94 11.94 0 0012 0 12 12 0 001.08 6.54l4.19 3.22z" />
      <path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0112 19.1a7.08 7.08 0 01-6.72-4.87L1.07 17.44A12 12 0 0012 24c3.24 0 6.3-1.23 8.6-3.37l-4.56-2.62z" />
      <path fill="#4A90E2" d="M20.6 12.22c0-.76-.07-1.49-.18-2.2H12v4.16h4.84a4.14 4.14 0 01-1.8 2.72l4.56 2.62C21.38 17.5 20.6 15 20.6 12.22z" />
      <path fill="#FBBC05" d="M5.28 14.23A7.1 7.1 0 014.9 12c0-.77.13-1.52.36-2.23L1.07 6.54A11.96 11.96 0 000 12c0 1.92.46 3.73 1.08 5.44l4.2-3.21z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2" aria-hidden>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function SocialAuthButtons({ onSocialAuth, isDark }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { name: 'Google', icon: <GoogleIcon /> },
        { name: 'GitHub', icon: <Github className="h-4 w-4" /> },
        { name: 'Facebook', icon: <FacebookIcon /> },
      ].map((provider) => (
        <button
          key={provider.name}
          type="button"
          onClick={() => onSocialAuth?.(provider.name)}
          className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-3 text-xs font-black transition duration-300 hover:-translate-y-0.5 ${
            isDark
              ? 'border-white/10 bg-white/6 text-white/65 hover:border-amber-500/40 hover:bg-white/10 hover:text-white'
              : 'border-orange-950/10 bg-white/90 text-stone-600 shadow-[0_14px_34px_-28px_color-mix(in srgb, var(--color-secondary) 75%, transparent)] hover:border-orange-300 hover:bg-orange-50 hover:text-stone-950'
          }`}
        >
          <span className={`absolute inset-0 opacity-0 transition group-hover:opacity-100 ${isDark ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(255,180,60,0.10),transparent_65%)]' : 'bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.14),transparent_65%)]'}`} />
          <span className="relative">{provider.icon}</span>
          <span className="relative hidden sm:inline">{provider.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function FuturisticAuthFrame({ mode, title, subtitle, children, footer, badge = 'Secured access', onSocialAuth }) {
  const isSignup = mode === 'signup';
  const isDark = useIsDark();

  return (
    <main
      className="relative z-0 min-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: isDark ? '#0f0906' : '#fff4e3', color: isDark ? '#f7f0e8' : '#0c0a09' }}
      aria-labelledby="auth-heading"
    >
      {/* Background gradients */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 13% 16%, rgba(200,100,20,0.18), transparent 30%), radial-gradient(circle at 88% 12%, rgba(180,120,30,0.22), transparent 30%), radial-gradient(circle at 78% 88%, rgba(80,40,10,0.18), transparent 36%), linear-gradient(135deg, #140b05 0%, #1e100a 46%, #110906 100%)'
            : 'radial-gradient(circle at 13% 16%, rgba(255,122,24,0.24), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,214,128,0.34), transparent 30%), radial-gradient(circle at 78% 88%, rgba(120,79,43,0.12), transparent 36%), linear-gradient(135deg, #fff7ea 0%, #f8dec0 46%, #fffaf2 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_76%_70%_at_50%_42%,black_32%,transparent_100%)]"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(rgba(200,140,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,140,60,0.05) 1px, transparent 1px)'
            : 'linear-gradient(rgba(120,79,43,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,79,43,0.07) 1px, transparent 1px)',
        }}
      />
      <div aria-hidden className={`absolute -left-24 top-14 h-80 w-80 rounded-full blur-3xl ${isDark ? 'bg-orange-900/20' : 'bg-orange-300/28'}`} />
      <div aria-hidden className={`absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl ${isDark ? 'bg-amber-900/22' : 'bg-amber-200/42'}`} />
      <div aria-hidden className={`absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl ${isDark ? 'bg-orange-950/30' : 'bg-rose-200/22'}`} />

      <section className="relative z-[1] flex min-h-screen items-center justify-center px-4 pb-12 pt-[7.5rem] sm:px-6 lg:px-8">
        <div className="grid w-full max-w-7xl items-start gap-8 lg:grid-cols-[1.06fr_34rem] lg:gap-16">

          {/* Left column -- marketing copy */}
          <div className="hidden lg:block">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em] backdrop-blur-xl"
              style={{
                border: isDark ? '1px solid rgba(255,200,100,0.12)' : '1px solid rgba(120,79,43,0.10)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
                color: isDark ? 'rgba(255,200,120,0.85)' : '#57534e',
                boxShadow: isDark ? 'none' : '0 18px 50px -34px rgba(120,79,43,0.8)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.65)]" />
              {badge}
            </div>
            <h1
              className="mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.075em] xl:text-7xl"
              style={{ color: isDark ? '#f7f0e8' : '#0c0a09' }}
            >
              Turn expertise into your next{' '}
              <span
                className="relative inline-block"
                style={{ color: isDark ? '#f7f0e8' : '#0c0a09' }}
              >
                unfair advantage
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-2 -z-10 h-5 rounded-full"
                  style={{ backgroundColor: isDark ? 'rgba(251,191,36,0.28)' : 'rgba(252,211,77,0.70)' }}
                />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8" style={{ color: isDark ? 'rgba(247,240,232,0.62)' : '#57534e' }}>
              Bridge pairs ambitious builders with trusted mentors through a calm, credible, conversion-focused experience that feels hand-crafted instead of generated.
            </p>
            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ['4.8k+', 'sessions booked'],
                ['92%', 'return again'],
                ['2 min', 'to shortlist'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[1.65rem] p-5 backdrop-blur-xl"
                  style={{
                    border: isDark ? '1px solid rgba(255,200,100,0.10)' : '1px solid rgba(120,79,43,0.10)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
                    boxShadow: isDark ? 'none' : '0 24px 70px -44px rgba(120,79,43,0.9)',
                  }}
                >
                  <div className="text-2xl font-black tabular-nums" style={{ color: isDark ? '#f7f0e8' : '#0c0a09' }}>{value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.16em]" style={{ color: isDark ? 'rgba(200,150,80,0.70)' : 'rgba(120,79,43,0.45)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div
              className="mt-8 max-w-xl rounded-[2rem] p-5 text-white"
              style={{
                border: isDark ? '1px solid rgba(255,200,100,0.12)' : '1px solid rgba(12,9,0,0.10)',
                backgroundColor: '#120c08',
                boxShadow: '0 30px 90px -44px rgba(120,79,43,0.9)',
              }}
            >
              <div className="flex items-center gap-1 text-orange-300">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-lg font-black leading-7 tracking-[-0.02em]">"The sign-up flow makes Bridge feel like a private network, not another marketplace."</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-white/55">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 font-black text-stone-950">M</span>
                <span><span className="block font-bold text-white">Maya Chen</span>Product mentor, ex-Series B operator</span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {[
                { Icon: ShieldCheck, text: 'Secure Supabase auth' },
                { Icon: UsersRound, text: 'Role-aware onboarding' },
                { Icon: MessageSquareQuote, text: 'Mentor-grade trust' },
              ].map(({ Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-xl"
                  style={{
                    border: isDark ? '1px solid rgba(255,200,100,0.10)' : '1px solid rgba(120,79,43,0.10)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
                    color: isDark ? 'rgba(247,240,232,0.65)' : '#57534e',
                    boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: isDark ? '#f59e0b' : '#ea580c' }} />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right column -- form card */}
          <div className="mx-auto w-full max-w-[34rem] self-center [perspective:1200px]">
            <div
              className="group relative overflow-hidden rounded-[2.2rem] backdrop-blur-3xl transition duration-500 hover:-translate-y-1"
              style={{
                border: isDark ? '1px solid rgba(255,200,100,0.12)' : '1px solid rgba(255,255,255,0.90)',
                backgroundColor: isDark ? 'rgba(28,17,9,0.92)' : 'rgba(255,255,255,0.88)',
                boxShadow: isDark
                  ? '0 42px 120px -54px rgba(120,60,10,0.70), inset 0 1px 0 rgba(255,200,100,0.08)'
                  : '0 42px 120px -54px rgba(120,79,43,0.95), inset 0 1px 0 rgba(255,255,255,0.96)',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
                style={{ via: isDark ? 'rgba(255,200,80,0.18)' : 'rgba(120,79,43,0.20)' }}
              />
              <div aria-hidden className={`absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl ${isDark ? 'bg-orange-900/20' : 'bg-orange-200/50'}`} />
              <div aria-hidden className={`absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-3xl ${isDark ? 'bg-amber-950/25' : 'bg-amber-100/70'}`} />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,200,80,0.04) 0%, transparent 42%, rgba(200,80,10,0.04) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, transparent 42%, rgba(249,115,22,0.06) 100%)',
                }}
              />

              <div className="relative p-6 sm:p-8">
                {/* Tab bar */}
                <div
                  className="grid grid-cols-2 rounded-2xl p-1"
                  style={{
                    border: isDark ? '1px solid rgba(255,200,100,0.10)' : '1px solid rgba(120,79,43,0.10)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,237,213,0.70)',
                  }}
                >
                  <Link
                    className={`rounded-xl px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] transition ${!isSignup ? 'bg-stone-950 text-white shadow-[0_16px_32px_-20px_rgba(120,60,10,0.85)]' : ''}`}
                    style={isSignup ? { color: isDark ? 'rgba(247,240,232,0.35)' : 'rgba(120,79,43,0.45)' } : {}}
                    to="/login"
                  >
                    Sign In
                  </Link>
                  <Link
                    className={`rounded-xl px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] transition ${isSignup ? 'bg-stone-950 text-white shadow-[0_16px_32px_-20px_rgba(120,60,10,0.85)]' : ''}`}
                    style={!isSignup ? { color: isDark ? 'rgba(247,240,232,0.35)' : 'rgba(120,79,43,0.45)' } : {}}
                    to="/register"
                  >
                    Create Account
                  </Link>
                </div>

                {/* Social buttons — above the form so they're always visible */}
                <div className="mt-6">
                  <SocialAuthButtons onSocialAuth={onSocialAuth} isDark={isDark} />
                </div>

                {/* Divider */}
                <div className="mt-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: isDark ? 'rgba(247,240,232,0.22)' : '#d6d3d1' }}>
                  <span
                    className="h-px flex-1"
                    style={{ background: isDark ? 'linear-gradient(to right, transparent, rgba(255,200,100,0.18), transparent)' : 'linear-gradient(to right, transparent, #e7e5e4, transparent)' }}
                  />
                  or
                  <span
                    className="h-px flex-1"
                    style={{ background: isDark ? 'linear-gradient(to left, transparent, rgba(255,200,100,0.18), transparent)' : 'linear-gradient(to left, transparent, #e7e5e4, transparent)' }}
                  />
                </div>

                <div className="mt-5">{children}</div>

                {footer ? (
                  <div
                    className="mt-7 pt-6"
                    style={{ borderTop: isDark ? '1px solid rgba(255,200,100,0.10)' : '1px solid #e7e5e4' }}
                  >
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
