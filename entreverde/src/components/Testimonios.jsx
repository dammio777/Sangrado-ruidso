import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import ChatParche from './ChatParche.jsx';
import { Ico, Ejemplo } from './ui.jsx';
import { TESTIMONIOS } from '../data.js';

export default function Testimonios() {
  const cont = useRef(null), track = useRef(null);
  const x = useMotionValue(0);
  const [lim, setLim] = useState(0);
  useEffect(() => {
    const f = () => setLim(Math.min(0, cont.current.offsetWidth - track.current.scrollWidth));
    f();
    const ro = new ResizeObserver(f);
    ro.observe(cont.current);
    return () => ro.disconnect();
  }, []);
  const mover = (d) => {
    const paso = 358;
    animate(x, Math.max(lim, Math.min(0, x.get() - d * paso)), { type: 'spring', stiffness: 260, damping: 32 });
  };
  return (
    <section className="sec noche-carbon" data-noche aria-labelledby="tes-tit">
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
        <div className="titulo-sec" style={{ marginBottom: 0 }}>
          <span className="eyebrow">Lo que dice el parche</span>
          <h2 id="tes-tit" className="t-heading">Reseñas que llegan <span className="acento">por el grupo.</span></h2>
          <div><Ejemplo>reseñas de ejemplo · reemplazar por reales</Ejemplo></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-ico glass-dark" onClick={() => mover(-1)} aria-label="Anterior"><Ico.izq /></button>
          <button type="button" className="btn-ico glass-dark" onClick={() => mover(1)} aria-label="Siguiente"><Ico.der /></button>
        </div>
      </div>
      <div
        className="carrusel"
        ref={cont}
        tabIndex={0}
        role="region"
        aria-label="Reseñas, usa las flechas del teclado para moverte"
        onKeyDown={(e) => { if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); }}
      >
        <motion.div ref={track} className="carrusel-track" drag="x" style={{ x }} dragConstraints={{ left: lim, right: 0 }} dragElastic={0.12} dragTransition={{ power: 0.3, timeConstant: 220 }}>
          {TESTIMONIOS.map((t, i) => (
            <ChatParche key={i} guion={t.msgs} titulo={t.titulo} estatico mini pie={false} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
