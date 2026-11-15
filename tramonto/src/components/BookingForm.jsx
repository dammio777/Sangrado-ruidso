import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { bogotaNow, isBookable, slotsFor, formatDate, holidayName, ymd, MONTHS } from '../lib/time.js';
import { openWhatsApp } from '../lib/whatsapp.js';
import { business } from '../data/site.js';
import { useReducedMotion } from '../hooks/useMedia.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import { MaskWords } from './ui/Reveal.jsx';
import Pending from './ui/Pending.jsx';
import { SunIcon } from './art/Sun.jsx';
import { WhatsAppIcon, Paw } from './art/Illustrations.jsx';

const TYPES = [
  { id: 'reserva', label: 'Reservar mesa', desc: 'Una mesa en la cabaña, al atardecer.' },
  { id: 'domicilio', label: 'Domicilio', desc: 'Tramonto llega a tu casa.' },
  { id: 'celebracion', label: 'Celebración o grupo', desc: 'Cumpleaños, aniversarios, amici.' },
];
const CRAVINGS = ['Pizza', 'Pasta', 'Dolci', 'Cocktails', 'Sorpréndeme'];
const STEPS = ['¿Cómo lo quieres?', '¿Qué se te antoja?', '¿Cuántos, qué día y a qué hora?', '¿A nombre de quién?'];
const SHORT = ['Tipo', 'Antojo', 'Detalles', 'Tú'];
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const fieldCls = 'w-full rounded-[14px] bg-espresso/70 border border-crema/25 text-crema placeholder:text-crema/50 px-4 py-3.5 text-[16px] focus:border-naranja transition-colors';
const optCls = 'relative flex cursor-pointer rounded-[20px] border-[1.5px] border-crema/30 px-5 py-4 transition-colors hover:border-crema/70 has-[:checked]:bg-naranja has-[:checked]:text-espresso has-[:checked]:border-naranja has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-naranja has-[:focus-visible]:outline-offset-2';

