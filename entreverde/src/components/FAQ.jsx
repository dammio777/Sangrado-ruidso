import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Foto, Ico, Ejemplo } from './ui.jsx';
import { CONFIG, FAQ as PREGUNTAS } from '../data.js';
import { EstadoVivo } from './Navbar.jsx';
import { waEntreverde } from '../lib/util.js';

/* Acordeón: el contenido aparece con opacidad/transform y los vecinos se reacomodan con
   animación de layout (FLIP por transform), sin animar `height`. */
export default function FAQ() {
  const [abierta, setAbierta] = useState(0);
  return (
    <section className="sec noche faq-sec" data-noche aria-labelledby="faq-tit">
      <div className="wrap faq-grid">
        <div className="titulo-sec faq-tit">
          <span className="eyebrow">Antes de subir</span>
          <h2 id="faq-tit" className="t-heading">Lo que todos <span className="acento">preguntan.</span></h2>
          <p className="muted">¿Algo más? Escríbenos y te respondemos por WhatsApp.</p>
          <div><a className="btn btn-sec" href={waEntreverde('¡Hola Entreverde! 🍃 Tengo una pregunta:')} target="_blank" rel="noopener"><Ico.wa /> Preguntar</a></div>
        </div>
        <LayoutGroup>
          <motion.div layout className="faq-lista">
            {PREGUNTAS.map((p, i) => {
              const on = abierta === i;
              return (
                <motion.div layout key={i} className={`faq-it glass-dark ${on ? 'abierto' : ''}`} transition={{ type: 'spring', stiffness: 320, damping: 34 }} style={{ borderRadius: 24 }}>
                  <motion.h3 layout="position" style={{ margin: 0 }}>
                    <button type="button" className="faq-q" aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setAbierta(on ? null : i)}>
                      {p.q}
                      <span className="faq-mas" aria-hidden="true"><Ico.mas width="18" height="18" /></span>
                    </button>
                  </motion.h3>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div key="a" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-a" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                        <p style={{ margin: 0 }}>{p.a} {p.ajustar && <Ejemplo>ajustar</Ejemplo>}</p>
                        {p.horario && <EstadoVivo corto={false} />}
                        {p.eventos && CONFIG.marca.eventos.map((ev) => (
                          <div key={ev.nombre} style={{ borderRadius: 18, padding: '14px 16px', background: 'rgba(244,241,232,.07)', color: 'var(--c-crema)', display: 'grid', gap: 4 }}>
                            <b>{ev.nombre}</b><span className="t-sm" style={{ color: 'var(--c-salvia)' }}>{ev.cuando} · {ev.detalle}</span>
                          </div>
                        ))}
                        {p.foto && <Foto id={p.foto} sizes="600px" />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
