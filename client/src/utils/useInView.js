import { useEffect, useRef, useState } from 'react';

export default function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      // rootMargin fires 120px BEFORE the element enters the viewport —
      // so animation is already playing by the time the user sees it.
      // threshold: 0 = trigger as soon as 1px is visible (faster than 0.15).
      { rootMargin: '0px 0px -60px 0px', threshold: 0, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}
