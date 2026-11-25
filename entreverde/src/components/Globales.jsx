import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatParche from './ChatParche.jsx';
import { Mono } from './ui.jsx';
import { CHAT_HERO } from '../data.js';
import { mesa, ui, uiAcc, useStore } from '../lib/store.js';
import { respuestaChat } from '../lib/horario.js';
import { irA } from '../lib/scroll.js';
import { guardado } from '../lib/store.js';
import { useEstado } from './Navbar.jsx';

/* Botón flotante: círculo oliva con "è" y el número de platos. Abre "Tu mesa" o el chat. */
export function BotonFlotante() {
  const platos = useStore(mesa, (m) => m.lineas.reduce((s, l) => s + l.qty, 0));
  const chat = useStore(ui, (u) => u.chat);
  const lugar = useStore(ui, (u) => u.chatLugar);
  const panel = useStore(ui, (u) => u.panel);
  const pulso = useStore(ui, (u) => u.pulso);
  const [pulsa, setPulsa] = useState(false);
  const e = useEstado();
  useEffect(() => { if (!pulso) return; setPulsa(true); const t = setTimeout(() => setPulsa(false), 520); return () => clearTimeout(t); }, [pulso]);
  const click = () => {
    if (platos > 0) { uiAcc.abrirPanel(); return; }
    const hero = document.getElementById('inicio');
    const heroVisible = hero && hero.getBoundingClientRect().bottom > 120;
    uiAcc.chat(chat === 'abierto' && lugar === 'flotante' ? 'min' : 'abierto', heroVisible ? 'hero' : 'flotante');
  };
  const guion = CHAT_HERO.map((m) => (m.texto === '__HORARIO__' ? { ...m, texto: respuestaChat(e) } : m));
  return (
    <>
      <AnimatePresence>
        {chat === 'abierto' && lugar === 'flotante' && !panel && (
          <motion.div className="chat-flotante" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.18 } }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
            <ChatParche guion={guion} glass onAccion={() => { uiAcc.chat('min'); irA('mesa'); }} onMin={() => uiAcc.chat('min')} onCerrar={() => uiAcc.chat('cerrado')} />
          </motion.div>
        )}
      </AnimatePresence>
      {!panel && (
        <button type="button" className={`fab ${platos === 0 ? 'latir' : ''} ${pulsa ? 'pulsa' : ''}`} data-mesa-target="fab" onClick={click} aria-label={platos ? `Abrir tu mesa, ${platos} platos` : 'Abrir el chat del parche'} style={pulsa ? { animation: 'pulsoMesa .5s var(--ease-out)' } : undefined}>
          <Mono />
          {platos > 0 ? <span className="cnt num">{platos}</span> : chat === 'min' ? <span className="nuevo" aria-hidden="true" /> : null}
          <span className="fab-tip glass-light">¿Armamos la mesa?</span>
        </button>
      )}
    </>
  );
}

export function Toast() {
  const t = useStore(ui, (u) => u.toast);
  const [vis, setVis] = useState(null);
  useEffect(() => {
    if (!t) return;
    setVis(t);
    const x = setTimeout(() => setVis(null), 2400);
    return () => clearTimeout(x);
  }, [t?.id]);
  return (
    <div aria-live="polite" className="sr-live">
      <AnimatePresence>
        {vis && (
          <motion.div key={vis.id} className="toast glass-dark" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            {vis.texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Modo presentación de paletas: ?paleta=a|b|c o ?demo (también #demo). */
const PALETAS = [{ id: 'a', nombre: 'Entreverde', c: '#748457' }, { id: 'b', nombre: 'Noche de luces', c: '#F5A83C' }, { id: 'c', nombre: 'Brisa', c: '#BFD6E2' }];
export function aplicarPaleta(id, animar = true) {
  const f = () => { document.documentElement.dataset.paleta = id; guardado.set('ev-paleta', id); };
  if (animar && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(f);
  else f();
}
export function PaletaDemo() {
  const [p, setP] = useState(() => document.documentElement.dataset.paleta || 'a');
  const q = new URLSearchParams(location.search);
  const demo = q.has('demo') || location.hash === '#demo';
  if (!demo) return null;
  return (
    <div className="demo glass-light" role="group" aria-label="Paletas para presentar">
      <span>Paleta</span>
      {PALETAS.map((x) => (
        <button key={x.id} type="button" aria-pressed={p === x.id} title={x.nombre} aria-label={`Paleta ${x.nombre}`} style={{ background: x.c }} onClick={() => { aplicarPaleta(x.id); setP(x.id); }} />
      ))}
    </div>
  );
}
