import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { business } from '../data/site.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import Pending from './ui/Pending.jsx';
import Counter from './ui/Counter.jsx';
import Sun from './art/Sun.jsx';

const TEXT = 'Tramonto significa atardecer. Es esa hora en que la montaña se pone naranja, se enciende el horno y la mesa se llena. Aquí cocinamos como en una trattoria italiana, pero con la neblina, la madera y la calma de Santa Elena. Trae a tu gente, trae a tu perro y quédate hasta que se ponga el sol.';

/** 04 — Manifiesto: el párrafo "se dora" palabra por palabra con el scroll. */
export default function Manifesto() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    const words = el.querySelectorAll('[data-mw]');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector('p'), start: 'top 78%', end: 'bottom 52%', scrub: 0.6 } });
      tl.fromTo(words, { opacity: 0.16 }, { opacity: 1, stagger: 0.1, duration: 0.6, ease: 'none' }, 0)
        .fromTo(el.querySelector('[data-stroke]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'none' }, 0.15);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby="manifiesto-t" className="relative z-10 bg-mandarina py-28 md:py-40">
      <ZigzagEdge color="mandarina" line="rojo" />
      <div className="container-page grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
        <div className="lg:col-span-8">
          <p id="manifiesto-t" className="t-mono mb-8 flex flex-wrap items-center gap-3">
            <span>Manifiesto</span><span aria-hidden="true">·</span><span>Il tramonto</span>
            <Pending>Ajustar con el dueño</Pending>
          </p>
          <p className="font-italiana text-[clamp(30px,3.7vw,54px)] leading-[1.16] tracking-[-0.005em]">
            {TEXT.split(' ').map((w, i) => (
              <span key={i}>
                {w === 'atardecer.' ? (
                  <span data-mw className="relative inline-block">
                    atardecer.
                    <svg viewBox="0 0 220 20" preserveAspectRatio="none" className="absolute left-0 -bottom-[0.12em] w-[94%] h-[0.32em] overflow-visible" aria-hidden="true">
                      <path data-stroke d="M3 12 C 50 4, 100 18, 150 9 C 180 4, 200 10, 217 6" fill="none" stroke="#E6401C" strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
                    </svg>
                  </span>
                ) : <span data-mw>{w}</span>}{' '}
              </span>
            ))}
          </p>
        </div>
        <div className="lg:col-span-4 flex justify-center">
          <a href={business.instagram.url} target="_blank" rel="noopener noreferrer" className="group relative w-[min(78vw,360px)] aspect-square flex flex-col items-center justify-center text-center rounded-full">
            <Sun variant="mono" color="#2A1410" spin className="absolute inset-0 w-full h-full opacity-[.08]" />
            <span className="absolute inset-[13%] rounded-full bg-naranja shadow-[var(--shadow-lg)] transition-transform duration-700 group-hover:scale-[1.04]" />
            <span className="relative font-italiana text-[clamp(80px,9vw,128px)] leading-none"><Counter to={business.instagram.followers} format="k" /></span>
            <span className="relative t-mono mt-3">Amici de Tramonto</span>
            <span className="relative t-script !text-[30px] mt-1">en Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
