import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { gallery, galleryFilters, tones } from '../data/site.js';
import { lockScroll } from '../lib/motion.js';
import { useReducedMotion } from '../hooks/useMedia.js';
import { waHref, waClick } from '../lib/whatsapp.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords } from './ui/Reveal.jsx';
import Pending from './ui/Pending.jsx';
import Sun from './art/Sun.jsx';
import { WhatsAppIcon } from './art/Illustrations.jsx';

const R = (t, b) => ({ borderTopLeftRadius: t, borderTopRightRadius: t, borderBottomLeftRadius: b, borderBottomRightRadius: b });
const RADIUS = { arch: R(999, 24), tall: R(24, 24), square: R(24, 24) };
const catLabel = (id) => galleryFilters.find((f) => f.id === id)?.label || '';

/** Medio de la tarjeta: foto, video en loop mudo o placeholder con el sol al 10%. */
function Media({ item, big = false }) {
  const tone = tones[item.tone] || tones.mandarina;
  if (item.video) return <video className="absolute inset-0 w-full h-full object-cover" src={item.video} autoPlay muted loop playsInline aria-label={item.title} />;
  if (item.src) return <img className="absolute inset-0 w-full h-full object-cover" src={item.src} alt={item.title} loading="lazy" decoding="async" />;
  return (
    <>
      <Sun variant="mono" color={tone.fg} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 ${big ? 'w-[70%]' : 'w-[78%]'}`} />
      <span className="t-mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap" style={{ color: tone.fg }}>Foto próximamente</span>
    </>
  );
}

function Card({ item, onOpen, index }) {
  const tone = tones[item.tone] || tones.mandarina;
  const aspect = item.shape === 'square' ? 'aspect-square' : item.shape === 'tall' ? 'aspect-[4/5]' : 'aspect-[4/5]';
  return (
    <motion.li layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      className={index % 3 === 1 ? 'md:mt-16' : ''}>
      <button type="button" onClick={() => onOpen(item)} data-cursor="ver" className="group block w-full text-left rounded-[24px]"
        aria-label={`Ver ${item.title}`}>
        <motion.div layoutId={`media-${item.id}`} className={`relative overflow-hidden ${aspect}`}
          style={{ ...RADIUS[item.shape], background: tone.bg, border: '2px solid #FFF8EE', boxShadow: 'var(--shadow-md)' }}>
          <Media item={item} />
          <span className="absolute inset-0 bg-crema opacity-0 group-hover:opacity-25 group-focus-visible:opacity-25 transition-opacity duration-500" aria-hidden="true" />
          <span className="absolute left-3 right-3 bottom-3 rounded-[18px] bg-crema/95 text-espresso px-4 py-3 translate-y-[120%] group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-500 ease-[var(--ease-sun)]">
            <span className="block font-italiana text-[24px] leading-tight">{item.title}</span>
            <span className="block text-[13px] text-espresso/75">{item.ingredients}</span>
          </span>
        </motion.div>
        <span className="mt-3 flex items-center justify-between t-mono">
          <span>{item.title}</span><span className="opacity-70">{catLabel(item.cat)}</span>
        </span>
      </button>
    </motion.li>
  );
}

function Modal({ item, onClose }) {
  const closeRef = useRef(null);
  const tone = tones[item.tone] || tones.mandarina;
  const msg = `Buonasera Tramonto! Lo quiero: ${item.dish || item.title}. ¿Me ayudan?`;
  useEffect(() => {
    lockScroll(true);
    const prev = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = [...document.querySelectorAll('#galeria-modal button, #galeria-modal a')];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { lockScroll(false); window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);

  return (
    <motion.div id="galeria-modal" role="dialog" aria-modal="true" aria-labelledby="galeria-modal-t"
      className="on-dark fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-espresso/90 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[1100px] max-h-full overflow-auto grid md:grid-cols-2 gap-6 md:gap-10 items-center">
        <motion.div layoutId={`media-${item.id}`} className="relative w-full aspect-[4/5] max-h-[78vh] mx-auto overflow-hidden"
          style={{ ...RADIUS[item.shape], background: tone.bg, border: '2px solid #FFF8EE', boxShadow: 'var(--shadow-lg)' }}>
          <Media item={item} big />
        </motion.div>
        <motion.div className="text-crema" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.25 } }} exit={{ opacity: 0 }}>
          <p className="t-mono text-dorado">{catLabel(item.cat)}</p>
          <h3 id="galeria-modal-t" className="font-italiana text-[clamp(44px,5vw,72px)] leading-none mt-3">{item.title}</h3>
          <p className="t-mono mt-4 opacity-80">{item.ingredients}</p>
          <p className="t-lead mt-6 max-w-[440px]">{item.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waHref(msg)} onClick={waClick(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-orange">
              <WhatsAppIcon className="w-5 h-5" /> Lo quiero
            </a>
            <button ref={closeRef} type="button" onClick={onClose} className="btn btn-ghost-night">Cerrar</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** 08 — Galería: filtros, 1 destacada por categoría en "Todo", modal con imagen compartida. */
export default function Gallery() {
  const [filter, setFilter] = useState('todo');
  const [open, setOpen] = useState(null);
  const rm = useReducedMotion();
  const items = useMemo(() => (filter === 'todo' ? gallery.filter((g) => g.featured) : gallery.filter((g) => g.cat === filter)), [filter]);

  return (
    <section id="galeria" aria-labelledby="galeria-t" className="relative z-10 bg-naranja py-28 md:py-36">
      <ZigzagEdge color="naranja" line="rojo" />
      <div className="container-page">
        <div className="text-center max-w-[900px] mx-auto">
          <p className="t-mono mb-5">Galería · 08</p>
          <MaskWords as="h2" id="galeria-t" lines={['Platos reales.', 'Atardeceres reales.']} className="t-display text-[clamp(48px,7vw,104px)]" />
          <div className="mt-5"><Pending>Fotos y reels reales por llegar</Pending></div>
        </div>

        <div role="group" aria-label="Filtrar galería" className="mt-10 flex md:flex-wrap md:justify-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {galleryFilters.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className="chip shrink-0">{f.label}</button>
          ))}
        </div>

        <LayoutGroup>
          <motion.ul layout={!rm} className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14 items-start">
            <AnimatePresence mode="popLayout">
              {items.map((it, i) => <Card key={it.id} item={it} index={i} onOpen={setOpen} />)}
            </AnimatePresence>
          </motion.ul>
          <AnimatePresence>
            {open && <Modal key="modal" item={open} onClose={() => setOpen(null)} />}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
