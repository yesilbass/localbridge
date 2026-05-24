import { Link } from 'react-router-dom';
import { ArrowRight, User, Settings as SettingsIcon, Shield, MessageSquare } from 'lucide-react';

const ITEMS = [
  {
    icon: User,
    title: 'Profile',
    description: 'Photo, bio, expertise, links — what others see when they land on your card.',
    to: '/profile',
    cta: 'Open profile',
  },
  {
    icon: SettingsIcon,
    title: 'Account & appearance',
    description: 'Email, password, theme, notification preferences.',
    to: '/settings',
    cta: 'Open settings',
  },
  {
    icon: Shield,
    title: 'Privacy & data',
    description: 'Export your sessions, delete your account, manage data sharing.',
    to: '/privacy',
    cta: 'Read policy',
  },
  {
    icon: MessageSquare,
    title: 'Support',
    description: 'Get help, report a bug, or talk to the team.',
    to: '/contact',
    cta: 'Contact us',
  },
];

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.title}
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                {item.title}
              </h3>
            </div>
            <p
              className="flex-1 text-[13px]"
              style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.5 }}
            >
              {item.description}
            </p>
            <Link
              to={item.to}
              className="bridge-focus inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
              style={{
                boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
                color: 'var(--bridge-text)',
              }}
            >
              {item.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
