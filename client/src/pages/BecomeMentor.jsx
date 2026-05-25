import { Link } from 'react-router-dom';
import {
  ArrowRight, Briefcase, Globe, Users, Calendar,
  MessageCircle, Sparkles, Clock, Mic, Lock,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';

const QUOTES = [
  {
    text: "I've learned as much from my mentees as they've learned from me. Being asked good questions sharpens your own thinking.",
    name: 'Layla',
    role: 'Software Engineer',
  },
  {
    text: 'I spent years wishing someone had told me what I now know. Bridge gives me a way to actually do that.',
    name: 'Marcus',
    role: 'Financial Analyst',
  },
  {
    text: 'I mentor on things that have nothing to do with my job title — my immigration journey, my faith, how I rebuilt after a divorce. Those sessions mean the most.',
    name: 'Nadia',
    role: 'Product Manager',
  },
];

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'A profile that grows with you',
    body: 'Every session adds to your impact stats. Your reviews and session count build a public record of the difference you\'ve made.',
  },
  {
    icon: Globe,
    title: 'Reach people you\'d never otherwise meet',
    body: 'Mentees book you because they need exactly what you have. These aren\'t cold connections — they\'ve already decided you\'re worth their time.',
  },
  {
    icon: Users,
    title: 'A community of mentors',
    body: 'Private access to Bridge\'s mentor community. Connect with other mentors, share insights, get support from people doing the same work.',
  },
  {
    icon: Calendar,
    title: 'Complete flexibility',
    body: 'You set your own availability. One hour a week or one hour a month — entirely up to you. You never have to accept a session you don\'t want.',
  },
];

const STEPS = [
  { title: 'A quick intro', body: 'Tell us your name, role, and location. Takes 60 seconds.' },
  { title: 'A short conversation', body: 'Our AI will ask you a few questions about your background and what you can help with. About 5 minutes. No prep needed — just speak naturally.' },
  { title: 'Human review', body: 'Our team reads every application and listens to every call. You\'ll hear back within a few days.' },
  { title: 'Build your profile and go live', body: 'Once approved, we guide you through setting up your profile. Then you\'re live.' },
];

function ApplyButton({ className = '', children }) {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  if (isMentor) return null;
  const to = user ? '/apply/mentor' : '/login?redirect=/apply/mentor';
  return (
    <Link
      to={to}
      className={`bridge-focus inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold transition hover:opacity-90 ${className}`}
      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
    >
      {children ?? 'Apply to mentor'}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export default function BecomeMentor() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <section className="text-center">
        <h1
          className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.25rem]"
          style={{ color: 'var(--bridge-text)' }}
        >
          Share what you know. Change someone&apos;s path.
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          Bridge mentors give their time freely — and get back something money can&apos;t buy: the satisfaction of genuinely helping someone, a public profile that grows with every session, and a community of people worth knowing.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <ApplyButton />
          <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
            Free to apply. No commitment to a set number of sessions.
          </p>
        </div>
      </section>

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        {QUOTES.map((q) => (
          <blockquote
            key={q.name}
            className="flex flex-col gap-4 rounded-2xl p-6"
            style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            <p className="text-[15px] italic leading-relaxed" style={{ color: 'var(--bridge-text)' }}>
              &ldquo;{q.text}&rdquo;
            </p>
            <footer className="text-sm font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
              — {q.name}, {q.role}
            </footer>
          </blockquote>
        ))}
      </section>

      <section className="mt-24">
        <h2 className="text-center font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
          What you get
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bridge-surface-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <span
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-bold" style={{ color: 'var(--bridge-text)' }}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
          Who mentors on Bridge?
        </h2>
        <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
          We don&apos;t have a minimum years-of-experience requirement or a credential checklist. What we look for is simpler: you&apos;ve been through something, you&apos;ve learned from it, and you genuinely want to help someone else navigate it. That could be a 20-year career in finance. It could be surviving a difficult marriage. It could be immigrating to a new country, building a business from scratch, or recovering from addiction. If you have real experience and a genuine desire to share it — you&apos;re the kind of mentor Bridge is looking for.
        </p>
        <p className="mt-4 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
          We review every application. Not to gatekeep, but to make sure every mentee who books a session gets someone who&apos;s genuinely there to help.
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-center font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
          The process
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl p-5"
              style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              <span
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: 'var(--color-primary)' }}
              >
                {i + 1}
              </span>
              <h3 className="font-bold" style={{ color: 'var(--bridge-text)' }}>{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 text-center">
        <h2 className="font-display text-3xl font-black" style={{ color: 'var(--bridge-text)' }}>
          Ready to share what you know?
        </h2>
        <div className="mt-8">
          <ApplyButton />
        </div>
      </section>
    </main>
  );
}
