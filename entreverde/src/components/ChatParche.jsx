import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ico, Mono } from './ui.jsx';
import { usePestana, useReduced, useVisible, SPRING_POP } from '../lib/motion.js';

/* Ventana de chat "El parche". No es modal: no oscurece, no atrapa el foco, no bloquea el scroll.
   Una burbuja a la vez: 900 ms de "escribiendo…" + pop de 250 ms. Se pausa fuera de pantalla. */
export default function ChatParche({
  guion, titulo = 'El parche 🍃', autoplay = true, iniciar = true, estatico = false,
  onAccion, onMin, onCerrar, mini = false, className = '', glass = false, pie = true, pieTexto = '',
}) {
  const ref = useRef(null);
  const cuerpo = useRef(null);
  const reduced = useReduced();
  const visible = useVisible(ref, { threshold: 0.25 });
  const pestana = usePestana();
  const completo = estatico || reduced;
  const [n, setN] = useState(completo ? guion.length : 0);
  const [escribe, setEscribe] = useState(null);
  const corriendo = autoplay && iniciar && visible && pestana && !completo && n < guion.length;

  useEffect(() => { if (completo) setN(guion.length); }, [completo, guion.length]);

  useEffect(() => {
    if (!corriendo) { setEscribe(null); return; }
    const m = guion[n];
    const ts = [];
    if (m.de === 'sistema') {
      ts.push(setTimeout(() => setN((x) => x + 1), 650));
    } else {
      ts.push(setTimeout(() => setEscribe(m.de), n === 0 ? 200 : 320));
      ts.push(setTimeout(() => { setEscribe(null); setN((x) => x + 1); }, (n === 0 ? 200 : 320) + 900));
    }
    return () => ts.forEach(clearTimeout);
  }, [corriendo, n]);

  useEffect(() => {
    const el = cuerpo.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [n, escribe]);

  const nombre = guion.find((m) => m.de === 'juli')?.quien || 'Juli';
  const subt = escribe === 'juli' ? `${nombre} está escribiendo…` : escribe === 'tu' ? 'escribiendo…' : 'en línea';

  return (
    <div ref={ref} className={`chat ${mini ? 'mini' : ''} ${glass ? 'glass-light' : ''} ${className}`} role="region" aria-label={`Conversación: ${titulo}`}>
      <div className="chat-cab">
        <span className="chat-av"><Mono /></span>
        <div>
          <div className="chat-tit">{titulo}</div>
          <div className="chat-subt" aria-hidden="true">{subt}</div>
        </div>
        {(onMin || onCerrar) && (
          <div className="chat-acc">
            {onMin && <button type="button" onClick={onMin} aria-label="Minimizar chat"><Ico.min /></button>}
            {onCerrar && <button type="button" onClick={onCerrar} aria-label="Cerrar chat"><Ico.x width="18" height="18" /></button>}
          </div>
        )}
      </div>
      <div className="chat-cuerpo" ref={cuerpo} data-lenis-prevent>
        <div className="chat-lista" aria-live="polite" aria-relevant="additions">
          <AnimatePresence initial={!completo}>
            {guion.slice(0, n).map((m, i) =>
              m.de === 'sistema' ? (
                <motion.div key={i} className="sistema" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING_POP}>
                  <span className="pill">{m.texto}</span>
                  {m.accion && onAccion && (
                    <button type="button" className="btn btn-pri btn-sm" onClick={() => onAccion(m.accion)}>
                      <Ico.mesa /> Unirme a la mesa
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div key={i} className={`burbuja ${m.de === 'tu' ? 'env' : 'rec'}`} initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={SPRING_POP}>
                  {m.de !== 'tu' && <div className="quien">{m.quien || 'Juli'}</div>}
                  {m.texto}
                  {m.de === 'tu' && <span className="chk" aria-label="Leído">✓✓</span>}
                </motion.div>
              ),
            )}
            {escribe && (
              <motion.div key={`esc-${n}`} className={`escribe ${escribe === 'tu' ? 'env' : 'rec'}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.08 } }} transition={SPRING_POP} aria-hidden="true">
                <i /><i /><i />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {pie && !estatico && (
        <div className="chat-pie">
          {n < guion.length ? (
            <button type="button" onClick={() => setN(guion.length)}>Leer la conversación completa</button>
          ) : <span className="muted">{pieTexto}</span>}
          <button type="button" onClick={() => setN(0)} aria-label="Repetir la conversación" title="Repetir"><Ico.re /></button>
        </div>
      )}
    </div>
  );
}
