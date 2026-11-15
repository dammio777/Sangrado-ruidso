import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

const fmt = (n, format) => {
  if (format === 'k') return n >= 1000 ? `${(Math.floor(n / 100) / 10).toFixed(1)}K` : `${Math.round(n)}`;
  return `${Math.round(n)}`;
};

/** Contador animado al entrar en pantalla. */
export default function Counter({ to, format, suffix = '', className = '', duration = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.textContent = fmt(to, format) + suffix; return; }
    const o = { n: 0 };
    el.textContent = fmt(0, format) + suffix;
    const t = gsap.to(o, {
      n: to, duration, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(o.n, format) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, [to, format, suffix, duration]);
  return <span ref={ref} className={`tabular-nums ${className}`} aria-label={fmt(to, format) + suffix}>{fmt(to, format) + suffix}</span>;
}
