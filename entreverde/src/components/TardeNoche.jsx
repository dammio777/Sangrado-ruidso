import { useEffect, useRef, useState } from 'react';
import { Foto } from './ui.jsx';

/* Curva de bombillos (SVG). Se encienden uno a uno cuando `on`. */
export function Bombillos({ on, n = 13, className = 'bombillos', curva = 70, alto = 160 }) {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return { x: 40 + t * 920, y: 24 + Math.sin(t * Math.PI) * curva };
  });
  return (
    <svg className={`${className} ${on ? 'on' : ''}`} viewBox={`0 0 1000 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0 10 Q 500 ${24 + curva * 2} 1000 10`} fill="none" stroke="rgba(244,241,232,.35)" strokeWidth="1.4" />
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <line y1="-10" y2="6" stroke="rgba(244,241,232,.35)" strokeWidth="1.2" />
          <circle className="bombillo-glow" r="22" fill="url(#glow)" style={{ transitionDelay: `${i * 110}ms` }} />
          <ellipse className="bombillo" cy="14" rx="6" ry="8.5" fill="var(--c-ambar)" style={{ transitionDelay: `${i * 110}ms` }} />
        </g>
      ))}
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#F2B65A" stopOpacity=".9" /><stop offset="1" stopColor="#F2B65A" stopOpacity="0" /></radialGradient>
      </defs>
    </svg>
  );
}

function Estrellas() {
  return (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }} aria-hidden="true">
      <rect width="400" height="300" fill="var(--c-bosque)" />
      {Array.from({ length: 46 }).map((_, i) => (
        <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 190} r={i % 5 === 0 ? 1.6 : 0.9} fill="#F4F1E8" opacity={0.25 + ((i * 7) % 10) / 16} />
      ))}
      <circle cx="320" cy="60" r="20" fill="#F4F1E8" opacity=".9" />
      <circle cx="330" cy="54" r="18" fill="var(--c-bosque)" />
      <g fill="none" stroke="var(--c-ambar)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(140 130)">
        <path d="M0 0h40l-3 26a17 17 0 0 1-34 0z M20 44v44 M6 92h28" transform="rotate(-10 20 40)" />
        <path d="M70 0h40l-3 26a17 17 0 0 1-34 0z M90 44v44 M76 92h28" transform="rotate(10 90 40)" />
        <path d="M55 -18v-10 M42 -14l-6 -8 M68 -14l6 -8" />
      </g>
      <path d="M0 300 L0 250 Q 60 220 120 246 T 250 236 T 400 240 L400 300z" fill="#141912" />
    </svg>
  );
}

const BLOQUES = [ // [AJUSTAR]
  { hora: '4:00', suf: 'p. m.', frase: 'Llegas con sol, pides algo para picar.', media: <Foto id="lugar-angulo" sizes="(min-width: 860px) 600px, 100vw" /> },
  { hora: '7:00', suf: 'p. m.', frase: 'Se prenden las luces y la fogata.', media: 'luces' },
  { hora: '11:00', suf: 'p. m.', frase: 'El último brindis bajo el cielo.', media: <Estrellas /> },
];

/* Cambio de fondo por bloque (crema → carbón → bosque) con fundido de 600 ms. Sin pin. */
export default function TardeNoche() {
  const [fase, setFase] = useState(0);
  const [luces, setLuces] = useState(false);
  const refs = [useRef(null), useRef(null), useRef(null)];
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.i);
        setFase(i);
        if (i >= 1) setLuces(true);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.forEach((r) => io.observe(r.current));
    return () => io.disconnect();
  }, []);
  return (
    <section className="tn" data-fase={fase} aria-labelledby="tn-tit">
      <div className="tn-fondos" aria-hidden="true"><div className="f0" /><div className="f1" /><div className="f2" /></div>
      <div className="wrap" style={{ position: 'relative', paddingTop: 'clamp(88px, 11vw, 140px)' }}>
        <div className="titulo-sec" style={{ marginBottom: 0 }}>
          <span className="eyebrow" style={{ color: 'inherit', opacity: 0.8 }}>De 4 p. m. a medianoche</span>
          <h2 id="tn-tit" className="t-heading">De la tarde <span className="acento">a la noche.</span></h2>
        </div>
        {BLOQUES.map((b, i) => (
          <div key={i} ref={refs[i]} data-i={i} className="tn-bloque" {...(i > 0 ? { 'data-noche': '' } : {})}>
            <div className="tn-media">
              {b.media === 'luces' ? (
                <>
                  <Foto id="pendones-noche" sizes="(min-width: 860px) 600px, 100vw" />
                  <Bombillos on={luces} />
                </>
              ) : b.media}
            </div>
            <div>
              <div className="tn-hora">{b.hora}<small>{b.suf}</small></div>
              <p className="tn-frase">{b.frase}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
