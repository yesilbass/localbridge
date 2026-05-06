import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFooterOffset } from '../../utils/useFooterOffset';

const NAV_ITEMS = [
  { label: 'Home', id: 'top' },
  { label: 'How it works', id: 'how' },
  { label: 'Mentors', id: 'mentors' },
  { label: 'Outcomes', id: 'outcomes' },
  { label: 'Get started', id: 'start', primary: true },
];

export default function FloatingDock() {
  const [visible, setVisible] = useState(false);
  const bRef = useFooterOffset(24);

  useEffect(() => {
    const fn = () => { setVisible(window.scrollY > window.innerHeight * 0.85); };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return createPortal(
    <div
      ref={bRef}
      className="pointer-events-none fixed left-1/2 z-[9999]"
      style={{
        bottom: 24,
        transform: `translateX(-50%) translateY(${visible ? '0' : '5rem'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1),opacity 380ms ease',
      }}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2 backdrop-blur-2xl"
        style={{
          backgroundColor: 'rgba(7,7,15,0.94)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 100px color-mix(in srgb, var(--color-primary) 14%, transparent)',
        }}
      >
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(item.id)}
            data-cursor="hover"
            className="whitespace-nowrap rounded-full px-4 py-2 text-[11.5px] font-semibold transition-all duration-200"
            style={
              item.primary
                ? {
                    backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--lp-grad-mid) 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 50%, transparent)',
                  }
                : {
                    color: 'rgba(255,255,255,0.45)',
                  }
            }
            onMouseEnter={(e) => {
              if (!item.primary) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.primary) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>,
    document.body
  );
}
