import { useRef } from 'react';
import ChatParche from './ChatParche.jsx';
import { Bombillos } from './TardeNoche.jsx';
import { mesa, uiAcc, useStore } from '../lib/store.js';
import { mensajeInvitar, onCompartir, waLink } from '../lib/util.js';
import { useVisible } from '../lib/motion.js';
import { Ico } from './ui.jsx';

export default function CtaFinal() {
  const ref = useRef(null);
  const visto = useVisible(ref, { threshold: 0.3, once: true });
  const personas = useStore(mesa, (m) => m.personas);
  const conMesa = useStore(mesa, (m) => m.lineas.length > 0);
  const guion = [
    { de: 'juli', texto: conMesa ? 'Ya armé la mesa 🍃' : 'Ya casi armo la mesa 🍃' },
    { de: 'tu', texto: '¿Cuántos vamos?' },
    { de: 'juli', texto: personas > 2 ? `Vamos ${personas} 🙌` : 'Todos 🙌' },
  ];
  const msg = mensajeInvitar();
  return (
    <section ref={ref} className="sec noche cta" data-noche aria-labelledby="cta-tit">
      <Bombillos on={visto} n={17} curva={60} className="bombillos" />
      <div className="wrap" style={{ position: 'relative' }}>
        <h2 id="cta-tit" className="t-heading">¿Quién se <span className="acento">apunta?</span></h2>
        {visto && <ChatParche guion={guion} mini pie={false} className="cta-chat" />}
        <div className="cta-btns">
          <button type="button" className="btn btn-ambar" onClick={() => uiAcc.abrirPanel('reservar')}>Reservar mesa</button>
          <a className="btn btn-glass glass-dark" href={waLink(msg)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, msg)}><Ico.compartir /> Invitar al parche</a>
        </div>
      </div>
    </section>
  );
}
