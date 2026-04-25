import useInView from '../utils/useInView';

/**
 * Reveal — lightweight viewport entrance animation.
 *
 * Only uses opacity + translateY (NO blur — blur triggers GPU compositing
 * on every element and causes multi-second freezes when scrolling).
 * Respects prefers-reduced-motion via global CSS.
 */
export default function Reveal({ children, className = '', delay = 0, y = 18 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        transition: `opacity 480ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 560ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: inView ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
