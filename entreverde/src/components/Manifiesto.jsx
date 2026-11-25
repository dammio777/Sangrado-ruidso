import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Ico, LogoCirculo } from './ui.jsx';
import { CONFIG } from '../data.js';
import { gsap } from '../lib/scroll.js';
import { reducido } from '../lib/util.js';

const TEXTO = 'En Entreverde nada llega para uno solo. Los platos van al centro, los tragos se chocan y la mesa se agranda cuando llega alguien más. Ven con tu gente, quédate hasta que prendan las luces y brinda bajo el cielo abierto.'; // [AJUSTAR CON EL DUEÑO]

function Contador({ hasta }) {
  const ref = useRef(null);
  const [v, setV] = useState(reducido() ? hasta : 0);
  useEffect(() => {
    if (reducido()) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const f = (t) => { const p = Math.min(1, (t - t0) / 1100); setV(Math.round(hasta * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [hasta]);
  const k = v >= 1000 ? `${(v / 1000).toFixed(1).replace('.', ',')}K` : v;
  return <b ref={ref} className="num">{k}</b>;
}

export default function Manifiesto() {
  const p = useRef(null);
  useLayoutEffect(() => {
    if (reducido()) return;
    const ctx = gsap.context(() => {
      gsap.to(p.current.querySelectorAll('.p'), { opacity: 1, stagger: 0.04, ease: 'none', scrollTrigger: { trigger: p.current, start: 'top 80%', end: 'bottom 55%', scrub: 0.3 } });
    }, p);
    return () => ctx.revert();
  }, []);
  return (
    <section className="sec" aria-label="Manifiesto">
      <div className="wrap mani-grid">
        <p ref={p} className="mani-txt">
          {TEXTO.split(' ').map((w, i) => <span key={i} className="p">{w} </span>)}
        </p>
        <div className="mani-lado">
          <p className="cita acento" style={{ margin: 0 }}>«{CONFIG.marca.frase}»</p>
          <div className="ig-card">
            <div className="ig-cab">
              <LogoCirculo size={64} />
              <div style={{ minWidth: 0 }}>
                <div className="ig-handle">entrevrde</div>
                <div className="t-sm muted">Entreverde</div>
              </div>
            </div>
            <div className="ig-stats">
              <div><b className="num">{CONFIG.marca.publicaciones}</b><span>publicaciones</span></div>
              <div><Contador hasta={CONFIG.marca.seguidores} /><span>amigos</span></div>
              <div><b className="num">{CONFIG.marca.seguidos}</b><span>seguidos</span></div>
            </div>
            <ul className="ig-bio">
              {CONFIG.marca.bio.map((l, i) => <li key={i}>{[<Ico.hoja key="a" />, <Ico.mapa key="b" />, <Ico.reloj key="c" />, <Ico.moto key="d" />][i]}{l}</li>)}
            </ul>
            <div className="ig-dest">
              {CONFIG.marca.destacados.map((d, i) => (
                <a key={d} href={CONFIG.marca.instagramUrl} target="_blank" rel="noopener">
                  <span className="ig-circ">{i === 0 ? <Ico.mapa /> : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" /></svg>}</span>
                  <span className="t-sm">{d}</span>
                </a>
              ))}
            </div>
            <a className="btn btn-pri btn-sm" href={CONFIG.marca.instagramUrl} target="_blank" rel="noopener" style={{ justifySelf: 'start' }}><Ico.insta /> Seguir en Instagram</a>
          </div>
        </div>
      </div>
    </section>
  );
}
