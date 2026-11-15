import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToId } from '../lib/motion.js';
import { business, navLinks, schedule } from '../data/site.js';
import { rng } from '../lib/geometry.js';
import { waHref, waClick } from '../lib/whatsapp.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import Pending from './ui/Pending.jsx';
import Sun from './art/Sun.jsx';
import { WhatsAppIcon } from './art/Illustrations.jsx';
import { LiveBadge } from './Location.jsx';

const BASE = import.meta.env.BASE_URL;
const MSG = 'Buonasera Tramonto! Quiero hacer una reserva.';

/** 15 — Footer: ya es de noche. */
export default function Footer() {
  const ref = useRef(null);
  const stars = useMemo(() => { const r = rng(9); return Array.from({ length: 70 }, () => [r() * 100, r() * 100, 1 + r() * 2, 0.25 + r() * 0.5, -r() * 5]); }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    const t = gsap.fromTo(el.querySelector('[data-fsun]'), { yPercent: 0 }, {
      yPercent: 190, ease: 'none',
      scrollTrigger: { trigger: el.querySelector('[data-word]'), start: 'top 90%', end: 'bottom bottom', scrub: 0.8 },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);

  const go = (e, href) => { e.preventDefault(); scrollToId(href); };

  return (
    <footer ref={ref} className="on-dark relative z-10 bg-espresso text-crema overflow-hidden">
      <ZigzagEdge color="espresso" line="dorado" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {stars.map(([l, t, s, o, d], i) => (
          <span key={i} className="twinkle absolute rounded-full bg-crema" style={{ left: `${l}%`, top: `${t * 0.7}%`, width: s, height: s, '--o': o, '--d': `${3 + (i % 4)}s`, '--delay': `${d}s` }} />
        ))}
      </div>
      <div className="relative container-page pt-28 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <img src={`${BASE}logo-512.webp`} alt="Tramonto di Santa Elena" width="140" height="140" loading="lazy" className="w-[140px] h-[140px]" />
            <p className="t-script text-dorado mt-4 !text-[40px]">Un pedacito de Italia en Santa Elena</p>
            <div className="mt-6"><LiveBadge /></div>
          </div>
          <nav aria-label="Pie de página" className="lg:col-span-2">
            <p className="t-mono text-dorado mb-4">Explora</p>
            <ul className="space-y-2">
              {[...navLinks, { label: 'Reservar', href: '#reservar' }].map((l) => (
                <li key={l.href}><a href={l.href} onClick={(e) => go(e, l.href)} className="hover:text-dorado transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-3">
            <p className="t-mono text-dorado mb-4">Visítanos</p>
            <p>{business.address.line}</p>
            <p className="opacity-80">{business.address.area}</p>
            {business.address.pending && <div className="mt-2"><Pending dark>Dirección</Pending></div>}
            <p className="t-mono text-dorado mt-6 mb-2">Horario</p>
            <p>Jueves a domingo y festivos</p>
            <p className="opacity-80 t-mono !text-[12px] mt-1">Desde las {schedule.days[4].open} · Lun–Mié cerrado</p>
            {schedule.pending && <div className="mt-2"><Pending dark>Horas reales</Pending></div>}
          </div>
          <div className="lg:col-span-3">
            <p className="t-mono text-dorado mb-4">Hablemos</p>
            <a href={business.instagram.url} target="_blank" rel="noopener noreferrer" className="block text-[18px] font-bold hover:text-dorado transition-colors">{business.instagram.handle}</a>
            <p className="opacity-80 text-[14px]">{business.instagram.followers.toLocaleString('es-CO')} amici · {business.instagram.posts} publicaciones</p>
            <a href={waHref(MSG)} onClick={waClick(MSG)} target="_blank" rel="noopener noreferrer" className="btn btn-orange mt-6"><WhatsAppIcon className="w-5 h-5" /> WhatsApp</a>
          </div>
        </div>

        <div data-word className="relative mt-20 overflow-hidden" aria-hidden="true">
          <div data-fsun className="absolute left-1/2 top-0 -translate-x-1/2 w-[13vw] max-w-[180px] min-w-[70px] aspect-square">
            <div className="absolute inset-[-40%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(246,181,71,.55), rgba(246,181,71,0))' }} />
            <Sun spin className="relative w-full h-full" />
          </div>
          <p className="relative font-italiana uppercase text-crema leading-[0.8] text-center whitespace-nowrap pt-[min(9vw,124px)] pb-[1vw]" style={{ fontSize: 'clamp(56px, 16.4vw, 236px)', letterSpacing: '-0.01em' }}>Tramonto</p>
        </div>

        <div className="mt-10 pt-6 border-t border-crema/15 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[13px] opacity-85">
          <p>© 2026 Tramonto di Santa Elena. Comida italiana en el corazón de Santa Elena, Medellín.</p>
          <p className="t-mono !text-[11px]">Buonanotte, amici ✺</p>
        </div>
      </div>
    </footer>
  );
}
