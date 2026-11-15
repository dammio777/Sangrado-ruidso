import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OBRAS, EVENTOS, ARTISTAS, wa } from '../data'
import { Casita } from './LogoIcon'
import { Arrow, WhatsAppIcon } from './Icons'

const OPCIONES = [
  { id: 'visitar', t: 'Visitar la galería', d: 'Agenda tu visita a la casa.' },
  { id: 'comprar', t: 'Comprar una obra', d: 'Pregunta por precio y envío.' },
  { id: 'taller', t: 'Inscribirme a un taller', d: 'Reserva tu cupo.' },
  { id: 'artista', t: 'Soy artista y quiero exponer', d: 'Cuéntanos de tu trabajo.' },
]
const PASOS = ['Qué quieres', 'Detalles', 'Cuándo', 'Contacto']

const campo = 'w-full rounded-2xl border border-canela/25 bg-white px-4 py-3.5 text-tinta placeholder:text-tinta/40 transition-colors focus:border-canela focus:outline-none focus:ring-2 focus:ring-ambar/50'
const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="cedula mb-2 block text-canela">{children}</label>

/* 15 — FORMULARIO multi-paso → mensaje ordenado por WhatsApp */
export default function Formulario() {
  const [paso, setPaso] = useState(0)
  const [dir, setDir] = useState(1)
  const [f, setF] = useState({ accion: '', obra: '', taller: '', disciplina: '', portafolio: '', nota: '', personas: 2, fecha: '', franja: 'Tarde', nombre: '', contacto: '' })
  const [err, setErr] = useState('')
  const up = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }))

  const valido = () => {
    if (paso === 0 && !f.accion) return 'Elige una opción para continuar.'
    if (paso === 3 && !f.nombre.trim()) return 'Escribe tu nombre.'
    return ''
  }
  const ir = (d) => {
    if (d > 0) { const v = valido(); setErr(v); if (v) return }
    setErr(''); setDir(d); setPaso((p) => Math.max(0, Math.min(3, p + d)))
  }
  const enviar = (e) => {
    e.preventDefault()
    const v = valido(); setErr(v); if (v) return
    const op = OPCIONES.find((o) => o.id === f.accion)
    const l = ['¡Hola Casa Amiga!', '', `• Quiero: ${op.t}`]
    if (f.accion === 'comprar' && f.obra) l.push(`• Obra de interés: ${f.obra}`)
    if (f.accion === 'taller' && f.taller) l.push(`• Taller: ${f.taller}`)
    if (f.accion === 'artista') { if (f.disciplina) l.push(`• Disciplina: ${f.disciplina}`); if (f.portafolio) l.push(`• Portafolio: ${f.portafolio}`) }
    if (f.nota) l.push(`• Nota: ${f.nota}`)
    if (f.accion !== 'artista') l.push(`• Personas: ${f.personas}`)
    if (f.fecha) l.push(`• Fecha: ${f.fecha} (${f.franja.toLowerCase()})`)
    l.push(`• Nombre: ${f.nombre}`)
    if (f.contacto) l.push(`• Contacto: ${f.contacto}`)
    window.open(wa(l.join('\n')), '_blank', 'noopener')
  }

  const variants = {
    in: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    on: { x: 0, opacity: 1 },
    out: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <section id="formulario" className="bg-hueso py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4">15 — Agenda tu visita</p>
          <h2 className="titulo text-[clamp(2.8rem,5.5vw,5.6rem)] text-tinta">Cuéntanos a qué vienes</h2>
          <p className="mt-5 max-w-sm text-tinta/75">Cuatro pasos y te abrimos WhatsApp con el mensaje listo. Respondemos lo antes posible.</p>
        </div>

        <form onSubmit={enviar} className="rounded-[32px] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(43,26,18,.5)] sm:p-10 lg:col-span-8" noValidate>
          {/* Progreso: una línea que une las casitas */}
          <div className="relative mb-10">
            <svg className="absolute left-[12.5%] right-[12.5%] top-5 h-2 w-[75%] overflow-visible" viewBox="0 0 300 4" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <path d="M0 2 H300" stroke="var(--canela)" strokeOpacity=".15" strokeWidth="2" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              <motion.path d="M0 2 H300" stroke="var(--ambar)" strokeWidth="3" strokeLinecap="round" initial={false} animate={{ pathLength: paso / 3 }} transition={{ duration: 0.6, ease: 'easeInOut' }} />
            </svg>
            <ol className="relative grid grid-cols-4">
              {PASOS.map((p, i) => (
                <li key={p} className="flex flex-col items-center gap-2" aria-current={i === paso ? 'step' : undefined}>
                  <span className={`grid h-10 w-10 place-items-center rounded-full transition-colors duration-500 ${i <= paso ? 'bg-ambar text-canela' : 'border border-canela/20 bg-white text-canela/30'}`}>
                    <Casita className="h-6 w-6" strokeWidth={12} />
                  </span>
                  <span className={`cedula hidden text-center sm:block ${i === paso ? 'text-canela' : 'text-tinta/40'}`}>{p}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative min-h-[320px] overflow-hidden">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={paso} custom={dir} variants={variants} initial="in" animate="on" exit="out" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                {paso === 0 && (
                  <fieldset>
                    <legend className="font-display text-2xl font-bold text-tinta">1. ¿Qué quieres hacer?</legend>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {OPCIONES.map((o) => (
                        <label key={o.id} className={`cursor-pointer rounded-2xl border p-5 transition-all ${f.accion === o.id ? 'border-canela bg-ambar/15 shadow-[inset_0_0_0_1px_var(--canela)]' : 'border-canela/20 hover:border-canela/50'}`}>
                          <input type="radio" name="accion" value={o.id} checked={f.accion === o.id} onChange={up('accion')} className="sr-only" />
                          <span className="block font-display text-lg font-bold text-tinta">{o.t}</span>
                          <span className="mt-1 block text-sm text-tinta/65">{o.d}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                {paso === 1 && (
                  <fieldset className="space-y-5">
                    <legend className="font-display text-2xl font-bold text-tinta">2. Detalles</legend>
                    {f.accion === 'comprar' && (
                      <div><Label htmlFor="obra">Obra o artista de interés</Label>
                        <select id="obra" value={f.obra} onChange={up('obra')} className={campo}>
                          <option value="">Aún no sé, quiero ver opciones</option>
                          {OBRAS.map((o) => <option key={o.id} value={`${o.titulo} — ${ARTISTAS.find((a) => a.id === o.artistaId)?.nombre}`}>{o.titulo} — {ARTISTAS.find((a) => a.id === o.artistaId)?.nombre}</option>)}
                        </select></div>
                    )}
                    {f.accion === 'taller' && (
                      <div><Label htmlFor="taller">Taller</Label>
                        <select id="taller" value={f.taller} onChange={up('taller')} className={campo}>
                          <option value="">Elige un taller</option>
                          {EVENTOS.map((e) => <option key={e.id} value={e.titulo}>{e.titulo}</option>)}
                        </select></div>
                    )}
                    {f.accion === 'artista' && (
                      <>
                        <div><Label htmlFor="disc">Disciplina</Label><input id="disc" value={f.disciplina} onChange={up('disciplina')} placeholder="Pintura, ilustración, cerámica…" className={campo} /></div>
                        <div><Label htmlFor="port">Link de portafolio o Instagram</Label><input id="port" value={f.portafolio} onChange={up('portafolio')} placeholder="https://" className={campo} inputMode="url" /></div>
                      </>
                    )}
                    <div><Label htmlFor="nota">{f.accion === 'visitar' ? '¿Algo que quieras ver o preguntar?' : 'Algo más que quieras contarnos'} (opcional)</Label>
                      <textarea id="nota" rows={3} value={f.nota} onChange={up('nota')} className={campo} /></div>
                  </fieldset>
                )}
                {paso === 2 && (
                  <fieldset className="space-y-5">
                    <legend className="font-display text-2xl font-bold text-tinta">3. ¿Cuántos y cuándo?</legend>
                    {f.accion !== 'artista' && (
                      <div><span className="cedula mb-2 block text-canela" id="pers">Personas</span>
                        <div className="inline-flex items-center gap-4 rounded-full border border-canela/25 p-1.5" role="group" aria-labelledby="pers">
                          <button type="button" onClick={() => up('personas')(Math.max(1, f.personas - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-hueso text-xl text-canela" aria-label="Menos personas">−</button>
                          <span className="titulo w-10 text-center text-3xl" aria-live="polite">{f.personas}</span>
                          <button type="button" onClick={() => up('personas')(Math.min(40, f.personas + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-ambar text-xl text-tinta" aria-label="Más personas">+</button>
                        </div></div>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div><Label htmlFor="fecha">{f.accion === 'artista' ? 'Fecha tentativa para reunirnos' : 'Fecha'}</Label><input id="fecha" type="date" value={f.fecha} onChange={up('fecha')} className={campo} /></div>
                      <div><span className="cedula mb-2 block text-canela">Franja</span>
                        <div className="flex gap-2">{['Mañana', 'Tarde'].map((t) => (
                          <button key={t} type="button" onClick={() => up('franja')(t)} aria-pressed={f.franja === t} className={`flex-1 rounded-2xl border px-4 py-3.5 font-medium transition-colors ${f.franja === t ? 'border-canela bg-canela text-white' : 'border-canela/25 text-tinta'}`}>{t}</button>
                        ))}</div></div>
                    </div>
                  </fieldset>
                )}
                {paso === 3 && (
                  <fieldset className="space-y-5">
                    <legend className="font-display text-2xl font-bold text-tinta">4. ¿Cómo te llamas?</legend>
                    <div><Label htmlFor="nombre">Nombre *</Label><input id="nombre" required autoComplete="name" value={f.nombre} onChange={up('nombre')} className={campo} /></div>
                    <div><Label htmlFor="contacto">Teléfono o correo (opcional)</Label><input id="contacto" autoComplete="email" value={f.contacto} onChange={up('contacto')} className={campo} /></div>
                    <p className="text-sm text-tinta/60">Al enviar se abrirá WhatsApp con tu mensaje listo. Tú decides si lo mandas.</p>
                  </fieldset>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="min-h-[1.5rem] text-sm font-medium text-canela" role="alert">{err}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => ir(-1)} className={`btn-outline px-5 py-3 ${paso === 0 ? 'invisible' : ''}`}><Arrow dir="left" /> Atrás</button>
            {paso < 3 ? (
              <button type="button" onClick={() => ir(1)} className="btn-ambar px-7 py-3.5">Siguiente <Arrow /></button>
            ) : (
              <button type="submit" className="btn-ambar px-7 py-3.5"><WhatsAppIcon className="h-5 w-5" /> Enviar por WhatsApp</button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
