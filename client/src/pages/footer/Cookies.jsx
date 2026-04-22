import { pageShell } from '../../ui';

export default function Cookies() {
  return (
    <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-[var(--bridge-text)]">Cookie Policy</h1>
        <p className="mt-3 text-sm text-[var(--bridge-text-muted)]">Last updated: April 21, 2026</p>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--bridge-text)]">What Are Cookies</h2>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you use it.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--bridge-text)]">Types We Use</h2>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          <strong className="text-[var(--bridge-text)]">Essential cookies:</strong> Required for authentication, security, and core functionality. These can&apos;t be disabled.
        </p>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          <strong className="text-[var(--bridge-text)]">Preference cookies:</strong> Remember your settings like language and theme.
        </p>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          <strong className="text-[var(--bridge-text)]">Analytics cookies:</strong> Help us understand usage patterns so we can improve the platform. We use aggregated, anonymized data.
        </p>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          <strong className="text-[var(--bridge-text)]">Marketing cookies:</strong> Used with your consent to measure ad effectiveness. You can opt out anytime.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--bridge-text)]">Managing Cookies</h2>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          You can control cookies through your browser settings or our preferences center. Note that disabling essential cookies will break core features.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--bridge-text)]">Third-Party Cookies</h2>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
          We work with trusted partners (payment processors, analytics providers) who may set their own cookies. Each has its own privacy policy.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--bridge-text)]">Contact</h2>
        <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">Questions? Email privacy@bridge.com.</p>
      </div>
    </main>
  );
}
