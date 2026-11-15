import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { business } from '../data/site.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import Counter from './ui/Counter.jsx';

const STATS = [
  { to: business.instagram.followers, format: 'k', suffix: '', label: 'amici en Instagram' },
  { to: business.instagram.posts, suffix: '+', label: 'publicaciones' },
  { to: 4, suffix: '', label: 'días a la semana + festivos' },
  { to: 1, suffix: '', label: 'atardecer, todos los días' },
];

function ZigLine() {
  let d = 'M6 0';
  for (let y = 8; y <= 400; y += 8) d += ` L${(y / 8) % 2 ? 0 : 12} ${y}`;
  return (
    <svg data-zline viewBox="0 0 12 400" preserveAspectRatio="none" className="w-3 h-full" aria-hidden="true">
      <path d={d} fill="none" stroke="#F6B547" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** 09 — Cifras con contadores y separadores en zigzag que se dibujan de arriba abajo. */
export default function Stats() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-zline]', { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.15, scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} aria-labelledby="cifras-t" className="on-dark relative z-10 bg-ladrillo text-crema py-24 md:py-32">
      <ZigzagEdge color="ladrillo" line="dorado" />
      <div className="container-page">
        <h2 id="cifras-t" className="t-mono text-dorado text-center mb-14">Tramonto en cifras · 09</h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-14">
          {STATS.map((s, i) => (
            <li key={s.label} className="relative flex flex-col items-center text-center px-4">
              {i > 0 && <div className={`absolute left-0 top-0 bottom-0 ${i === 2 ? 'hidden lg:block' : ''}`}><ZigLine /></div>}
              <span className="font-italiana text-dorado text-[clamp(72px,9vw,140px)] leading-none">
                <Counter to={s.to} format={s.format} suffix={s.suffix} duration={s.to > 10 ? 2.2 : 1.2} />
              </span>
              <span className="mt-4 text-[16px] font-medium max-w-[200px]">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
