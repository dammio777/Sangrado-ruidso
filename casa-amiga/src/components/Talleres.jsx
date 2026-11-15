import { useEffect, useMemo, useState } from 'react'
import { EVENTOS, EDICION, FERIA_FOTOS, asset, wa } from '../data'
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
  const fecha = `${DIAS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`
  const msg = e.pasado
    ? `¡Hola Casa Amiga! Me interesó "${e.titulo}" de la feria del ${fecha}. ¿Me avisan cuando haya una próxima fecha?`
    : `¡Hola Casa Amiga! Quiero reservar cupo para "${e.titulo}" (${fecha}, ${e.hora}). ¿Cómo reservo?`
  return (
    <article className="tk relative flex w-[min(84vw,560px)] shrink-0 select-none flex-col rounded-[18px] bg-white text-tinta shadow-[0_24px_50px_-28px_rgba(43,26,18,.45)] sm:flex-row">
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
          {e.cupos != null && (
            <div>
              <p className="cedula text-tinta/60">Cupos</p>
              <p className="titulo text-3xl">{e.cupos}</p>
            </div>
          )}
          <div>
            <p className="cedula text-tinta/60 sm:mt-2">Entrada</p>
            <p className="font-display text-lg font-bold">{precio(e.precio)}</p>
          </div>
        </div>
        <a href={wa(msg)} target="_blank" rel="noreferrer" onPointerDownCapture={(ev) => ev.stopPropagation()} className="btn-ambar gap-1.5 whitespace-nowrap px-4 py-2.5 text-[0.8rem] sm:mt-4 sm:w-full sm:px-2">
          <WhatsAppIcon className="h-4 w-4" /> {e.pasado ? 'Próxima fecha' : 'Reservar cupo'}
        </a>
      </div>
      {(proximo || e.pasado) && (
        <span className={`absolute -right-2 -top-6 grid h-[4.6rem] w-[4.6rem] rotate-12 place-items-center rounded-full border-2 border-dashed text-center font-display text-sm font-extrabold uppercase leading-none shadow-lg sm:right-28 ${proximo ? 'border-tinta/40 bg-ambar text-tinta' : 'border-ambar/60 bg-tinta text-ambar'}`}>
          {proximo ? 'Próximo' : 'Así fue'}
        </span>
      )}
    </article>
  )
}

/* 08 — TALLERES Y EVENTOS */
export default function Talleres() {
  const lista = useMemo(() => [...EVENTOS].sort((a, b) => new Date(a.inicio) - new Date(b.inicio)), [])
  const futuros = lista.filter((e) => !e.pasado && new Date(e.inicio) > new Date())
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
          <p className="max-w-md text-tinta/75 lg:justify-self-end">
            {futuros.length
              ? 'Talleres abiertos a todos, música en vivo y encuentros para emprender. Arrastra las boletas y reserva tu cupo por WhatsApp.'
              : `Así fue el programa de la ${EDICION.nombre}, el ${EDICION.fecha}, con entrada gratis. Arrastra las boletas y escríbenos para enterarte de la próxima.`}
          </p>
        </div>
        <DragRail label="Agenda de talleres y eventos" className="tk-rail pt-6">
          {(futuros.length ? futuros : lista).map((e) => <Boleta key={e.id} e={e} proximo={e.id === proximoId} />)}
        </DragRail>

        <div className="mt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Memoria</p>
              <h3 className="titulo text-[clamp(2.4rem,5vw,4.6rem)] text-tinta">Así fue la feria</h3>
            </div>
            <p className="cedula max-w-xs text-tinta/60">{EDICION.nombre} · {EDICION.horario} · {EDICION.lugar}</p>
          </div>
          <DragRail label="Fotos de la Feria Casa Amiga">
            {FERIA_FOTOS.map((f, i) => (
              <figure key={f.img} className={`shrink-0 overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_20px_40px_-28px_rgba(43,26,18,.5)] ${i % 2 ? 'mt-6' : ''}`}>
                <img src={asset(f.img)} alt={f.alt} loading="lazy" draggable="false" className="h-[260px] w-auto rounded-[14px] object-cover sm:h-[360px]" />
              </figure>
            ))}
          </DragRail>
          <p className="mt-6 max-w-2xl text-sm text-tinta/60">{EDICION.apoyo}</p>
        </div>
      </div>
    </section>
  )
}
