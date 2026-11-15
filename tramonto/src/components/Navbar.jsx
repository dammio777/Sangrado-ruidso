import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navLinks, business } from '../data/site.js';
import { scrollToId, lockScroll, scrollClock } from '../lib/motion.js';
import { ZigzagStrip } from './ui/Zigzag.jsx';
import Sun, { SunIcon } from './art/Sun.jsx';
import { useReducedMotion } from '../hooks/useMedia.js';

const BASE = import.meta.env.BASE_URL;

export function goBooking(type) {
  window.dispatchEvent(new CustomEvent('booking:type', { detail: type }));
  scrollToId('#reservar', { offset: -20 });
}

function go(e, href, after) {
  e.preventDefault();
  after?.();
  setTimeout(() => scrollToId(href, { offset: href === '#top' ? 0 : -10 }), after ? 380 : 0);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const clockRef = useRef(null);
  const rm = useReducedMotion();
  const night = rm && !scrolled; // con movimiento reducido el hero ya es de noche
  const closeRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    let last = window.scrollY, raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 60);
        if (Math.abs(y - last) > 6) { setHidden(y > last && y > 400); last = y; }
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (clockRef.current) clockRef.current.textContent = scrollClock(max > 0 ? y / max : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { lockScroll(false); window.removeEventListener('keydown', onKey); burgerRef.current?.focus(); };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-500 ease-[var(--ease-sun)]"
        style={{ transform: hidden && !open ? 'translateY(-140%)' : 'none' }}>
        <nav aria-label="Principal"
          className={`relative mx-auto flex items-center justify-between gap-3 transition-[max-width,background-color,padding,box-shadow] duration-500 ${
            scrolled ? 'max-w-[1180px] rounded-full bg-crema/85 backdrop-blur-md shadow-[var(--shadow-sm)] py-2 pl-2 pr-2 md:pr-3' : 'max-w-[1280px] py-2 px-2 md:px-6'
          } ${night ? 'text-crema' : 'text-espresso'}`}>
          <a href="#top" onClick={(e) => go(e, '#top')} className="flex items-center gap-3 shrink-0 rounded-full" aria-label="Tramonto di Santa Elena, ir al inicio">
            <img src={`${BASE}logo-256.webp`} alt="" width="52" height="52" className="w-[52px] h-[52px]" />
            <span className="font-italiana text-[22px] leading-none hidden sm:block">Tramonto</span>
          </a>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)}
                  className="group relative px-4 py-2 font-bold text-[15px] rounded-full">
                  {l.label}
                  <span className="absolute left-4 right-4 bottom-1 h-[1.5px] bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="t-mono hidden xl:inline-flex items-center gap-2 mr-2" aria-hidden="true" title="La hora avanza con el scroll">
              <SunIcon className="w-4 h-4" /> Ore <span ref={clockRef} className="tabular-nums">16:00</span>
            </span>
            <button type="button" onClick={() => goBooking('reserva')} className={`btn btn-sm ${night ? 'btn-orange' : 'btn-dark'}`}>
              <SunIcon className="w-4 h-4" /> Reservar
            </button>
            <button type="button" onClick={() => goBooking('domicilio')} className={`btn btn-sm hidden md:inline-flex ${night ? 'btn-ghost-night' : 'btn-ghost'}`}>Domicilio</button>
            <button ref={burgerRef} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="menu-movil"
              className="lg:hidden w-12 h-12 rounded-full bg-espresso text-crema flex flex-col items-center justify-center gap-[5px]" aria-label="Abrir menú">
              <span className="block w-5 h-[2px] bg-crema rounded" />
              <span className="block w-5 h-[2px] bg-crema rounded" />
            </button>
          </div>

          <div className={`absolute left-10 right-10 -bottom-[5px] transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            <ZigzagStrip color="naranja" height={7} />
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú"
            className="on-dark fixed inset-0 z-[60] bg-espresso text-crema overflow-hidden flex flex-col"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }} animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <Sun spin className="absolute -right-[40vw] -bottom-[30vw] w-[130vw] max-w-none opacity-25 pointer-events-none" />
            <div className="relative flex items-center justify-between p-4">
              <img src={`${BASE}logo-256.webp`} alt="Tramonto di Santa Elena" width="56" height="56" className="w-14 h-14" />
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"
                className="w-12 h-12 rounded-full bg-naranja text-espresso text-2xl leading-none flex items-center justify-center">✕</button>
            </div>
            <nav aria-label="Menú móvil" className="relative flex-1 flex flex-col justify-center px-6">
              <ul>
                {[...navLinks, { label: 'Reservar', href: '#reservar' }].map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.a href={l.href} onClick={(e) => go(e, l.href, () => setOpen(false))}
                      className="block font-italiana text-[clamp(52px,15vw,96px)] leading-[1.02] py-1"
                      initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                      {l.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div className="relative p-6 t-mono text-dorado flex flex-wrap gap-x-6 gap-y-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <span>Jueves a domingo + festivos</span>
              <a href={business.instagram.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{business.instagram.handle}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
