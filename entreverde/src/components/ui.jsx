import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FOTOS, CONFIG } from '../data.js';
import { fotoSet, fotoSrc } from '../lib/util.js';
import { useReveal } from '../lib/motion.js';

/* ---------- Monograma "è" (trazo + hoja) ---------- */
export function Mono({ className, title, trazo = 2.6 }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M20.5 36h23c0-7.6-4.8-12.4-11.3-12.4-6.9 0-11.7 5.4-11.7 12.4 0 7.3 5 12.4 12 12.4 4.4 0 7.6-1.8 9.8-5" fill="none" stroke="currentColor" strokeWidth={trazo} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29.5 12.5c4.6.6 7.6 3.4 8.4 7.6-4.5-.4-7.6-3.3-8.4-7.6z" fill="currentColor" />
    </svg>
  );
}
export function LogoCirculo({ size = 40, className = '' }) {
  return (
    <span className={`logo-circ ${className}`} style={{ width: size, height: size }}>
      <Mono />
    </span>
  );
}

/* ---------- Íconos de línea ---------- */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const Ico = {
  mas: (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...p}><path d="M12 5v14M5 12h14" {...P} strokeWidth="2.2" /></svg>,
  menos: (p) => <svg viewBox="0 0 24 24" width="20" height="20" {...p}><path d="M5 12h14" {...P} strokeWidth="2.2" /></svg>,
  x: (p) => <svg viewBox="0 0 24 24" width="20" height="20" {...p}><path d="M6 6l12 12M18 6 6 18" {...P} strokeWidth="2" /></svg>,
  min: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M6 12h12" {...P} strokeWidth="2.2" /></svg>,
  re: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" {...P} /></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width="14" height="14" {...p}><path d="m5 12.5 4.5 4.5L19 7" {...P} strokeWidth="2.6" /></svg>,
  hoja: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7" {...P} /></svg>,
  fuego: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.2 2 1.2 3 2.3 3.3C10.5 8 12 5 14 3c.3 3.4 5 6 5 11.5C19 18.3 16 21 12 21z" {...P} /></svg>,
  moto: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><circle cx="6" cy="17" r="3" {...P} /><circle cx="18" cy="17" r="3" {...P} /><path d="M6 17h6l3-6h3M9 8h3l3 3M15 11l-2-4h-2" {...P} /></svg>,
  wa: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z" {...P} /><path d="M9.2 9.3c.3 2 1.7 3.9 4 4.9l1-1.1 1.6.8c-.2 1-1 1.6-2 1.6-3 0-6-3-6-6 0-1 .6-1.8 1.6-2l.8 1.6z" fill="currentColor" stroke="none" /></svg>,
  compartir: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" {...P} /></svg>,
  mapa: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M12 21s-6.5-5.7-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.3-6.5 11-6.5 11z" {...P} /><circle cx="12" cy="10" r="2.4" {...P} /></svg>,
  reloj: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><circle cx="12" cy="12" r="8.5" {...P} /><path d="M12 7.5V12l3 2" {...P} /></svg>,
  mesa: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><circle cx="12" cy="12" r="5" {...P} /><circle cx="12" cy="3.5" r="1.6" {...P} /><circle cx="12" cy="20.5" r="1.6" {...P} /><circle cx="3.5" cy="12" r="1.6" {...P} /><circle cx="20.5" cy="12" r="1.6" {...P} /></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...p}><path d="M4 8h16M4 16h16" {...P} strokeWidth="2" /></svg>,
  izq: (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...p}><path d="M15 5 8 12l7 7" {...P} strokeWidth="2" /></svg>,
  der: (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...p}><path d="m9 5 7 7-7 7" {...P} strokeWidth="2" /></svg>,
  dado: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><rect x="4" y="4" width="16" height="16" rx="4" {...P} /><circle cx="9" cy="9" r="1.2" fill="currentColor" /><circle cx="15" cy="15" r="1.2" fill="currentColor" /><circle cx="15" cy="9" r="1.2" fill="currentColor" /><circle cx="9" cy="15" r="1.2" fill="currentColor" /></svg>,
  copiar: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><rect x="8" y="8" width="12" height="12" rx="3" {...P} /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" {...P} /></svg>,
  insta: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><rect x="4" y="4" width="16" height="16" rx="5" {...P} /><circle cx="12" cy="12" r="3.6" {...P} /><circle cx="17" cy="7" r="1" fill="currentColor" /></svg>,
  auto: (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...p}><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M5 11h14" {...P} /><circle cx="8" cy="13.5" r=".8" fill="currentColor" /><circle cx="16" cy="13.5" r=".8" fill="currentColor" /></svg>,
};

