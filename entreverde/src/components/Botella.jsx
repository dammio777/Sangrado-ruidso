import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Ico } from './ui.jsx';
import { acciones, mesa, useStore } from '../lib/store.js';
import { onCompartir, urlBase, waLink } from '../lib/util.js';
import { useReduced } from '../lib/motion.js';

const RETOS = ['Pide la ronda', 'Escoge la canción', 'Elige el postre', 'Arma el desgranado', 'Escoge la mesa'];
const EJEMPLO = ['Juli', 'Tú', 'Sara', 'Mateo', 'Vale'];

export default function Botella() {
  const m = useStore(mesa);
  const reduced = useReduced();
  const nombres = m.nombres.length >= 2 ? m.nombres : EJEMPLO;
  const [reto, setReto] = useState(RETOS[0]);
  const [giro, setGiro] = useState(0);
  const [gana, setGana] = useState(null);
  const [girando, setGirando] = useState(false);
  const [v, setV] = useState('');
  const chispas = useRef(0);

  const girar = () => {
    if (girando) return;
    const n = nombres.length;
    const idx = Math.floor(Math.random() * n);
    const objetivo = (idx / n) * 360; // 0° = arriba
    const base = giro - (giro % 360);
    const vueltas = reduced ? 0 : 360 * (3 + Math.floor(Math.random() * 2));
    const final = base + vueltas + objetivo + (objetivo <= (giro % 360) ? 360 : 0);
    setGana(null);
    setGirando(true);
    setGiro(reduced ? objetivo : final);
    setTimeout(() => { setGana(idx); setGirando(false); chispas.current++; }, reduced ? 50 : 2850);
  };
  const add = () => { const t = v.trim(); if (!t) return; acciones.setNombres([...m.nombres, t]); setV(''); };
  const ganador = gana != null ? nombres[gana] : null;
  const msg = ganador ? `🍾 La botella habló en Entreverde: a ${ganador} le toca «${reto.toLowerCase()}». Sin excusas 😄 ¿Cuándo vamos? ${urlBase()}` : '';

  return (
    <section className="sec noche" data-noche aria-labelledby="bot-tit">
      <div className="wrap botella-grid">
        <div style={{ display: 'grid', gap: 22 }}>
          <span className="eyebrow">Para jugar en la mesa</span>
          <h2 id="bot-tit" className="t-heading">¿Quién invita la próxima <span className="acento">ronda?</span></h2>
          <p className="t-lead" style={{ color: 'var(--c-salvia)', margin: 0 }}>Gira la botella y que decida ella. Usa los nombres de tu mesa o escribe los del parche.</p>
          <div className="opciones" role="group" aria-label="Escoge el reto">
            {RETOS.map((r) => <button key={r} type="button" className="chip" aria-pressed={reto === r} onClick={() => setReto(r)}>{r}</button>)}
          </div>
          {m.nombres.length < 2 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <label htmlFor="bot-nombre" className="sr">Agregar nombre</label>
              <input id="bot-nombre" className="input-noche" placeholder="Escribe un nombre y Enter" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
              <button type="button" className="btn btn-sec btn-sm" onClick={add} style={{ height: 48 }}>Agregar</button>
            </div>
          )}
          <div className="resultado" aria-live="polite">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ambar" onClick={girar} disabled={girando}>{girando ? 'Girando…' : 'Girar la botella'}</button>
              {ganador && <a className="btn btn-sec" href={waLink(msg)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, msg)}><Ico.compartir /> Compartir resultado</a>}
            </div>
            {ganador && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="t-sub" style={{ margin: 0 }}>
                Le toca a <span className="acento">{ganador}</span>: {reto.toLowerCase()}.
              </motion.p>
            )}
            <p className="t-sm" style={{ color: 'var(--c-salvia)', margin: 0 }}>Es un juego: nadie está obligado a tomar. Hay limonada y bebidas calientes para todos.</p>
          </div>
        </div>
        <div className="ruleta">
          {nombres.map((n, i) => {
            const a = (i / nombres.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <span key={i + n} className={`ruleta-nombre ${gana === i ? 'gana' : ''}`} style={{ left: `${50 + Math.cos(a) * 42}%`, top: `${50 + Math.sin(a) * 42}%` }}>{n}</span>
            );
          })}
          <div className="ruleta-botella">
            <svg viewBox="0 0 100 100" style={{ transform: `rotate(${giro}deg)` }} aria-hidden="true">
              <g fill="none" stroke="var(--c-crema)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                <path d="M46 12h8v14c0 4 8 8 8 18v40a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6V44c0-10 8-14 8-18z" />
                <path d="M45 16h10M38 56h24M38 70h24" opacity=".5" />
                <path d="M50 6v6" stroke="var(--c-ambar)" strokeWidth="2.4" />
              </g>
            </svg>
          </div>
          <div key={chispas.current} className={`chispas ${gana != null ? 'on' : ''}`} aria-hidden="true" style={gana != null ? { left: `${50 + Math.cos((gana / nombres.length) * Math.PI * 2 - Math.PI / 2) * 42}%`, top: `${50 + Math.sin((gana / nombres.length) * Math.PI * 2 - Math.PI / 2) * 42}%` } : undefined}>
            {Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ '--a': `${i * 36}deg`, animationDelay: `${(i % 3) * 30}ms` }} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
