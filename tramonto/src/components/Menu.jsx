import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { menu, menuPending } from '../data/site.js';
import { gsap } from '../lib/motion.js';
import { useFinePointer, useReducedMotion } from '../hooks/useMedia.js';
import { waHref, waClick, dishMessage } from '../lib/whatsapp.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords } from './ui/Reveal.jsx';
import ArchFrame from './ui/ArchFrame.jsx';
import Pending from './ui/Pending.jsx';
import { Leaf, WhatsAppIcon } from './art/Illustrations.jsx';

function VegTag() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 px-2 py-[2px] rounded-[8px] bg-[#E7EDDD] text-albahaca text-[11px] font-bold align-middle" title="Vegetariano">
      <Leaf className="w-3.5 h-3.5" /> <span className="sr-only">Vegetariano</span><span aria-hidden="true">veg</span>
    </span>
  );
}

function Row({ item, fine, onHover, open, onToggle }) {
  const msg = dishMessage(item.name);
  const head = (
    <>
      <span className="flex items-baseline">
        <span className="font-bold text-[17px] leading-snug text-left">{item.name}{item.veg && <VegTag />}</span>
        <span className="dotted-leader" aria-hidden="true" />
        <span className="t-mono !text-[14px] shrink-0">{item.price}</span>
      </span>
      <span className="block text-[14px] leading-relaxed text-espresso/80 mt-1 text-left">{item.ingredients}</span>
    </>
  );
  return (
    <li className="group py-4 border-b border-espresso/10 last:border-0"
      onMouseEnter={fine ? () => onHover(item) : undefined} onMouseLeave={fine ? () => onHover(null) : undefined}>
      {fine ? <div>{head}</div> : (
        <button type="button" onClick={onToggle} aria-expanded={open} className="block w-full">{head}</button>
      )}
      <AnimatePresence initial={false}>
        {!fine && open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ArchFrame media={{ ...item.media, alt: item.name }} reveal={false} className="w-[200px] h-[250px] mx-auto mt-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <a href={waHref(msg)} onClick={waClick(msg)} target="_blank" rel="noopener noreferrer"
        className={`mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-teja underline decoration-1 underline-offset-4 transition-opacity ${fine ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : ''}`}>
        <WhatsAppIcon className="w-4 h-4" /> Pedir este plato
      </a>
    </li>
  );
}

/** 06 — Il menù: carta de trattoria con tabs y marco flotante que sigue al cursor. */
export default function Menu() {
  const [tab, setTab] = useState(0);
  const [dir, setDir] = useState(1);
  const [hover, setHover] = useState(null);
  const [openRow, setOpenRow] = useState(null);
  const fine = useFinePointer();
  const rm = useReducedMotion();
  const floatRef = useRef(null);
  const tabsRef = useRef([]);
  const cat = menu[tab];
  const lastHover = useRef(null);
  if (hover) lastHover.current = hover;

  const select = (i, focus = false) => {
    setDir(i > tab ? 1 : -1);
    setTab(i);
    setOpenRow(null);
    if (focus) tabsRef.current[i]?.focus();
  };
  const onKey = (e) => {
    const n = menu.length;
    if (e.key === 'ArrowRight') { e.preventDefault(); select((tab + 1) % n, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select((tab - 1 + n) % n, true); }
    if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
  };

  /* marco flotante con inercia */
  useEffect(() => {
    if (!fine || !floatRef.current) return;
    const el = floatRef.current;
    const dur = rm ? 0 : 0.7;
    const xTo = gsap.quickTo(el, 'x', { duration: dur, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: dur, ease: 'power3' });
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3' });
    let lx = 0;
    const move = (e) => { xTo(e.clientX + 56); yTo(e.clientY - 120); rTo(gsap.utils.clamp(-10, 10, (e.clientX - lx) * 0.6)); lx = e.clientX; };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, rm]);

  useEffect(() => {
    if (!floatRef.current) return;
    gsap.to(floatRef.current.firstElementChild, { scale: hover ? 1 : 0.4, opacity: hover ? 1 : 0, duration: rm ? 0 : 0.45, ease: 'power3.out' });
  }, [hover, rm]);

  return (
    <section id="menu" aria-labelledby="menu-t" className="relative z-10 bg-naranja py-28 md:py-36">
      <ZigzagEdge color="naranja" line="rojo" />
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="t-mono mb-4">La carta · 06</p>
            <MaskWords as="h2" id="menu-t" lines={['Il menù']} className="t-display uppercase text-[clamp(64px,10vw,150px)]" />
          </div>
          <div className="md:text-right max-w-[360px]">
            <p className="t-lead">Cocina italiana sin afán: masa de horno, pasta hecha con calma y dolci para la sobremesa.</p>
            <div className="mt-3"><Pending>{menuPending}</Pending></div>
          </div>
        </div>

        <div role="tablist" aria-label="Categorías del menú" className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1" onKeyDown={onKey}>
          {menu.map((c, i) => (
            <button key={c.id} ref={(el) => (tabsRef.current[i] = el)} role="tab" id={`tab-${c.id}`} aria-selected={tab === i}
              aria-controls={`panel-${c.id}`} tabIndex={tab === i ? 0 : -1} onClick={() => select(i)} className="chip">
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative mt-6 rounded-[28px] bg-crema shadow-[var(--shadow-lg)] overflow-hidden grain">
          <div className="absolute inset-3 md:inset-4 rounded-[20px] border border-terracota/30 pointer-events-none" aria-hidden="true" />
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={cat.id} role="tabpanel" id={`panel-${cat.id}`} aria-labelledby={`tab-${cat.id}`} tabIndex={0}
              custom={dir}
              initial={rm ? false : { x: dir * 70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={rm ? undefined : { x: dir * -70, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative px-6 py-10 md:px-14 md:py-14">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
                <h3 className="font-italiana text-terracota text-[clamp(40px,5vw,64px)] leading-none">{cat.label}</h3>
                <p className="t-script text-teja !text-[34px]">{cat.note}</p>
              </div>
              <ul className="grid md:grid-cols-2 gap-x-14">
                {cat.items.map((it) => (
                  <Row key={it.name} item={it} fine={fine} onHover={setHover}
                    open={openRow === it.name} onToggle={() => setOpenRow(openRow === it.name ? null : it.name)} />
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {fine && (
        <div ref={floatRef} className="fixed left-0 top-0 z-30 pointer-events-none" aria-hidden="true">
          <div style={{ opacity: 0 }}>
            {lastHover.current && <ArchFrame media={lastHover.current.media} reveal={false} className="w-[230px] h-[290px]" />}
          </div>
        </div>
      )}
    </section>
  );
}