function Calendar({ value, onChange }) {
  const today = bogotaNow();
  const [view, setView] = useState({ y: today.y, m: today.m });
  const days = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m - 1, 1)).getUTCDay();
    const lead = (first + 6) % 7;
    const n = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => ymd(view.y, view.m, i + 1))];
  }, [view]);
  const monthIdx = (view.y - today.y) * 12 + (view.m - today.m);
  const shift = (d) => setView((v) => { const t = new Date(Date.UTC(v.y, v.m - 1 + d, 1)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 }; });
  return (
    <div className="rounded-[20px] border border-crema/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => shift(-1)} disabled={monthIdx <= 0} className="w-10 h-10 rounded-full border border-crema/30 disabled:opacity-30" aria-label="Mes anterior">←</button>
        <p className="font-italiana text-[24px] capitalize" aria-live="polite">{MONTHS[view.m - 1]} {view.y}</p>
        <button type="button" onClick={() => shift(1)} disabled={monthIdx >= 3} className="w-10 h-10 rounded-full border border-crema/30 disabled:opacity-30" aria-label="Mes siguiente">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="group" aria-label="Elige el día (jueves a domingo y festivos)">
        {WEEK.map((d, i) => <span key={i} className="t-mono !text-[11px] opacity-70 py-1" aria-hidden="true">{d}</span>)}
        {days.map((d, i) => {
          if (!d) return <span key={i} />;
          const ok = isBookable(d);
          const hol = holidayName(d);
          const sel = value === d;
          return (
            <button key={d} type="button" disabled={!ok} onClick={() => onChange(d)} aria-pressed={sel}
              aria-label={`${formatDate(d)}${hol ? `, festivo: ${hol}` : ''}${ok ? '' : ', no disponible'}`}
              className={`relative aspect-square rounded-full text-[15px] font-bold transition-colors ${sel ? 'bg-naranja text-espresso' : ok ? 'hover:bg-crema/10' : 'opacity-25 line-through cursor-not-allowed font-normal'}`}>
              {+d.slice(8)}
              {hol && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${sel ? 'bg-espresso' : 'bg-dorado'}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] opacity-80 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-dorado inline-block" aria-hidden="true" /> Festivo · abrimos de jueves a domingo y festivos</p>
    </div>
  );
}

function ProgressArc({ step }) {
  const pts = [90, 60, 30, 2].map((a) => {
    const r = (a * Math.PI) / 180;
    return { x: 150 + Math.cos(r) * 130, y: 128 - Math.sin(r) * 110 };
  });
  return (
    <div className="relative w-full max-w-[320px]" aria-hidden="true">
      <svg viewBox="0 0 300 150" className="w-full overflow-visible">
        <path d="M20 128 A 130 110 0 0 1 280 128" fill="none" stroke="#FFF8EE" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="3 6" />
        <line x1="0" y1="128" x2="300" y2="128" stroke="#FFF8EE" strokeOpacity=".4" strokeWidth="1.5" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={i <= step ? '#F6B547' : '#FFF8EE'} fillOpacity={i <= step ? 1 : 0.3} />)}
        <motion.g animate={{ x: pts[step].x, y: pts[step].y }} initial={false} transition={{ type: 'spring', stiffness: 90, damping: 16 }}>
          <circle r="22" fill="#F6B547" opacity=".3" />
          <circle r="13" fill="#EB7126" stroke="#FFF8EE" strokeWidth="2.5" />
        </motion.g>
      </svg>
      <div className="flex justify-between t-mono !text-[10px] mt-1">
        {SHORT.map((s, i) => <span key={s} className={i === step ? 'text-dorado' : 'opacity-60'}>{s}</span>)}
      </div>
    </div>
  );
}

/** 14 — Formulario de reserva o pedido (multi-step) que arma el mensaje de WhatsApp. */
export default function BookingForm() {
  const rm = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState('');
  const [data, setData] = useState({ type: '', cravings: [], people: 2, date: '', time: '', dog: '', name: '', address: '', notes: '' });
  const headRef = useRef(null);
  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); setError(''); };
  const delivery = data.type === 'domicilio';

  useEffect(() => {
    const on = (e) => { setData((d) => ({ ...d, type: e.detail })); setStep(0); setError(''); };
    window.addEventListener('booking:type', on);
    return () => window.removeEventListener('booking:type', on);
  }, []);

  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } headRef.current?.focus({ preventScroll: true }); }, [step]);

  const validate = () => {
    if (step === 0 && !data.type) return 'Elige cómo lo quieres.';
    if (step === 1 && !data.cravings.length) return 'Cuéntanos qué se te antoja (puede ser “Sorpréndeme”).';
    if (step === 2) {
      if (!data.date) return 'Elige un día: abrimos de jueves a domingo y festivos.';
      if (!data.time) return 'Elige una hora.';
      if (!delivery && !data.dog) return 'Cuéntanos si vienes con tu perro.';
    }
    if (step === 3) {
      if (!data.name.trim()) return 'Escribe tu nombre.';
      if (delivery && !data.address.trim()) return 'Escribe tu dirección o barrio para el domicilio.';
    }
    return '';
  };
  const go = (d) => {
    if (d > 0) { const e = validate(); if (e) { setError(e); return; } }
    setError(''); setDir(d); setStep((s) => Math.max(0, Math.min(3, s + d)));
  };

  const message = () => {
    const intro = { reserva: 'Quiero reservar una mesa.', domicilio: 'Quiero pedir un domicilio.', celebracion: 'Quiero organizar una celebración / grupo.' }[data.type];
    const lines = [
      'Buonasera Tramonto! 🌅',
      intro,
      '',
      `• Se me antoja: ${data.cravings.join(', ')}`,
      `• ${delivery ? 'Para' : 'Somos'}: ${data.people} ${data.people === 1 ? 'persona' : 'personas'}`,
      `• Día: ${data.date ? formatDate(data.date) : '—'}${data.date && holidayName(data.date) ? ' (festivo)' : ''}`,
      `• Hora: ${data.time}`,
    ];
    if (!delivery) lines.push(`• ¿Voy con mi perro?: ${data.dog === 'si' ? 'Sí 🐶' : 'No'}`);
    if (delivery) lines.push(`• Dirección / barrio: ${data.address.trim()}`);
    lines.push(`• Nombre: ${data.name.trim()}`);
    if (data.notes.trim()) lines.push(`• Notas: ${data.notes.trim()}`);
    lines.push('', 'Grazie mille!');
    return lines.join('\n');
  };
  const submit = (e) => {
    e.preventDefault();
    if (step < 3) { go(1); return; }
    const err = validate();
    if (err) { setError(err); return; }
    openWhatsApp(message());
  };

  const slots = data.date ? slotsFor(data.date) : [];
  const variants = {
    enter: (d) => ({ x: rm ? 0 : d * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: rm ? 0 : d * -60, opacity: 0 }),
  };

  return (
    <section id="reservar" aria-labelledby="reserva-t" className="on-dark relative z-10 text-crema py-28 md:py-36"
      style={{ background: 'linear-gradient(180deg, #8A2F0C 0%, #5E2210 45%, #3B1D17 100%)' }}>
      <ZigzagEdge color="ladrillo" line="dorado" />
      <div className="container-page grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="t-mono text-dorado mb-4">Reservas y domicilios · 14</p>
          <MaskWords as="h2" id="reserva-t" lines={['Tu mesa', 'al atardecer']} className="t-display text-[clamp(52px,6.4vw,100px)]" />
          <p className="t-lead mt-6 max-w-[440px] opacity-90">Cuatro preguntas y te armamos el mensaje para WhatsApp. Lo envías tú, nosotros te confirmamos.</p>
          <div className="mt-10"><ProgressArc step={step} /></div>
          {!business.whatsapp.number && <div className="mt-6"><Pending dark>Poner número real de WhatsApp</Pending></div>}
        </div>

        <form onSubmit={submit} noValidate className="lg:col-span-7 rounded-[28px] bg-cacao/90 border border-crema/10 shadow-[var(--shadow-lg)] p-6 md:p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <p className="t-mono text-dorado">Paso {step + 1} de 4</p>
            <div className="flex gap-1.5" aria-hidden="true">
              {STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-naranja' : 'w-4 bg-crema/25'}`} />)}
            </div>
          </div>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.fieldset key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="min-h-[360px]">
              <legend ref={headRef} tabIndex={-1} className="font-italiana text-[clamp(32px,3.4vw,44px)] leading-[1.05] mb-6 outline-none">{STEPS[step]}</legend>

              {step === 0 && (
                <div className="grid gap-3">
                  {TYPES.map((t) => (
                    <label key={t.id} className={optCls}>
                      <input type="radio" name="type" value={t.id} checked={data.type === t.id} onChange={() => set('type', t.id)} className="sr-only" />
                      <span className="flex items-center gap-4">
                        <SunIcon className="w-7 h-7 shrink-0" />
                        <span><span className="block font-bold text-[18px]">{t.label}</span><span className="block text-[14px] opacity-85">{t.desc}</span></span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-wrap gap-3" role="group" aria-label="Lo que se te antoja">
                  {CRAVINGS.map((c) => {
                    const on = data.cravings.includes(c);
                    return (
                      <button key={c} type="button" aria-pressed={on} className="chip chip-night !min-h-[52px] !px-6 !text-[17px]"
                        onClick={() => set('cravings', on ? data.cravings.filter((x) => x !== c) : [...data.cravings, c])}>
                        {on ? '✓ ' : ''}{c}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <p className="t-mono mb-3" id="people-l">{delivery ? '¿Para cuántos?' : '¿Cuántos son?'}</p>
                      <div className="flex items-center gap-4" role="group" aria-labelledby="people-l">
                        <button type="button" onClick={() => set('people', Math.max(1, data.people - 1))} className="w-12 h-12 rounded-full border border-crema/40 text-[22px]" aria-label="Menos personas">−</button>
                        <output className="font-italiana text-[52px] leading-none w-16 text-center tabular-nums" aria-live="polite">{data.people}</output>
                        <button type="button" onClick={() => set('people', Math.min(40, data.people + 1))} className="w-12 h-12 rounded-full bg-naranja text-espresso text-[22px]" aria-label="Más personas">+</button>
                      </div>
                    </div>
                    <div>
                      <p className="t-mono mb-3" id="time-l">¿A qué hora?</p>
                      {data.date ? (
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="time-l">
                          {slots.map((s) => (
                            <button key={s} type="button" role="radio" aria-checked={data.time === s} onClick={() => set('time', s)} className="chip chip-night !min-h-[40px] !px-4 !text-[14px] t-mono">{s}</button>
                          ))}
                          {!slots.length && <p className="text-[14px] opacity-80">No quedan horas ese día, elige otro.</p>}
                        </div>
                      ) : <p className="text-[14px] opacity-80">Primero elige el día.</p>}
                    </div>
                    {!delivery && (
                      <div>
                        <p className="t-mono mb-3 flex items-center gap-2" id="dog-l"><Paw className="w-4 h-4" color="#F6B547" /> ¿Vienes con tu perro?</p>
                        <div className="flex gap-2" role="radiogroup" aria-labelledby="dog-l">
                          {[['si', 'Sí, viene'], ['no', 'Esta vez no']].map(([v, l]) => (
                            <button key={v} type="button" role="radio" aria-checked={data.dog === v} onClick={() => set('dog', v)} className="chip chip-night">{l}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Calendar value={data.date} onChange={(d) => { setData((x) => ({ ...x, date: d, time: '' })); setError(''); }} />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5">
                  <label className="block">
                    <span className="t-mono mb-2 block">Tu nombre *</span>
                    <input className={fieldCls} value={data.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" required placeholder="¿Cómo te llamas?" />
                  </label>
                  {delivery && (
                    <label className="block">
                      <span className="t-mono mb-2 block">Dirección o barrio *</span>
                      <input className={fieldCls} value={data.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" required placeholder="Ej: Santa Elena, vereda…" />
                      {business.delivery.pending && <span className="mt-2 inline-block"><Pending dark>Poner zonas de cobertura</Pending></span>}
                    </label>
                  )}
                  <label className="block">
                    <span className="t-mono mb-2 block">Algo más (opcional)</span>
                    <textarea className={`${fieldCls} min-h-[110px] resize-y`} value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder={data.type === 'celebracion' ? 'Cumpleaños, aniversario, decoración…' : 'Alergias, una mesa junto a la ventana…'} />
                  </label>
                  <div className="rounded-[18px] bg-espresso/60 p-4 text-[14px] whitespace-pre-line opacity-90" aria-label="Vista previa del mensaje">
                    <p className="t-mono text-dorado mb-2">Así llegará tu mensaje</p>
                    {message()}
                  </div>
                </div>
              )}
            </motion.fieldset>
          </AnimatePresence>

          <p className="min-h-[24px] mt-4 text-[15px] font-bold text-dorado" role="alert" aria-live="assertive">{error}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(-1)} className={`btn btn-ghost-night ${step === 0 ? 'invisible' : ''}`}>← Atrás</button>
            {step < 3 ? (
              <button type="submit" className="btn btn-orange"><SunIcon className="w-5 h-5" /> Siguiente</button>
            ) : (
              <button type="submit" className="btn btn-orange"><WhatsAppIcon className="w-5 h-5" /> Enviar por WhatsApp</button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
