import { useEffect, useState } from 'react'
import { DIRECCION, HORARIO, HORARIO_NOTA, MAPS_EMBED, MAPS_DIR, asset } from '../data'
import { Arrow } from './Icons'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const h12 = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`

function estado() {
  const b = new Date(Date.now() - 5 * 3600e3) // hora de Bogotá
  const d = b.getUTCDay(), h = b.getUTCHours() + b.getUTCMinutes() / 60
  const hoy = HORARIO[d]
  return { abierto: !!hoy && h >= hoy[0] && h < hoy[1], dia: d }
}

/* 13 — UBICACIÓN Y HORARIOS */
export default function Ubicacion() {
  const [e, setE] = useState(estado)
  const [vista, setVista] = useState('mapa')
  useEffect(() => { const t = setInterval(() => setE(estado()), 60000); return () => clearInterval(t) }, [])
  const orden = [1, 2, 3, 4, 5, 6, 0]

  return (
    <section id="visitanos" className="bg-blanco py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-4">13 — Visítanos</p>
          <h2 className="titulo text-[clamp(3rem,6.5vw,6.5rem)] text-tinta">Sube a la Vereda El Placer.</h2>
          <address className="mt-6 not-italic text-lg text-tinta/80">
            {DIRECCION.linea1}<br />{DIRECCION.linea2}<br />
            <span className="text-canela">{DIRECCION.referencia}</span>
          </address>

          {/* Cédula museográfica del horario */}
          <div className="mt-10 max-w-md border-l-2 border-canela pl-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="cedula text-canela">Obra permanente: nuestro horario</p>
              <p className={`cedula inline-flex items-center gap-2 rounded-full px-3 py-1 ${e.abierto ? 'bg-ambar text-tinta' : 'bg-tinta text-white'}`} role="status">
                <span className={`h-2 w-2 rounded-full ${e.abierto ? 'animate-pulse bg-tinta' : 'bg-white/60'}`} />
                {e.abierto ? 'Abierto ahora' : 'Cerrado'}
              </p>
            </div>
            <dl className="cedula mt-4 grid grid-cols-[1fr_auto] gap-y-1.5 text-tinta/75">
              {orden.map((d) => (
                <div key={d} className={`contents ${d === e.dia ? 'font-medium text-tinta' : ''}`}>
                  <dt>{DIAS[d]}{d === e.dia && ' · hoy'}</dt>
                  <dd className="text-right">{HORARIO[d] ? `${h12(HORARIO[d][0])} – ${h12(HORARIO[d][1])}` : 'Cerrado'}</dd>
                </div>
              ))}
            </dl>
            <p className="cedula mt-3 text-tinta/50">{HORARIO_NOTA} · Hora de Bogotá</p>
          </div>

          <a href={MAPS_DIR} target="_blank" rel="noreferrer" className="btn-ambar mt-10 px-7 py-4">Cómo llegar <Arrow /></a>
        </div>

        <div>
          <div className="mb-4 inline-flex rounded-full border border-canela/20 p-1" role="tablist" aria-label="Tipo de mapa">
            {[['mapa', 'Google Maps'], ['ilustrado', 'Mapa ilustrado']].map(([id, t]) => (
              <button key={id} role="tab" aria-selected={vista === id} type="button" onClick={() => setVista(id)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${vista === id ? 'bg-canela text-white' : 'text-tinta/70'}`}>{t}</button>
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-hueso sm:aspect-[5/4] lg:aspect-[4/5]">
            {vista === 'mapa' ? (
              <>
                <iframe
                  title="Mapa: Casa Amiga, Vereda El Placer, Santa Elena"
                  src={MAPS_EMBED}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0 [filter:sepia(.35)_saturate(.85)_contrast(1.02)]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ambar/10 mix-blend-multiply" />
              </>
            ) : (
              <img src={asset('img/mapa-ilustrado.jpg')} alt="Mapa ilustrado a mano: desde El Silletero hasta Vereda El Placer" className="absolute inset-0 h-full w-full bg-white object-contain p-4" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
