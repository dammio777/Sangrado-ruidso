import { useEffect, useState } from 'react';
import { business, schedule } from '../data/site.js';
import { openStatus } from '../lib/time.js';
import { waHref, waClick } from '../lib/whatsapp.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords, FadeUp } from './ui/Reveal.jsx';
import Pending from './ui/Pending.jsx';
import Sun, { SunIcon } from './art/Sun.jsx';
import { WhatsAppIcon, MountainArt } from './art/Illustrations.jsx';

const ROWS = [
  { d: 'Lunes a miércoles', h: null },
  { d: 'Jueves', h: schedule.days[4] },
  { d: 'Viernes', h: schedule.days[5] },
  { d: 'Sábado', h: schedule.days[6] },
  { d: 'Domingo', h: schedule.days[0] },
  { d: 'Festivos', h: schedule.holiday },
];

export function useOpenStatus() {
  const [s, setS] = useState(() => openStatus());
  useEffect(() => { const t = setInterval(() => setS(openStatus()), 60000); return () => clearInterval(t); }, []);
  return s;
}

export function LiveBadge({ className = '' }) {
  const s = useOpenStatus();
  return (
    <div className={`inline-flex items-center gap-3 rounded-full px-4 py-2 ${s.open ? 'bg-espresso text-crema' : 'bg-durazno text-espresso'} ${className}`} role="status" aria-live="polite">
      <span className="relative flex w-3 h-3">
        {s.open && <span className="absolute inset-0 rounded-full bg-dorado" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />}
        <span className={`relative w-3 h-3 rounded-full ${s.open ? 'bg-dorado' : 'bg-teja'}`} />
      </span>
      <span className="t-mono !text-[12px] font-medium">{s.open ? 'Aperto ora' : 'Chiuso'}</span>
      <span className="text-[13px] opacity-90 hidden sm:inline">· {s.detail}</span>
    </div>
  );
}

/** Biglietto: boleto de tren italiano con el horario y el estado en vivo. */
function Biglietto() {
  const s = useOpenStatus();
  return (
    <div className="relative grid grid-cols-[1fr_auto] bg-crema text-espresso rounded-[24px] shadow-[var(--shadow-lg)] overflow-hidden">
      <div className="p-5 sm:p-6 md:p-8 min-w-0">
        <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-terracota/40 pb-4">
          <p className="t-mono !text-[11px] md:!text-[12px]">Biglietto · Santa Elena → Tramonto</p>
          <span className="t-mono !text-[11px] text-teja hidden sm:inline">N° 0017</span>
        </div>
        <div className="mt-5">
          <p className="t-mono !text-[11px] text-teja">Dirección</p>
          <p className="font-bold text-[17px] mt-1">{business.address.line}</p>
          <p className="text-[14px] text-espresso/80">{business.address.area}</p>
          {business.address.pending && <div className="mt-2"><Pending>Poner dirección exacta</Pending></div>}
        </div>
        <table className="w-full mt-6 text-[14px]">
          <caption className="sr-only">Horario de atención</caption>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.d} className="border-b border-espresso/10 last:border-0">
                <th scope="row" className="text-left font-medium py-2">{r.d}</th>
                <td className="text-right t-mono !text-[12px] sm:!text-[13px] py-2 whitespace-nowrap">{r.h ? `${r.h.open} – ${r.h.close}` : <span className="text-teja">Cerrado</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {schedule.pending && <div className="mt-3"><Pending>Horas de ejemplo · poner horas reales</Pending></div>}
        <div className="mt-6"><LiveBadge /></div>
        {!s.open && <p className="sr-only">{s.detail}</p>}
      </div>
      {/* talón */}
      <div className="relative w-[58px] sm:w-[78px] md:w-[110px] bg-naranja flex flex-col items-center justify-between py-6 border-l-2 border-dashed border-espresso/30">
        <span aria-hidden="true" className="absolute -left-[13px] -top-[13px] w-[26px] h-[26px] rounded-full bg-rojo" />
        <span aria-hidden="true" className="absolute -left-[13px] -bottom-[13px] w-[26px] h-[26px] rounded-full bg-rojo" />
        <Sun className="w-12 h-12 md:w-16 md:h-16" />
        <p className="t-mono !text-[11px] [writing-mode:vertical-rl] rotate-180">Andata · Ore 17:00 · Posto amici</p>
      </div>
    </div>
  );
}

/** 12 — Ubicación y horarios. */
export default function Location() {
  const q = encodeURIComponent(business.mapsQuery);
  const msg = 'Buonasera Tramonto! ¿Cómo llego hasta ustedes?';
  return (
    <section id="visitanos" aria-labelledby="visita-t" className="on-dark relative z-10 bg-rojo py-28 md:py-36">
      <ZigzagEdge color="rojo" line="dorado" />
      <div className="container-page grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="t-mono inline-flex items-center gap-2 rounded-full bg-espresso text-crema px-4 py-2 mb-6"><SunIcon className="w-4 h-4" /> Visítanos · 12</p>
          <MaskWords as="h2" id="visita-t" lines={['Sube a ver', 'el atardecer.']} className="t-display text-crema text-[clamp(52px,7vw,108px)]" />
          <FadeUp className="mt-10"><Biglietto /></FadeUp>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-orange" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer">
              <SunIcon className="w-5 h-5" /> Cómo llegar
            </a>
            <a className="btn btn-dark" href={waHref(msg)} onClick={waClick(msg)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="w-5 h-5" /> Escríbenos
            </a>
          </div>
        </div>
        <FadeUp className="relative">
          <div className="relative rounded-[40px] overflow-hidden border-2 border-crema shadow-[var(--shadow-lg)] aspect-[4/5] lg:aspect-[4/5] max-h-[78vh] bg-mandarina">
            {/* respaldo mientras carga (o si el mapa no carga) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8" aria-hidden="true">
              <div className="w-[60%] max-w-[280px]"><MountainArt /></div>
              <p className="font-italiana text-[32px] mt-2">Santa Elena · Medellín</p>
              <p className="t-mono mt-2">Cargando el mapa…</p>
            </div>
            <iframe title="Mapa: Tramonto di Santa Elena, Santa Elena, Medellín" src={`https://www.google.com/maps?q=${q}&output=embed`}
              className="absolute inset-0 w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, filter: 'sepia(.45) saturate(1.35) hue-rotate(-12deg) contrast(1.02) brightness(1.02)' }} />
            <div className="absolute inset-0 pointer-events-none rounded-[40px]" style={{ boxShadow: 'inset 0 0 0 10px rgba(235,113,38,.25)' }} />
          </div>
          <p className="t-script absolute -bottom-8 right-6 rotate-[-4deg] text-crema !text-[38px]">ci vediamo lassù</p>
        </FadeUp>
      </div>
    </section>
  );
}
