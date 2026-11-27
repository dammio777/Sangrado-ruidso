import { useEffect, useState } from 'react';
import { ui } from '../lib/store.js';
import { reducido } from '../lib/util.js';

const LETRAS = 'entreverde'.split('');
function yaVisto() {
  try {
    if (sessionStorage.getItem('ev-apertura')) return true;
    sessionStorage.setItem('ev-apertura', '1');
    return false;
  } catch { return true; } // sin almacenamiento (vista previa, miniatura): sin apertura
}

/* Máx. 2 s, solo la primera visita de la sesión. Nunca bloquea el scroll:
   si el usuario hace scroll, toca o presiona una tecla, se acelera y sale en 250 ms. */
export default function Apertura() {
  const [fase, setFase] = useState(() => (yaVisto() ? 'fuera' : reducido() ? 'fundido' : 'corre'));

  useEffect(() => {
    if (fase === 'fuera') { ui.set((u) => ({ ...u, apertura: 'lista' })); return; }
    const timers = [];
    const terminar = (rapido) => {
      ui.set((u) => ({ ...u, apertura: 'lista' }));
      setFase(rapido ? 'rapido' : 'saliendo');
      timers.push(setTimeout(() => setFase('fuera'), 260));
    };
    if (fase === 'fundido') { timers.push(setTimeout(() => terminar(false), 40)); return () => timers.forEach(clearTimeout); }
    if (fase !== 'corre') return;
    timers.push(setTimeout(() => terminar(false), 1780));
    const saltar = () => terminar(true);
    const ev = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    ev.forEach((e) => addEventListener(e, saltar, { passive: true, once: true }));
    return () => { timers.forEach(clearTimeout); ev.forEach((e) => removeEventListener(e, saltar)); };
  }, [fase]);

  if (fase === 'fuera') return null;
  const mid = (LETRAS.length - 1) / 2;
  return (
    <div className={`ap ${fase === 'saliendo' || fase === 'rapido' ? 'salir' : ''} ${fase === 'rapido' ? 'rapido' : ''}`} aria-hidden="true" style={fase === 'fundido' ? { animation: 'none' } : undefined}>
      <div className="ap-centro">
        <div className="ap-circ">
          <svg viewBox="0 0 64 64">
            <path className="ap-e" pathLength="1" d="M20.5 36h23c0-7.6-4.8-12.4-11.3-12.4-6.9 0-11.7 5.4-11.7 12.4 0 7.3 5 12.4 12 12.4 4.4 0 7.6-1.8 9.8-5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            <path className="ap-hoja" d="M29.5 12.5c4.6.6 7.6 3.4 8.4 7.6-4.5-.4-7.6-3.3-8.4-7.6z" fill="#fff" />
          </svg>
          <span className="ap-ola" />
        </div>
        <div className="ap-word">
          {LETRAS.map((l, i) => <span key={i} style={{ '--d': mid - i, '--i': i }}>{l}</span>)}
        </div>
        <span className="ap-volv">volvimos</span>
        <div className="ap-copas">
          <svg className="ap-copa izq" viewBox="0 0 44 62" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 4h28l-2 16a12 12 0 0 1-24 0zM22 32v24M13 58h18M10 12h24" /></svg>
          <svg className="ap-copa der" viewBox="0 0 44 62" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 4h28l-2 16a12 12 0 0 1-24 0zM22 32v24M13 58h18M10 12h24" /></svg>
          <svg className="ap-clin" viewBox="0 0 34 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 2v7M6 6l4 5M28 6l-4 5" /></svg>
        </div>
      </div>
    </div>
  );
}
