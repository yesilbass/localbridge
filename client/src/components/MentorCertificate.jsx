import { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function MentorCertificate({ mentor, onClose }) {
  const cardRef = useRef(null);

  async function downloadPng() {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `bridge-mentor-${mentor.name?.replace(/\s+/g, '-').toLowerCase() ?? 'certificate'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const sessions = mentor.total_sessions ?? 0;
  const rating = mentor.rating ? Number(mentor.rating).toFixed(1) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-md rounded-3xl p-6"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
      >
        <div
          ref={cardRef}
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 8%, white), white)',
            boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 25%, transparent)',
          }}
        >
          <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'var(--color-primary)' }}>Bridge</p>
          <h3 className="mt-4 text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>{mentor.name}</h3>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
            Verified Bridge Mentor
          </p>
          <p className="mt-6 text-4xl font-black tabular-nums" style={{ color: 'var(--color-primary)' }}>{sessions}</p>
          <p className="text-sm font-medium" style={{ color: 'var(--bridge-text-muted)' }}>sessions completed</p>
          {rating !== '—' && (
            <p className="mt-3 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>{rating} average rating</p>
          )}
          <p className="mt-6 text-xs italic" style={{ color: 'var(--bridge-text-muted)' }}>
            Helping people navigate what matters most.
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={downloadPng}
            className="bridge-focus flex-1 rounded-xl py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bridge-focus rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
