import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { media } from '../data/site.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords, FadeUp } from './ui/Reveal.jsx';
import ArchFrame from './ui/ArchFrame.jsx';
import Pending from './ui/Pending.jsx';
import { Paw } from './art/Illustrations.jsx';

const RULES = [
  { n: '01', t: 'Con correa en el salón', d: 'Así todos, peludos y no tan peludos, disfrutan la tarde.' },
  { n: '02', t: 'Pídele agua al mesero', d: 'Su platito de agua llega a la mesa sin que lo pidas dos veces.' },
  { n: '03', t: 'Llega con hambre, tú y él', d: 'Tú pides la pizza; él se encarga de mirarte con amor.' },
];
const STEPS = 16;

/** 07 — Pet friendly: una fila de huellas cruza la pantalla con el scroll. */
export default function PetFriendly() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-paw]', { opacity: 0, scale: 0.4 }, {
        opacity: 1, scale: 1, ease: 'back.out(3)', stagger: 0.12, duration: 0.3,
        scrollTrigger: { trigger: '[data-trail]', start: 'top 85%', end: 'bottom 25%', scrub: 0.6 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby="pet-t" className="relative z-10 bg-dorado pt-36 pb-28 md:pt-44 md:pb-36 overflow-hidden">
      <ZigzagEdge color="dorado" line="rojo" />
      {/* huellas que cruzan */}
      <div data-trail aria-hidden="true" className="absolute inset-x-0 top-[26px] md:top-[36px] h-[80px] pointer-events-none">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className="absolute" style={{ left: `${2 + i * (96 / STEPS)}%`, top: `${(i % 2 ? 50 : 10) + Math.sin(i / 2.2) * 14}%` }}>
            <Paw className="w-[26px] h-[30px]" color="rgba(42,20,16,.12)" style={{ transform: 'rotate(90deg)' }} />
            <span data-paw className="absolute inset-0"><Paw className="w-[26px] h-[30px]" color="rgba(138,47,12,.6)" style={{ transform: 'rotate(90deg)' }} /></span>
          </span>
        ))}
      </div>

      <div className="relative container-page grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-7">
          <p className="t-mono mb-5 flex items-center gap-2"><Paw className="w-4 h-4" /> Pet friendly · 07</p>
          <MaskWords as="h2" id="pet-t" lines={['Aquí los perros', 'también son', 'amici.']} className="t-display uppercase text-[clamp(48px,7.2vw,112px)]" />
          <p className="t-lead mt-8 max-w-[520px]">Tráelo a la montaña. Mientras tú pides otra pizza, él se acomoda a los pies de la mesa y mira caer la tarde contigo.</p>
          <ul className="mt-12 grid sm:grid-cols-3 gap-4">
            {RULES.map((r, i) => (
              <FadeUp as="li" key={r.n} delay={i * 0.1} className="relative rounded-[24px] bg-durazno p-6 shadow-[var(--shadow-md)]">
                <Paw className="absolute right-5 top-5 w-6 h-7" color="#C24E35" />
                <span className="t-mono text-teja">{r.n}</span>
                <h3 className="font-italiana text-[28px] leading-[1.05] mt-3">{r.t}</h3>
                <p className="text-[14px] mt-3 text-espresso/80">{r.d}</p>
              </FadeUp>
            ))}
          </ul>
          <div className="mt-5"><Pending>Ajustar reglas con el dueño</Pending></div>
        </div>
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <ArchFrame media={media.petDog} className="w-[min(84vw,420px)] aspect-[4/5]" />
          <Pending>{media.petDog.pending}</Pending>
        </div>
      </div>
    </section>
  );
}
