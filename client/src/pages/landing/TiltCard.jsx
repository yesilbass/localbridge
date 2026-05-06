import { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '', n = 8, onClick }) {
  const r = useRef(null);

  const handleMouseMove = useCallback(e => {
    const el = r.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width;
    const y = (e.clientY - b.top) / b.height;
    el.style.setProperty('--tilt-x', `${(y - 0.5) * -n}deg`);
    el.style.setProperty('--tilt-y', `${(x - 0.5) * n}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }, [n]);

  const handleMouseLeave = useCallback(() => {
    const el = r.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }, []);

  return (
    <div
      ref={r}
      className={`tilt-card cursor-glow ${className}`}
      style={{ '--tilt-x': '0deg', '--tilt-y': '0deg' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
