import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoCirculo, Ico, useFocusTrap } from './ui.jsx';
import { mesa, ui, uiAcc, useStore } from '../lib/store.js';
import { estado, textoEstado } from '../lib/horario.js';
import { irA } from '../lib/scroll.js';

export const LINKS = [
  { id: 'desgranado', nombre: 'Arma tu desgranado', destacado: true },
  { id: 'carta', nombre: 'Carta' },
  { id: 'mesa', nombre: 'Arma la mesa' },
  { id: 'lugar', nombre: 'El lugar' },
  { id: 'visitanos', nombre: 'Visítanos' },
];

export function useEstado() {
  const [e, setE] = useState(() => estado());
  useEffect(() => { const t = setInterval(() => setE(estado()), 60000); return () => clearInterval(t); }, []);
  return e;
}
export function EstadoVivo({ corto = true }) {
  const e = useEstado();
  const t = textoEstado(e);
  return (
    <span className="estado" title={t.largo}>
      <span className={`punto ${e.abierto ? 'vivo' : 'cerrado'}`} aria-hidden="true" />
      <span className="txt">{corto ? t.corto : t.largo}</span>
    </span>
  );
}

export default function Navbar() {
  const [compacta, setCompacta] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [noche, setNoche] = useState(false);
  const platos = useStore(mesa, (m) => m.lineas.reduce((s, l) => s + l.qty, 0));
  const pulso = useStore(ui, (u) => u.pulso);
  const menu = useStore(ui, (u) => u.menu);
  const [pulsa, setPulsa] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let last = scrollY, raf = 0;
    const f = () => {
      raf = 0;
      const y = scrollY, dy = y - last;
      setCompacta(y > 60);
      if (y > 160 && dy > 14) setOculta(true);
      else if (dy < -4 || y < 160) setOculta(false);
      last = y;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(f); };
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  // Cambia a vidrio oscuro cuando pasa sobre secciones de noche.
  useEffect(() => {
    const secs = [...document.querySelectorAll('[data-noche]')];
    const activos = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? activos.add(e.target) : activos.delete(e.target)));
      setNoche(activos.size > 0);
    }, { rootMargin: '-40px 0px -94% 0px' });
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!pulso) return;
    setPulsa(true);
    const t = setTimeout(() => setPulsa(false), 520);
    return () => clearTimeout(t);
  }, [pulso]);

  useFocusTrap(menuRef, menu, () => ui.set((u) => ({ ...u, menu: false })));

  const ir = (e, id) => { e.preventDefault(); ui.set((u) => ({ ...u, menu: false })); setTimeout(() => irA(id), menu ? 260 : 0); };

  return (
    <>
      <a className="salto" href="#contenido">Saltar al contenido</a>
      <header className={`nav ${compacta ? 'compacta' : ''} ${oculta && !menu ? 'oculta' : ''} ${noche ? 'de-noche' : ''}`}>
        <nav className="nav-in" aria-label="Principal">
          <span className={`nav-bg ${noche ? 'glass-dark' : 'glass-light'}`} aria-hidden="true" />
          <a href="#inicio" className="nav-logo nav-izq" onClick={(e) => ir(e, 'inicio')} aria-label="Entreverde, ir al inicio">
            <LogoCirculo size={38} />
            <span className="wordmark">entreverde</span>
          </a>
          <div className="nav-links">
            {LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={l.destacado ? 'destacado' : ''} onClick={(e) => ir(e, l.id)}>{l.nombre}</a>
            ))}
          </div>
          <div className="nav-der">
            <EstadoVivo />
            <button type="button" className={`btn-mesa ${pulsa ? 'pulsa' : ''}`} data-mesa-target="nav" onClick={() => uiAcc.abrirPanel()} aria-label={`Tu mesa, ${platos} platos`}>
              <Ico.mesa /> <span className="lbl">Tu mesa</span> <span className="cnt num">{platos}</span>
            </button>
            <button type="button" className="btn-ico nav-burger" aria-label="Abrir menú" aria-expanded={menu} onClick={() => ui.set((u) => ({ ...u, menu: true }))}><Ico.menu /></button>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div ref={menuRef} className="menu-movil glass-light" role="dialog" aria-modal="true" aria-label="Menú" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <button type="button" className="btn-ico cerrar" aria-label="Cerrar menú" onClick={() => ui.set((u) => ({ ...u, menu: false }))}><Ico.x /></button>
            <nav aria-label="Menú móvil">
              {LINKS.map((l, i) => (
                <motion.a key={l.id} href={`#${l.id}`} onClick={(e) => ir(e, l.id)} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  {l.nombre}
                </motion.a>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <EstadoVivo corto={false} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
