import { useEffect, useRef } from 'react';
import { Mono } from './ui.jsx';
import { velocidad } from '../lib/scroll.js';
import { reducido } from '../lib/util.js';

const TEXTO = ['Volvimos', 'Tragos', 'Desgranados para compartir', 'Bajo el cielo abierto', 'Santa Elena', 'De camino al parque'];

/* Velocidad constante; con el scroll se acelera un poco (skew máx. 4°) y vuelve a su ritmo.
   Se pausa fuera de pantalla y con la pestaña oculta. */
export default function Marquee() {
  const sec = useRef(null), track = useRef(null);
  useEffect(() => {
    if (reducido()) return;
    let x = 0, raf = 0, visible = false, extra = 0, skew = 0, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(48, t - last); last = t;
      const w = track.current.scrollWidth / 2;
      const objetivo = Math.min(6, Math.abs(velocidad.v) * 0.25);
      extra += (objetivo - extra) * 0.08;
      skew += ((Math.max(-4, Math.min(4, velocidad.v * 0.12))) - skew) * 0.1;
      velocidad.v *= 0.92;
      x -= (0.045 + extra * 0.04) * dt;
      if (-x >= w) x += w;
      track.current.style.transform = `translate3d(${x}px,0,0) skewX(${-skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
    io.observe(sec.current);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', vis);
    return () => { io.disconnect(); stop(); document.removeEventListener('visibilitychange', vis); };
  }, []);
  const grupo = (k) => (
    <div className="cinta-item" key={k} aria-hidden={k > 0}>
      {TEXTO.map((t, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span>{t.toUpperCase()}</span>
          <Mono trazo={3} />
        </span>
      ))}
    </div>
  );
  return (
    <section className="cinta" ref={sec} aria-label="Tragos, desgranados para compartir, bajo el cielo abierto, Santa Elena, de camino al parque">
      <div className="cinta-track" ref={track}>{[0, 1, 2, 3].map(grupo)}</div>
    </section>
  );
}
