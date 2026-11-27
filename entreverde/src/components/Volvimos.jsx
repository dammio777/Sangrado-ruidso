import { useEffect, useRef, useState } from 'react';
import { Foto, Ico, Ejemplo } from './ui.jsx';
import { CONFIG } from '../data.js';
import { bogota, cuandoAbre, fechaBonita, horaBonita } from '../lib/horario.js';
import { mensajeReapertura, onCompartir, reducido, waLink } from '../lib/util.js';
import { uiAcc } from '../lib/store.js';
import { irA } from '../lib/scroll.js';
import { useReveal } from '../lib/motion.js';
import { useEstado } from './Navbar.jsx';

const NUEVO = [
  { t: 'Nueva imagen', d: 'Logo, colores y un lugar renovado para recibir al parche.', ico: 'hoja', ir: null },
  { t: 'Arma tu desgranado', d: 'Los 25 ingredientes en tus manos. Ponle nombre y compártelo.', ico: 'dado', ir: 'desgranado' },
  { t: 'Combos para el parche', d: 'Desgranados, papas, cervezas y salsas para 3 o 4.', ico: 'mesa', ir: 'combos' },
  { t: 'Domicilios en Santa Elena', d: 'Lo de siempre, ahora hasta tu puerta.', ico: 'moto', ir: 'panel' },
];

/* Estado de la reapertura según CONFIG.reapertura.fecha (hora de Bogotá). */
function estadoReapertura() {
  const f = CONFIG.reapertura.fecha;
  if (!f) return { ya: true };
  const [y, m, d] = f.split('-').map(Number);
  const hoy = bogota();
  const dias = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(hoy.y, hoy.m, hoy.d)) / 864e5);
  const dia = { y, m: m - 1, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
  return dias > 0 ? { ya: false, dias, dia } : { ya: true, dia };
}

function Contador({ hasta }) {
  const ref = useRef(null);
  const [v, setV] = useState(reducido() ? hasta : 0);
  useEffect(() => {
    if (reducido()) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const f = (t) => { const p = Math.min(1, (t - t0) / 1200); setV(Math.round(hasta * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [hasta]);
  return <span ref={ref} className="volv-num num">{v}</span>;
}

export default function Volvimos() {
  const r = estadoReapertura();
  const e = useEstado();
  const ref = useReveal();
  const logo = useRef(null);
  const [dibuja, setDibuja] = useState(reducido());
  useEffect(() => {
    if (reducido()) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDibuja(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(logo.current);
    return () => io.disconnect();
  }, []);
  const msg = mensajeReapertura();
  const ir = (dest) => (dest === 'panel' ? uiAcc.abrirPanel('domicilio') : irA(dest));
  if (!CONFIG.reapertura.activa) return null;

  return (
    <section id="volvimos" className="sec volv" aria-labelledby="volv-tit">
      <div className="wrap">
        <div className="volv-grid">
          <div className="volv-txt" ref={ref}>
            <span className="eyebrow">Reapertura · Santa Elena</span>
            <div className="volv-cont" aria-label={`${CONFIG.reapertura.diasFuera} días después`}>
              <Contador hasta={CONFIG.reapertura.diasFuera} />
              <span className="acento volv-dias">días después</span>
            </div>
            <h2 id="volv-tit" className="t-heading">Volvimos, con <span className="acento">nueva imagen.</span></h2>
            <p className="t-lead muted">Después de {CONFIG.reapertura.tiempoFuera} cerrados, Entreverde vuelve a abrir en Santa Elena. Llegamos con nueva imagen y carta renovada, y con el plan de siempre: venir con tu gente, pedir para el centro y quedarse hasta que prendan las luces.</p>
            <div className="volv-estado">
              {r.ya ? (
                <>
                  <span className={`punto ${e.abierto ? 'vivo' : ''}`} aria-hidden="true" />
                  <span><b>Ya estamos de vuelta.</b> {e.abierto ? `Abiertos ahora, hasta las ${horaBonita(e.cierra, true)}.` : `Te esperamos ${cuandoAbre(e)}.`}</span>
                </>
              ) : (
                <>
                  <b>Reabrimos el {fechaBonita(r.dia)}{' '}</b>
                  <span className="chip chip-sm on num">Faltan {r.dias} {r.dias === 1 ? 'día' : 'días'}</span>
                </>
              )}
              {!CONFIG.reapertura.fecha && <Ejemplo>fecha por confirmar</Ejemplo>}
            </div>
            <div className="hero-btns">
              <a className="btn btn-pri" href={waLink(msg)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, msg)}><Ico.wa /> Cuéntale al parche que volvimos</a>
              <button type="button" className="btn btn-sec" onClick={() => uiAcc.abrirPanel('reservar')}>Separar mesa</button>
            </div>
          </div>

          <div className="volv-media">
            <div className="volv-foto"><Foto id="lugar-fachada" sizes="(min-width: 1024px) 560px, 100vw" /></div>
            <div ref={logo} className={`volv-marca ${dibuja ? 'on' : ''}`} aria-label="La nueva imagen de Entreverde">
              <span className="volv-circ">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <path className="volv-e" pathLength="1" d="M20.5 36h23c0-7.6-4.8-12.4-11.3-12.4-6.9 0-11.7 5.4-11.7 12.4 0 7.3 5 12.4 12 12.4 4.4 0 7.6-1.8 9.8-5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                  <path className="volv-hoja" d="M29.5 12.5c4.6.6 7.6 3.4 8.4 7.6-4.5-.4-7.6-3.3-8.4-7.6z" fill="#fff" />
                </svg>
              </span>
              <div>
                <div className="wordmark" style={{ fontSize: 22 }}>entreverde</div>
                <div className="volv-lema">Tragos y comidas que se comparten</div>
                <div className="volv-colores" aria-hidden="true">
                  {['--c-oliva', '--c-crema', '--c-bosque', '--c-ambar'].map((c) => <i key={c} style={{ background: `var(${c})` }} />)}
                </div>
              </div>
              <span className="volv-sello">Nueva imagen</span>
            </div>
          </div>
        </div>

        <div className="volv-nuevo" role="list" aria-label="Lo nuevo en Entreverde">
          {NUEVO.map((n) => {
            const I = Ico[n.ico];
            const cuerpo = (
              <>
                <span className="volv-ico"><I /></span>
                <b>{n.t}</b>
                <span className="t-sm muted">{n.d}</span>
              </>
            );
            return n.ir ? (
              <button key={n.t} type="button" role="listitem" className="volv-it" onClick={() => ir(n.ir)}>{cuerpo}<Ico.der className="volv-flecha" width="18" height="18" /></button>
            ) : (
              <div key={n.t} role="listitem" className="volv-it">{cuerpo}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