/* ---------- Foto: lee el arreglo central FOTOS; placeholder si no hay `src` ---------- */
export function Foto({ id, sizes = '100vw', className = '', imgClass = '', prioridad = false, alt, style, imgRef }) {
  const f = FOTOS[id];
  if (!f || !f.src) return <Placeholder className={className} style={style} icono={f?.icono} />;
  return (
    <img
      ref={imgRef}
      src={fotoSrc(id, 1080)}
      srcSet={fotoSet(id)}
      sizes={sizes}
      width={f.w}
      height={f.h}
      alt={alt ?? f.alt}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding={prioridad ? 'sync' : 'async'}
      fetchpriority={prioridad ? 'high' : undefined}
      className={`${className} ${imgClass}`}
      style={style}
      draggable="false"
    />
  );
}
/* Íconos de línea como los de los pendones de la carta del local */
const L = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const IcoCarta = {
  hamburguesa: <g {...L}><path d="M12 30c0-9 9-15 20-15s20 6 20 15z" /><path d="M24 22h.01M32 20h.01M40 22h.01" strokeWidth="3" /><path d="M10 36c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3 4-3 4-3" /><path d="M11 43h42" /><path d="M12 48h40v2a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5z" /></g>,
  perro: <g {...L}><path d="M10 34c0-6 6-9 22-9s22 3 22 9-6 13-22 13-22-7-22-13z" /><path d="M8 32c0-4 6-6 24-6s24 2 24 6" /><path d="M14 33l4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3" /></g>,
  bowl: <g {...L}><path d="M8 32h48a24 24 0 0 1-48 0z" /><path d="M14 32c2-6 6-9 10-8 2-4 8-5 11-1 4-3 10-1 11 3 3 0 5 3 5 6" /><path d="M24 50h16" /><circle cx="22" cy="28" r="1" /><circle cx="36" cy="27" r="1" /><circle cx="44" cy="30" r="1" /></g>,
  papas: <g {...L}><path d="M16 26h32l-4 28H20z" /><path d="M20 26l-2-14M26 26l1-16M32 26l-1-14M38 26l2-15M44 26l3-12" /><path d="M24 40h16" /></g>,
  plancha: <g {...L}><circle cx="28" cy="34" r="16" /><path d="M44 34h14" /><path d="M20 28l12 12M18 34l10 10M24 24l12 12M30 22l8 8" /></g>,
  cerveza: <g {...L}><path d="M16 22h26v30a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" /><path d="M42 28h5a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-5" /><path d="M16 22c0-5 3-8 7-8 2-3 7-3 9 0 4-1 9 1 10 8" /><path d="M23 30v18M29 30v18M35 30v18" /></g>,
  coctel: <g {...L}><path d="M12 14h40L32 36z" /><path d="M32 36v18M22 56h20" /><circle cx="46" cy="14" r="6" /><path d="M18 20h28" /></g>,
  vino: <g {...L}><path d="M22 8h20v12a10 10 0 0 1-20 0z" /><path d="M32 30v22M22 56h20" /><path d="M23 16h18" /></g>,
  taza: <g {...L}><path d="M12 28h32v12a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12z" /><path d="M44 31h4a5 5 0 0 1 0 10h-4" /><path d="M8 56h44" /><path d="M22 22c-2-3 2-5 0-8M30 22c-2-3 2-5 0-8M38 22c-2-3 2-5 0-8" /></g>,
  gente: <g {...L}><circle cx="22" cy="22" r="7" /><circle cx="42" cy="22" r="7" /><path d="M8 52c0-9 6-15 14-15s14 6 14 15" /><path d="M30 41c2-3 7-4 12-4 8 0 14 6 14 15" /></g>,
};

export function Placeholder({ className = '', style, texto = 'Foto próximamente', icono }) {
  return (
    <div className={`ph ${className}`} style={style} role="img" aria-label={texto}>
      <div className="ph-in">
        {icono && IcoCarta[icono] ? <svg viewBox="0 0 64 64" className="ph-ico" aria-hidden="true">{IcoCarta[icono]}</svg> : <Mono />}
        <span>{texto}</span>
      </div>
    </div>
  );
}

export function Ejemplo({ children = 'ejemplo', title = 'Dato de ejemplo, por confirmar con Entreverde' }) {
  if (!CONFIG.marcasEjemplo) return null;
  return <span className="ej" title={title}>{children}</span>;
}

export function Stepper({ valor, onMenos, onMas, etiqueta = 'Cantidad', sm, min = 0, max = 30, className = '' }) {
  return (
    <div className={`stepper ${sm ? 'sm' : ''} ${className}`} role="group" aria-label={etiqueta}>
      <button type="button" onClick={onMenos} aria-label="Quitar uno" disabled={valor <= min}><Ico.menos /></button>
      <span className="v" aria-live="polite">{valor}</span>
      <button type="button" onClick={onMas} aria-label="Agregar uno" disabled={valor >= max}><Ico.mas /></button>
    </div>
  );
}

/* Selector segmentado con indicador animado (layout) */
export function Seg({ opciones, valor, onChange, grupo, className = 'seg' }) {
  return (
    <div className={className} role="group">
      {opciones.map((o) => (
        <button key={o.id} type="button" aria-pressed={valor === o.id} onClick={() => onChange(o.id)}>
          {valor === o.id && <motion.span layoutId={`seg-${grupo}`} className="ind" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <span style={{ position: 'relative' }}>{o.nombre}</span>
        </button>
      ))}
    </div>
  );
}

export function Reveal({ as: Tag = 'div', children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} {...rest}>{children}</Tag>;
}

/* ---------- Atrapar el foco en paneles y modales ---------- */
export function useFocusTrap(ref, activo, onCerrar) {
  useEffect(() => {
    if (!activo) return;
    const prev = document.activeElement;
    const el = ref.current;
    const sel = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const t = setTimeout(() => { const f = el?.querySelector('[data-autofocus]') || el?.querySelector(sel); f?.focus({ preventScroll: true }); }, 60);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCerrar?.(); return; }
      if (e.key !== 'Tab' || !el) return;
      const fs = [...el.querySelectorAll(sel)].filter((n) => n.offsetParent !== null);
      if (!fs.length) return;
      const a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); prev?.focus?.({ preventScroll: true }); };
  }, [activo]);
}

export function useAutoRef() { return useRef(null); }
