import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatParche from './ChatParche.jsx';
import { Foto, Ico } from './ui.jsx';
import { CHAT_HERO } from '../data.js';
import { ui, uiAcc, useStore } from '../lib/store.js';
import { respuestaChat } from '../lib/horario.js';
import { irA } from '../lib/scroll.js';
import { useMedia, useReduced } from '../lib/motion.js';
import { useEstado } from './Navbar.jsx';

const PALABRAS = ['Tragos', 'y', 'comida', 'que', 'se'];

export default function Hero() {
  const apertura = useStore(ui, (u) => u.apertura);
  const chat = useStore(ui, (u) => u.chat);
  const lugar = useStore(ui, (u) => u.chatLugar);
  const desk = useMedia('(min-width: 1024px)');
  const reduced = useReduced();
  const e = useEstado();
  const listo = apertura === 'lista';
  const guion = CHAT_HERO.map((m) => (m.texto === '__HORARIO__' ? { ...m, texto: respuestaChat(e) } : m));

  // El chat "salta" 1.2 s después de que termina la apertura.
  useEffect(() => {
    if (!listo || ui.get().chat !== 'oculto') return;
    const t = setTimeout(() => uiAcc.chat('abierto', 'hero'), reduced ? 0 : 1200);
    return () => clearTimeout(t);
  }, [listo]);

  const verChat = chat === 'abierto' && lugar === 'hero';
  const ventana = (
    <AnimatePresence>
      {verChat && (
        <motion.div key="chat" initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} style={{ transformOrigin: desk ? '0% 100%' : '50% 0%' }}>
          <ChatParche
            guion={guion}
            iniciar={verChat}
            onAccion={() => irA('mesa')}
            onMin={() => uiAcc.chat('min')}
            onCerrar={() => uiAcc.chat('cerrado')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section id="inicio" className={`hero ${listo ? 'listo' : ''}`} aria-labelledby="hero-tit">
      <div className={`wrap hero-zoom ${listo ? '' : 'antes'}`}>
        <div className="hero-grid">
          <div>
            <a href="#volvimos" className="hero-nuevo" onClick={(ev) => { ev.preventDefault(); irA('volvimos'); }}>
              <span className="etq-nuevo">Reapertura</span> Volvimos después de un año, con nueva imagen <Ico.der width="16" height="16" />
            </a>
            <h1 id="hero-tit" className="t-display">
              {PALABRAS.map((w, i) => (
                <span key={i}><span className="w"><span style={{ '--i': i }}>{w}</span></span>{' '}</span>
              ))}
              <span className="w"><span style={{ '--i': 5 }} className="acento">comparten.</span></span>
            </h1>
            <p className="sub t-lead muted">Volvimos a Santa Elena, de camino al parque, con nueva imagen y el plan de siempre: jueves a domingo de 4 p. m. a medianoche, bajo el cielo abierto.</p>
            <div className="hero-btns">
              <button type="button" className="btn btn-pri" onClick={() => uiAcc.abrirPanel('domicilio')}>Armar el pedido</button>
              <button type="button" className="btn btn-sec" onClick={() => uiAcc.abrirPanel('reservar')}>Reservar mesa</button>
            </div>
            <div className="hero-chips">
              <span className="chip"><Ico.hoja /> Al aire libre</span>
              <span className="chip"><Ico.fuego /> Fogata</span>
              <span className="chip"><Ico.moto /> Domicilios en Santa Elena</span>
            </div>
            <div className="hero-chat-slot">{!desk && ventana}</div>
          </div>
          <div className="hero-foto">
            <div className="hero-card">
              <Foto id="lugar-letrero" prioridad sizes="(min-width: 1024px) 560px, 100vw" />
            </div>
            <span className="hero-cap glass-light">Brisa natural y el mejor ambiente</span>
            <div className="hero-chat">{desk && ventana}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
