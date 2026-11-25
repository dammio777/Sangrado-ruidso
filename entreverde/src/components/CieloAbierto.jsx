import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Foto } from './ui.jsx';
import { gsap } from '../lib/scroll.js';
import { reducido } from '../lib/util.js';

const CAPS = [ // [AJUSTAR con el dueño]
  { t: 'Terraza en el segundo piso', x: 48, y: 30 },
  { t: 'Luces de noche', x: 18, y: 16 },
  { t: 'Fogata para el frío de Santa Elena', x: 66, y: 74 },
  { t: 'Barra para brindar', x: 26, y: 66 },
];

/* La foto se abre estilo Apple: scrub SIN pin, solo clip-path y transform. */
export default function CieloAbierto() {
  const sec = useRef(null), media = useRef(null), img = useRef(null);
  const [caps, setCaps] = useState(0);
  useLayoutEffect(() => {
    if (reducido() || matchMedia('(max-width: 767px)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(media.current, { clipPath: 'inset(0% 10% 0% 10% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: media.current, start: 'top 88%', end: 'top 12%', scrub: 0.4 } });
      gsap.fromTo(img.current, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: media.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
    }, sec);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      CAPS.forEach((_, i) => setTimeout(() => setCaps((c) => Math.max(c, i + 1)), reducido() ? 0 : 200 + i * 260));
    }, { threshold: 0.45 });
    io.observe(media.current);
    return () => io.disconnect();
  }, []);
  return (
    <section id="lugar" ref={sec} className="sec cielo" aria-labelledby="cielo-tit">
      <div className="wrap titulo-sec">
        <span className="eyebrow">Bajo el cielo abierto</span>
        <h2 id="cielo-tit" className="t-heading">Un lugar para <span className="acento">quedarse.</span></h2>
        <p className="t-lead muted">Un contenedor oscuro, una terraza de estibas en el segundo piso, monsteras, sillas altas de madera y luces de bombillo. Buena comida, brisa natural y el mejor ambiente.</p>
      </div>
      <div className="cielo-media" ref={media}>
        <Foto id="lugar-frente" imgRef={img} sizes="100vw" />
        {CAPS.map((c, i) => (
          <span key={c.t} className={`cielo-cap glass-light ${caps > i ? 'on' : ''}`} style={{ left: `${c.x}%`, top: `${c.y}%` }}>{c.t}</span>
        ))}
      </div>
      <div className="cielo-fila" aria-label="Lo que hay en el lugar">
        {CAPS.map((c) => <span key={c.t} className="chip">{c.t}</span>)}
      </div>
    </section>
  );
}
