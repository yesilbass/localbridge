import { Link } from 'react-router-dom';
import { Github, MessageSquareQuote, ShieldCheck, Star, UsersRound } from 'lucide-react';

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

export function SocialAuthButtons({ onSocialAuth }) {
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
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-orange-950/10 bg-white/90 px-3 py-3 text-xs font-black text-stone-600 shadow-[0_14px_34px_-28px_color-mix(in srgb, var(--color-secondary) 75%, transparent)] transition duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-stone-950"
        >
          <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.14),transparent_65%)]" />
          <span className="relative">{provider.icon}</span>
          <span className="relative hidden sm:inline">{provider.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function FuturisticAuthFrame({ mode, title, subtitle, children, footer, badge = 'Secured access', onSocialAuth }) {
  const isSignup = mode === 'signup';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff4e3] text-stone-950" aria-labelledby="auth-heading">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_13%_16%,rgba(255,122,24,0.24),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(255,214,128,0.34),transparent_30%),radial-gradient(circle_at_78%_88%,rgba(120,79,43,0.12),transparent_36%),linear-gradient(135deg,#fff7ea_0%,#f8dec0_46%,#fffaf2_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(120,79,43,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(120,79,43,0.07)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_76%_70%_at_50%_42%,black_32%,transparent_100%)]" />
      <div aria-hidden className="absolute -left-24 top-14 h-80 w-80 rounded-full bg-orange-300/28 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/42 blur-3xl" />
      <div aria-hidden className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-rose-200/22 blur-3xl" />

      <section className="relative z-[1] flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.06fr_34rem] lg:gap-16">
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-950/10 bg-white/72 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-stone-600 shadow-[0_18px_50px_-34px_rgba(120,79,43,0.8)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.65)]" />
              {badge}
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.075em] text-stone-950 xl:text-7xl">
              Turn expertise into your next <span className="relative inline-block text-stone-950 after:absolute after:inset-x-0 after:bottom-2 after:-z-10 after:h-5 after:rounded-full after:bg-orange-300/70">unfair advantage</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-stone-600">
              Bridge pairs ambitious builders with trusted mentors through a calm, credible, conversion-focused experience that feels hand-crafted instead of generated.
            </p>
            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ['4.8k+', 'sessions booked'],
                ['92%', 'return again'],
                ['2 min', 'to shortlist'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[1.65rem] border border-orange-950/10 bg-white/72 p-5 shadow-[0_24px_70px_-44px_rgba(120,79,43,0.9)] backdrop-blur-xl">
                  <div className="text-2xl font-black text-stone-950">{value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-orange-900/45">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 max-w-xl rounded-[2rem] border border-stone-900/10 bg-[#120c08] p-5 text-white shadow-[0_30px_90px_-44px_color-mix(in srgb, var(--color-secondary) 98%, transparent)]">
              <div className="flex items-center gap-1 text-orange-300">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-lg font-black leading-7 tracking-[-0.02em]">“The sign-up flow makes Bridge feel like a private network, not another marketplace.”</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-white/55">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 font-black text-stone-950">M</span>
                <span><span className="block font-bold text-white">Maya Chen</span>Product mentor, ex-Series B operator</span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-stone-600">
              {[
                { Icon: ShieldCheck, text: 'Secure Supabase auth' },
                { Icon: UsersRound, text: 'Role-aware onboarding' },
                { Icon: MessageSquareQuote, text: 'Mentor-grade trust' },
              ].map(({ Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 rounded-full border border-orange-950/10 bg-white/72 px-4 py-2 shadow-sm backdrop-blur-xl">
                  <Icon className="h-4 w-4 text-orange-600" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[34rem] [perspective:1200px]">
            <div className="group relative overflow-hidden rounded-[2.2rem] border border-white/90 bg-white/88 shadow-[0_42px_120px_-54px_rgba(120,79,43,0.95),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-3xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_50px_130px_-52px_rgba(120,79,43,1)]">
              <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-900/20 to-transparent" />
              <div aria-hidden className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-200/50 blur-3xl" />
              <div aria-hidden className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.65)_0%,transparent_42%,rgba(249,115,22,0.06)_100%)]" />

              <div className="relative p-6 sm:p-8">
                <Link to="/" className="inline-flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-black text-white shadow-[0_18px_45px_-22px_rgba(249,115,22,0.9)]">B</span>
                  <span className="text-2xl font-black tracking-[-0.06em] text-stone-950">Bridge</span>
                </Link>

                <div className="mt-7 grid grid-cols-2 rounded-2xl border border-orange-950/10 bg-orange-50/70 p-1">
                  <Link className={`rounded-xl px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] transition ${!isSignup ? 'bg-stone-950 text-white shadow-[0_16px_32px_-20px_color-mix(in srgb, var(--color-secondary) 85%, transparent)]' : 'text-orange-900/45 hover:text-stone-950'}`} to="/login">Sign In</Link>
                  <Link className={`rounded-xl px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] transition ${isSignup ? 'bg-stone-950 text-white shadow-[0_16px_32px_-20px_color-mix(in srgb, var(--color-secondary) 85%, transparent)]' : 'text-orange-900/45 hover:text-stone-950'}`} to="/register">Create Account</Link>
                </div>

                <div className="mt-7">
                  <h2 id="auth-heading" className="text-4xl font-black tracking-[-0.06em] text-stone-950">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{subtitle}</p>
                </div>

                <div className="mt-6">{children}</div>

                <div className="mt-7 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-stone-300">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
                  or continue with
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
                </div>
                <div className="mt-4">
                  <SocialAuthButtons onSocialAuth={onSocialAuth} />
                </div>

                {footer ? <div className="mt-7 border-t border-stone-200 pt-6">{footer}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
