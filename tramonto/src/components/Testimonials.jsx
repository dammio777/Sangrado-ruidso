import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { testimonials } from '../data/site.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords } from './ui/Reveal.jsx';
import Pending from './ui/Pending.jsx';
import Sun from './art/Sun.jsx';

function Postmark() {
  const id = 'pm-path';
  return (
    <svg viewBox="0 0 120 120" className="absolute -left-10 top-4 w-[104px] h-[104px] -rotate-12 opacity-80" aria-hidden="true">
      <defs><path id={id} d="M60 60 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" /></defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="#B4400F" strokeWidth="2" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#B4400F" strokeWidth="1.5" />
      <text fontFamily="DM Mono, monospace" fontSize="10.5" letterSpacing="2.2" fill="#B4400F"><textPath href={`#${id}`}>SANTA ELENA · 2026 · SANTA ELENA ·</textPath></text>
      <text x="60" y="64" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="11" fill="#B4400F">ORE 18</text>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M100 ${44 + i * 10} q 10 -6 20 0 t 20 0 t 20 0`} fill="none" stroke="#B4400F" strokeWidth="1.6" />)}
    </svg>
  );
}

function Cartolina({ t, i }) {
  return (
    <motion.li className="shrink-0 w-[min(86vw,580px)] select-none" style={{ rotate: i % 2 ? 1.4 : -1.2 }}>
      <article className="relative bg-crema rounded-[22px] shadow-[var(--shadow-lg)] p-5 md:p-7 grid grid-cols-[1fr_auto] md:grid-cols-[1.45fr_1fr] gap-4 md:gap-6 min-h-[330px] border border-terracota/25">
        <div className="pr-4 md:pr-6 md:border-r border-dashed border-terracota/40 flex flex-col">
          <p className="font-italianno text-terracota text-[40px] leading-none">{t.greeting}</p>
          <blockquote className="mt-3 text-[17px] italic leading-relaxed text-espresso">“{t.quote}”</blockquote>
          <p className="t-mono text-teja mt-auto pt-5">{t.name} · {t.place}</p>
        </div>
        <div className="relative hidden md:flex flex-col">
          <div className="self-end relative w-[86px] h-[104px] p-[6px] bg-crema" style={{ filter: 'drop-shadow(0 2px 3px rgba(42,20,16,.18))', WebkitMask: 'radial-gradient(circle at 4px 4px, transparent 3.2px, #000 3.6px) -4px -4px / 10px 10px' }}>
            <div className="w-full h-full bg-naranja flex flex-col items-center justify-center gap-1">
              <Sun className="w-[52px] h-[52px]" />
              <span className="t-mono !text-[8px] !tracking-[.08em]">Poste · 2026</span>
            </div>
          </div>
          <Postmark />
          <div className="mt-auto space-y-3 text-[13px] text-espresso/80">
            <p className="border-b border-espresso/30 pb-1 font-italiana text-[20px] text-espresso">Tramonto</p>
            <p className="border-b border-espresso/30 pb-1">Santa Elena, Medellín</p>
            <p className="border-b border-espresso/30 pb-1 t-mono">Colombia</p>
          </div>
        </div>
        <div className="md:hidden self-start relative w-[58px] h-[70px] p-[4px] bg-crema rotate-3" style={{ WebkitMask: 'radial-gradient(circle at 3px 3px, transparent 2.4px, #000 2.8px) -3px -3px / 8px 8px' }}>
          <div className="w-full h-full bg-naranja flex items-center justify-center"><Sun className="w-[40px] h-[40px]" /></div>
        </div>
      </article>
    </motion.li>
  );
}

/** 10 — Testimonios: carrusel arrastrable con inercia de cartoline. */
export default function Testimonials() {
  const wrap = useRef(null);
  const track = useRef(null);
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const measure = () => {
      const w = wrap.current?.offsetWidth || 0;
      const tw = track.current?.scrollWidth || 0;
      setBounds({ left: Math.min(0, w - tw), right: 0 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const step = (d) => {
    const card = track.current?.firstElementChild;
    const w = card ? card.offsetWidth + 28 : 400;
    const target = Math.max(bounds.left, Math.min(0, Math.round((x.get() - d * w) / w) * w));
    animate(x, target, { type: 'spring', stiffness: 120, damping: 22 });
  };

  return (
    <section aria-labelledby="clientes-t" className="relative z-10 bg-mandarina py-28 md:py-36 overflow-hidden">
      <ZigzagEdge color="mandarina" line="rojo" />
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="t-mono mb-4">Clientes · 10</p>
            <MaskWords as="h2" id="clientes-t" lines={['Cartoline', 'de los amici']} className="t-display text-[clamp(48px,7vw,104px)]" />
            <div className="mt-4"><Pending>Placeholder · reemplazar con el highlight “Clientes”</Pending></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="t-mono mr-2 hidden md:inline">Arrastra</span>
            <button type="button" onClick={() => step(-1)} aria-label="Postal anterior" className="w-14 h-14 rounded-full border-[1.5px] border-espresso text-[22px] hover:bg-espresso hover:text-crema transition-colors">←</button>
            <button type="button" onClick={() => step(1)} aria-label="Postal siguiente" className="w-14 h-14 rounded-full bg-espresso text-crema text-[22px] hover:bg-cacao transition-colors">→</button>
          </div>
        </div>
      </div>
      <div ref={wrap} className="container-page mt-14">
        <motion.ul ref={track} className="flex gap-7 w-max cursor-grab active:cursor-grabbing py-4"
          drag="x" style={{ x }} dragConstraints={bounds} dragElastic={0.08}
          dragTransition={{ power: 0.28, timeConstant: 280, bounceStiffness: 200, bounceDamping: 26 }}>
          {testimonials.map((t, i) => <Cartolina key={i} t={t} i={i} />)}
        </motion.ul>
      </div>
    </section>
  );
}
