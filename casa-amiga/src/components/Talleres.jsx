import { useEffect, useMemo, useState } from 'react'
import { EVENTOS, wa } from '../data'
import { gsap, useMM, MOTION } from '../lib/motion'
import DragRail from './DragRail'
import { WhatsAppIcon } from './Icons'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
// Fecha en hora de Bogotá (UTC-5, sin horario de verano)
const bog = (iso) => new Date(new Date(iso).getTime() - 5 * 3600e3)
const precio = (p) => (p == null ? 'Consultar' : p === 0 ? 'Gratis' : `$${p.toLocaleString('es-CO')}`)

function useCuenta(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function Cuenta({ iso }) {
  const c = useCuenta(iso)
  const p = (n) => String(n).padStart(2, '0')
  return (
    <p className="cedula mt-3 inline-flex flex-wrap gap-x-1.5 whitespace-nowrap rounded-2xl bg-tinta px-3 py-1.5 text-white" aria-live="off">
      Faltan <b className="font-medium text-ambar">{c.d}d {p(c.h)}h {p(c.m)}m {p(c.s)}s</b>
    </p>
  )
}

function Boleta({ e, proximo }) {
  const f = bog(e.inicio)
  const msg = `¡Hola Casa Amiga! Quiero reservar cupo para "${e.titulo}" (${DIAS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}, ${e.hora}). ¿Cómo reservo?`
  return (
    <article className="tk relative flex w-[min(84vw,560px)] flex-col sm:flex-row shrink-0 select-none rounded-[18px] bg-white text-tinta shadow-[0_24px_50px_-28px_rgba(43,26,18,.45)]">
      {/* borde troquelado lateral */}
      <span aria-hidden="true" className="absolute inset-y-3 -left-[5px] w-[10px] bg-[radial-gradient(circle_at_center,var(--hueso)_4.5px,transparent_5px)] bg-[length:10px_16px] bg-repeat-y" />
      <div className="flex flex-1 gap-5 p-6 sm:p-7">
        <div className="w-16 shrink-0 text-center sm:w-20">
          <p className="cedula text-ambar-oscuro">{DIAS[f.getUTCDay()].slice(0, 3)}</p>
          <p className="titulo text-[3.6rem] text-canela sm:text-[4.4rem]">{f.getUTCDate()}</p>
          <p className="cedula text-tinta/70">{MESES[f.getUTCMonth()]} · {f.getUTCFullYear()}</p>
        </div>
        <div className="min-w-0 flex-1 border-l border-canela/15 pl-5">
          <p className="cedula text-ambar-oscuro">{e.tipo}</p>
          <h3 className="mt-1 font-display text-2xl font-bold leading-[1.05] sm:text-[1.7rem]">{e.titulo}</h3>
          <p className="cedula mt-3 text-tinta/70">{e.hora}</p>
          {proximo && <Cuenta iso={e.inicio} />}
        </div>
      </div>
      {/* talón */}
      <div className="relative flex shrink-0 items-center justify-between gap-4 border-t-2 border-dashed border-canela/25 px-6 py-5 text-left sm:w-36 sm:flex-col sm:border-l-2 sm:border-t-0 sm:px-3 sm:py-6 sm:text-center">
        <span aria-hidden="true" className="absolute -left-3 -top-[13px] h-6 w-6 rounded-full bg-hueso sm:-left-[13px] sm:-top-3" />
        <span aria-hidden="true" className="absolute -right-3 -top-[13px] h-6 w-6 rounded-full bg-hueso sm:-bottom-3 sm:-left-[13px] sm:right-auto sm:top-auto" />
        <div className="flex gap-6 sm:block">
          <div>
          <p className="cedula text-tinta/60">Cupos</p>
          <p className="titulo text-3xl">{e.cupos}</p>
          </div>
          <div>
          <p className="cedula text-tinta/60 sm:mt-2">Valor</p>
          <p className="font-display text-lg font-bold">{precio(e.precio)}</p>
          </div>
        </div>
        <a href={wa(msg)} target="_blank" rel="noreferrer" onPointerDownCapture={(ev) => ev.stopPropagation()} className="btn-ambar gap-1.5 whitespace-nowrap px-4 py-2.5 text-[0.8rem] sm:mt-4 sm:w-full sm:px-2">
          <WhatsAppIcon className="h-4 w-4" /> Reservar cupo
        </a>
      </div>
      {proximo && (
        <span className="absolute -right-2 -top-6 grid h-[4.6rem] sm:right-28 w-[4.6rem] rotate-12 place-items-center rounded-full border-2 border-dashed border-tinta/40 bg-ambar text-center font-display text-sm font-extrabold uppercase leading-none text-tinta shadow-lg">
          Próximo
        </span>
      )}
    </article>
  )
}

/* 08 — TALLERES Y EVENTOS */
export default function Talleres() {
  const lista = useMemo(() => [...EVENTOS].sort((a, b) => new Date(a.inicio) - new Date(b.inicio)), [])
  const futuros = lista.filter((e) => new Date(e.inicio) > new Date())
  const proximoId = futuros[0]?.id
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      gsap.from('.tk', { x: 120, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.tk-rail', start: 'top 80%' } })
    })
  }, [])
  return (
    <section ref={ref} id="talleres" className="overflow-hidden bg-hueso py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-4">08 — Talleres y eventos</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">La agenda<br />de la casa</h2>
          </div>
          <p className="max-w-md text-tinta/75 lg:justify-self-end">Talleres abiertos a todos, música en vivo y encuentros para emprender. Arrastra las boletas y reserva tu cupo por WhatsApp.</p>
        </div>
        <DragRail label="Agenda de talleres y eventos" className="tk-rail pt-6">
          {(futuros.length ? futuros : lista).map((e) => <Boleta key={e.id} e={e} proximo={e.id === proximoId} />)}
        </DragRail>
      </div>
    </section>
  )
}
