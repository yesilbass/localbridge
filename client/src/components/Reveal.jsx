import useInView from '../utils/useInView';

/**
 * Reveal — theme-aware viewport entrance.
 *
 * Subtle translate + blur fade-in. Respects reduced-motion automatically via
 * the global CSS rule in index.css.
 */
export default function Reveal({ children, className = '', delay = 0, y = 16 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        filter: inView ? 'blur(0)' : 'blur(6px)',
        transition: `opacity 620ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 720ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 620ms ease ${delay}ms`,
        willChange: 'opacity, transform, filter',
      }}
    >
      {children}
    </div>
  );
}
