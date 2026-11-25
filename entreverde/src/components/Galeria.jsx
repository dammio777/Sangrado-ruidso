import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Foto, Ico, Placeholder, useFocusTrap } from './ui.jsx';
import { FOTOS, GALERIA } from '../data.js';
import { plato, uiAcc } from '../lib/store.js';
import { waEntreverde } from '../lib/util.js';
import { agregarPlato } from './Carta.jsx';
import { useMedia } from '../lib/motion.js';

const FILTROS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'comida', nombre: 'Comida' },
  { id: 'tragos', nombre: 'Tragos' },
  { id: 'lugar', nombre: 'El lugar' },
  { id: 'gente', nombre: 'Gente' },
];
const forma = (id, i, todo) => {
  const f = FOTOS[id];
  if (todo) return i === 0 ? 'g-grande' : i === 3 ? 'g-ancha' : '';
  if (!f) return '';
  if (f.h > f.w * 1.15) return 'g-alta';
  if (f.w > f.h * 1.6 && i % 3 === 0) return 'g-ancha';
  return i === 0 ? 'g-grande' : '';
};

function Visor({ items, idx, setIdx, onCerrar }) {
  const ref = useRef(null);
  useFocusTrap(ref, true, onCerrar);
  const it = items[idx];
  const dir = useRef(0);
  const ir = (d) => { dir.current = d; setIdx((i) => (i + d + items.length) % items.length); };
  useEffect(() => {
    const k = (e) => { if (e.key === 'ArrowRight') ir(1); if (e.key === 'ArrowLeft') ir(-1); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [items.length]);
  const p = it.plato ? plato(it.plato) : null;
  const btn = useRef(null);
  return (
    <motion.div ref={ref} className="visor glass-dark" role="dialog" aria-modal="true" aria-label="Visor de fotos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ background: 'rgba(20,24,18,.86)' }}>
      <div className="visor-top">
        <span className="num" aria-live="polite">{idx + 1} / {items.length}</span>
        <button type="button" className="btn-ico" style={{ color: 'var(--c-crema)' }} onClick={onCerrar} aria-label="Cerrar visor" data-autofocus><Ico.x /></button>
      </div>
      <div className="visor-escena">
        <button type="button" className="btn-ico glass-dark visor-flecha" style={{ left: 16 }} onClick={() => ir(-1)} aria-label="Foto anterior"><Ico.izq /></button>
        <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
          <motion.div
            key={it.foto + idx}
            custom={dir.current}
            initial={{ opacity: 0, x: dir.current * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir.current * -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, info) => { if (info.offset.x < -70) ir(1); else if (info.offset.x > 70) ir(-1); }}
            style={{ display: 'grid', placeItems: 'center' }}
          >
            {FOTOS[it.foto]?.src ? <Foto id={it.foto} sizes="92vw" /> : <Placeholder icono={FOTOS[it.foto]?.icono} />}
          </motion.div>
        </AnimatePresence>
        <button type="button" className="btn-ico glass-dark visor-flecha" style={{ right: 16 }} onClick={() => ir(1)} aria-label="Foto siguiente"><Ico.der /></button>
      </div>
      <div className="visor-pie">
        {p ? (
          <button ref={btn} type="button" className="btn btn-ambar" onClick={() => agregarPlato(p, btn.current)} disabled={!p.disponible}>Lo quiero · agregar {p.nombre}</button>
        ) : (
          <a className="btn btn-ambar" href={waEntreverde('¡Hola Entreverde! 🍃 Vi las fotos en la página y quiero ir. ¿Me ayudan a separar mesa?')} target="_blank" rel="noopener"><Ico.wa /> Lo quiero</a>
        )}
      </div>
    </motion.div>
  );
}

export default function Galeria() {
  const [f, setF] = useState('todo');
  const [idx, setIdx] = useState(null);
  const fino = useMedia('(pointer: fine)');
  const cursor = useRef(null);
  // En "Todo": una foto por categoría (máx. 4) para que el scroll sea corto; solo fotos reales.
  const reales = GALERIA.filter((g) => FOTOS[g.foto]?.src);
  const items = f === 'todo'
    ? (() => {
        const uno = ['comida', 'lugar', 'tragos', 'gente'].map((c) => reales.find((g) => g.cat === c)).filter(Boolean);
        const usadas = uno.map((g) => g.cat);
        const extra = reales.filter((g) => !uno.includes(g)).sort((a, b) => usadas.filter((c) => c === a.cat).length - usadas.filter((c) => c === b.cat).length || (a.cat === 'lugar' ? -1 : 1));
        return [...uno, ...extra].slice(0, 4);
      })()
    : GALERIA.filter((g) => g.cat === f);

  // Pastilla "Ver" que sigue al cursor sobre las fotos (solo desktop).
  useEffect(() => {
    if (!fino) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, activo = false;
    const el = cursor.current;
    const loop = () => { x += (tx - x) * 0.22; y += (ty - y) * 0.22; el.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`; raf = activo || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0; };
    const mv = (e) => { tx = e.clientX; ty = e.clientY; const sobre = !!e.target.closest?.('.gal-it'); if (sobre !== activo) { activo = sobre; el.classList.toggle('on', sobre); if (sobre) { x = tx; y = ty; } } if (activo && !raf) raf = requestAnimationFrame(loop); };
    addEventListener('pointermove', mv, { passive: true });
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(raf); };
  }, [fino]);

  const abrir = (i) => { setIdx(i); uiAcc.modal(1); };
  const cerrar = () => { setIdx(null); uiAcc.modal(-1); };

  return (
    <section className="sec noche" data-noche aria-labelledby="gal-tit">
      <div className="wrap">
        <div className="titulo-sec">
          <span className="eyebrow">Galería</span>
          <h2 id="gal-tit" className="t-heading">El parche, <span className="acento">en fotos.</span></h2>
        </div>
        <div className="filtros" role="toolbar" aria-label="Filtrar fotos">
          {FILTROS.map((x) => <button key={x.id} type="button" className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>{x.nombre}</button>)}
        </div>
        <LayoutGroup>
          <motion.div layout className="gal">
            <AnimatePresence mode="popLayout">
              {items.map((g, i) => (
                <motion.button
                  layout
                  key={g.foto}
                  type="button"
                  className={`gal-it ${forma(g.foto, i, f === 'todo')}`}
                  onClick={() => abrir(i)}
                  aria-label={`Abrir foto: ${FOTOS[g.foto]?.alt || 'Foto próximamente'}`}
                  initial={{ opacity: 0, clipPath: 'inset(12% 12% 12% 12% round 28px)' }}
                  whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {FOTOS[g.foto]?.src ? <Foto id={g.foto} sizes="(min-width: 900px) 30vw, 50vw" /> : <Placeholder icono={FOTOS[g.foto]?.icono} />}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
      <div ref={cursor} className="cursor-ver glass-dark" aria-hidden="true">Ver</div>
      <AnimatePresence>{idx != null && <Visor items={items} idx={idx} setIdx={setIdx} onCerrar={cerrar} />}</AnimatePresence>
    </section>
  );
}
