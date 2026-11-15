import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, isFinePointer } from '../lib/motion.js';
import { waHref, waClick } from '../lib/whatsapp.js';
import { WhatsAppIcon } from './art/Illustrations.jsx';

const MSG = 'Buonasera Tramonto! ¿Reservamos? Quiero una mesa.';

/** Botón flotante de WhatsApp con pulso cada 6 s y tooltip "¿Reservamos?". */
export function WhatsAppFab() {
  const [tip, setTip] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setTip(true), 9000);
    const b = setTimeout(() => setTip(false), 13500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <a href={waHref(MSG)} onClick={waClick(MSG)} target="_blank" rel="noopener noreferrer" aria-label="¿Reservamos? Escríbenos por WhatsApp"
      onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} onFocus={() => setTip(true)} onBlur={() => setTip(false)}
      className="group fixed bottom-5 right-5 z-40 w-[62px] h-[62px] rounded-full bg-naranja text-espresso flex items-center justify-center shadow-[var(--shadow-lg)] border-2 border-espresso">
      <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-naranja" style={{ animation: 'pulse-ring 6s ease-out infinite' }} />
      <WhatsAppIcon className="w-7 h-7" />
      <span aria-hidden="true"
        className={`absolute right-[76px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-espresso text-crema px-4 py-2 text-[14px] font-bold shadow-[var(--shadow-md)] transition-all duration-500 ${tip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'}`}>
        ¿Reservamos?
      </span>
    </a>
  );
}

/** Cursor personalizado (solo desktop con puntero fino). Se agranda sobre enlaces y dice "VER" sobre fotos. */
export function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isFinePointer() && !prefersReducedMotion()); }, []);
  useEffect(() => {
    if (!on) return;
    document.documentElement.classList.add('has-custom-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });
    let state = '';
    const move = (e) => {
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      const t = e.target instanceof Element ? e.target : null;
      const next = t?.closest('[data-cursor="ver"]') ? 'ver' : t?.closest('a, button, [role="tab"], label, select, summary') ? 'link' : t?.closest('input, textarea, iframe') ? 'hide' : '';
      if (next !== state) { state = next; ring.current.dataset.state = state; dot.current.dataset.state = state; }
    };
    const leave = () => { gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 }); };
    const enter = () => { gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 }); };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, [on]);
  if (!on) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true"><span>Ver</span></div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

/** Aviso breve (por ejemplo: "copiamos tu mensaje"). */
export function Toast() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let t;
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg(''), 4500); };
    window.addEventListener('toast', on);
    return () => { window.removeEventListener('toast', on); clearTimeout(t); };
  }, []);
  return (
    <div role="status" aria-live="polite" className={`fixed left-1/2 bottom-6 z-[95] -translate-x-1/2 max-w-[90vw] rounded-full bg-espresso text-crema px-5 py-3 text-[14px] font-bold shadow-[var(--shadow-lg)] transition-all duration-500 ${msg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      {msg}
    </div>
  );
}
