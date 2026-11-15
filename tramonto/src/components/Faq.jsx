import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { faq } from '../data/site.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords } from './ui/Reveal.jsx';
import Pending from './ui/Pending.jsx';
import Sun from './art/Sun.jsx';

/** 11 — Lo que debes saber antes de venir. */
export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section aria-labelledby="faq-t" className="relative z-10 bg-naranja py-28 md:py-36">
      <ZigzagEdge color="naranja" line="rojo" />
      <div className="container-page grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="t-mono mb-4">Preguntas · 11</p>
            <MaskWords as="h2" id="faq-t" lines={['Lo que debes', 'saber antes', 'de venir']} className="t-display text-[clamp(44px,5.6vw,84px)]" />
            <p className="t-script mt-6 -rotate-3 text-ladrillo">tranquilo, amici</p>
          </div>
        </div>
        <ul className="lg:col-span-7 space-y-3">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="rounded-[24px] bg-crema shadow-[var(--shadow-md)] overflow-hidden">
                <h3>
                  <button type="button" id={`faq-b-${i}`} aria-expanded={isOpen} aria-controls={`faq-p-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-6 text-left px-6 md:px-8 py-6 rounded-[24px]">
                    <span className="font-bold text-[18px] md:text-[20px]">{f.q}</span>
                    <span className="shrink-0 w-10 h-10 transition-transform duration-700 ease-[var(--ease-sun)]" style={{ transform: `rotate(${isOpen ? 180 : 0}deg) scale(${isOpen ? 1.08 : 1})` }}>
                      <Sun className="w-full h-full" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <div className="px-6 md:px-8 pb-7 -mt-1">
                        <p className="text-[16px] leading-relaxed text-espresso/85 max-w-[58ch]">{f.a}</p>
                        {f.pending && <div className="mt-3"><Pending>Ajustar</Pending></div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
