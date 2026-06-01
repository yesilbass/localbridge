import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLink from './AppLink';
import { Mail, ArrowRight, Heart } from 'lucide-react';
import { COMPANY_EMAIL, mailtoHref } from '../config/contact';
import { useI18n } from '../i18n';
import ThemeToggle from './ThemeToggle';

const navLink =
  'text-[13.5px] font-medium leading-snug transition-colors duration-200 hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm';

const legalLink =
  'text-[12.5px] font-medium transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm';

const SOCIALS = [
  {
    label: 'X / Twitter', href: '#',
    icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    label: 'LinkedIn', href: '#',
    icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  },
  {
    label: 'Instagram', href: '#',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="20" height="20" rx="5"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    label: 'YouTube', href: '#',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>,
  },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <p
        className="text-[10px] font-black uppercase tracking-[0.22em]"
        style={{ color: 'var(--bridge-text-muted)' }}
      >
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map(({ label, to, app }) => (
          <li key={label}>
            {app ? (
              <AppLink to={to} className={navLink} style={{ color: 'var(--bridge-text-secondary)' }}>{label}</AppLink>
            ) : (
              <Link to={to} className={navLink} style={{ color: 'var(--bridge-text-secondary)' }}>{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackedLinkColumns({ groups }) {
  return (
    <div className="flex flex-col gap-11">
      {groups.map((group) => (
        <LinkColumn key={group.title} title={group.title} links={group.links} />
      ))}
    </div>
  );
}

export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const dividerStyle = { borderColor: 'var(--bridge-border)' };

  return (
    <footer className="relative z-10 mt-auto px-5 pb-8 pt-14 sm:px-8 sm:pb-10 lg:px-10 lg:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="overflow-hidden rounded-3xl px-6 py-10 sm:px-9 sm:py-12 lg:px-11 lg:py-14"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            color: 'var(--bridge-text)',
            boxShadow: '0 0 0 1px var(--bridge-border)',
          }}
        >
          {/* Top — newsletter + link columns */}
          <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
            {/* Newsletter */}
            <div className="flex flex-col gap-8 sm:col-span-2 xl:col-span-1">
              <div>
                <p className="font-display text-[1.5rem] font-black leading-[1.12] tracking-[-0.03em] sm:text-[1.65rem]">
                  {t('footer.newsletterHeadline', 'Join our weekly newsletter')}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {t('footer.newsletterBody', 'Mentor spotlights, career resources, and product updates. No spam, ever.')}
                </p>
              </div>

              {subscribed ? (
                <div
                  className="inline-flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{
                    color: 'var(--color-success, #16a34a)',
                    backgroundColor: 'color-mix(in srgb, var(--color-success, #16a34a) 10%, var(--bridge-surface))',
                    boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-success, #16a34a) 25%, transparent)',
                  }}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {t('footer.subscribed', "You're on the list!")}
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setEmail(''); setSubscribed(true); }}
                  className="flex w-full flex-col gap-3"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.emailPlaceholder', 'Enter your email to subscribe…')}
                    required
                    className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30"
                    style={{
                      borderColor: 'var(--bridge-border)',
                      backgroundColor: 'var(--bridge-surface-muted)',
                      color: 'var(--bridge-text)',
                    }}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      outlineColor: 'var(--color-primary)',
                    }}
                  >
                    {t('footer.subscribe', 'Subscribe')}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              )}

              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: 'var(--color-success, #16a34a)' }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-success, #16a34a)' }} />
                </span>
                <span className="text-[11.5px] font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
                  {t('footer.allSystemsOperational', 'All systems operational')}
                </span>
              </div>
            </div>

            <StackedLinkColumns
              groups={[
                {
                  title: t('footer.company', 'Company'),
                  links: [
                    { label: t('nav.company', 'Company'), to: '/company' },
                    { label: t('footer.blog', 'Blog'), to: '/blog' },
                    { label: t('footer.careers', 'Careers'), to: '/careers' },
                    { label: t('footer.trustSafety', 'Trust & Safety'), to: '/trust' },
                  ],
                },
                {
                  title: t('footer.resources', 'Resources'),
                  links: [
                    { label: t('footer.help', 'Help Center'), to: '/help' },
                    { label: t('footer.faq', 'FAQ'), to: '/faq' },
                    { label: t('footer.community', 'Community'), to: '/community' },
                    { label: t('footer.contact', 'Contact'), to: '/contact' },
                  ],
                },
              ]}
            />

            <StackedLinkColumns
              groups={[
                {
                  title: t('footer.platform', 'Platform'),
                  links: [
                    { label: t('footer.howItWorks', 'How it works'), to: '/how-it-works' },
                    { label: t('footer.aiMatching', 'AI Matching'), to: '/mentors', app: true },
                  ],
                },
                {
                  title: t('footer.tools', 'Tools'),
                  links: [
                    { label: t('footer.resumeReview', 'Resume Review'), to: '/resume', app: true },
                    { label: t('nav.pricing', 'Pricing'), to: '/pricing', app: true },
                    { label: t('footer.dashboard', 'Dashboard'), to: '/dashboard', app: true },
                  ],
                },
              ]}
            />

            <LinkColumn
              title={t('footer.explore', 'Explore')}
              links={[
                { label: t('footer.browseMentors', 'Browse Mentors'), to: '/mentors', app: true },
                { label: t('footer.categoryCareer', 'Career & Professional'), to: '/mentors?category=career', app: true },
                { label: t('footer.categoryRelationships', 'Relationships & Family'), to: '/mentors?category=relationships', app: true },
                { label: t('footer.categoryFaith', 'Faith & Spirituality'), to: '/mentors?category=faith', app: true },
                { label: t('footer.categoryLife', 'Life Navigation'), to: '/mentors?category=life', app: true },
              ]}
            />
          </div>

          {/* Meta — legal · made with · social */}
          <div className="mt-12 border-t pt-8 lg:mt-14 lg:pt-9" style={dividerStyle}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {[
                  { label: t('footer.terms', 'Terms'), to: '/terms' },
                  { label: t('footer.privacy', 'Privacy'), to: '/privacy' },
                  { label: t('footer.cookies', 'Cookies'), to: '/cookies' },
                  { label: t('footer.trustSafety', 'Trust & Safety'), to: '/trust' },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} className={legalLink} style={{ color: 'var(--bridge-text-muted)', opacity: 0.85 }}>{label}</Link>
                ))}
              </div>

              <p className="inline-flex items-center justify-center gap-1.5 text-[12px] font-medium lg:flex-1" style={{ color: 'var(--bridge-text-muted)' }}>
                <Heart className="h-3 w-3 shrink-0" aria-hidden style={{ color: 'var(--color-primary)' }} />
                {t('footer.madeWith', 'Made with care for people navigating their careers')}
              </p>

              <div className="flex items-center gap-2 lg:shrink-0">
                <ThemeToggle />
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-80"
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      backgroundColor: 'var(--bridge-surface-muted)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <p className="mt-5 text-[12.5px]" style={{ color: 'var(--bridge-text-muted)' }}>
              © {new Date().getFullYear()} Bridge. {t('footer.rightsReserved', 'All rights reserved.')}
            </p>
          </div>

          {/* Brand strip */}
          <div className="mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-9 lg:pt-9" style={dividerStyle}>
            <Link
              to="/"
              className="font-display text-xl font-black tracking-[-0.04em] transition-opacity hover:opacity-70"
            >
              <span style={{ opacity: 0.45 }}>mentorship</span><span style={{ color: 'var(--color-primary)' }}>bridge</span>
            </Link>
            <p className="max-w-md text-[13px] leading-relaxed sm:text-right" style={{ color: 'var(--bridge-text-muted)' }}>
              {t('footer.tagline', 'Connecting job seekers with vetted mentors who genuinely enjoy helping people land their next role.')}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]" style={{ color: 'var(--bridge-text-faint)' }}>
            <a href={mailtoHref()} className="inline-flex items-center gap-1.5 transition hover:opacity-80">
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              {COMPANY_EMAIL}
            </a>
            <span aria-hidden>·</span>
            <span>San Francisco, CA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
