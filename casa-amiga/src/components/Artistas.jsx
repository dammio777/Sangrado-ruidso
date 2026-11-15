import { useRef } from 'react'
import { ARTISTAS, OBRAS, asset } from '../data'
import { gsap, useMM, MOTION, finePointer, prefersReduced } from '../lib/motion'
import { scrollTo } from '../lib/scroll'
import LogoIcon from './LogoIcon'
import { InstagramIcon, Arrow } from './Icons'

function Tarjeta({ a, i }) {
  const card = useRef(null)
  const tilt = (e) => {
    if (!finePointer() || prefersReduced() || window.innerWidth < 1024) return
    const r = card.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(card.current, { rotateY: px * 12, rotateX: -py * 12, duration: 0.5, ease: 'power3.out', transformPerspective: 900 })
  }
  const reset = () => gsap.to(card.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
  const verObras = () => {
    window.dispatchEvent(new CustomEvent('casa:filtro', { detail: `artista:${a.id}` }))
    scrollTo('#galeria')
  }
  const nObras = OBRAS.filter((o) => o.artistaId === a.id).length

  return (
    <article ref={card} onMouseMove={tilt} onMouseLeave={reset} className="art-card group relative [transform-style:preserve-3d]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-hueso">
        {a.foto ? (
          <img src={asset(a.foto)} alt={`Retrato de ${a.nombre}`} loading="lazy" className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="grid h-full w-full place-items-center border border-canela/10 bg-white text-canela/40 transition-colors duration-700 group-hover:bg-ambar group-hover:text-canela">
            <LogoIcon className="h-1/2 w-1/2" strokeWidth={3} />
          </div>
        )}
        <span className="cedula absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-canela">Artista {String(i + 1).padStart(2, '0')}</span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="titulo text-3xl text-tinta">{a.nombre}</h3>
          <p className="cedula mt-1 text-ambar-oscuro">{a.disciplina}</p>
        </div>
        {a.instagram && (
          <a href={`https://www.instagram.com/${a.instagram}/`} target="_blank" rel="noreferrer" aria-label={`Instagram de ${a.nombre}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-canela/25 text-canela transition-colors hover:bg-canela hover:text-white">
            <InstagramIcon />
          </a>
        )}
      </div>
      {nObras > 0 && (
        <button type="button" onClick={verObras} className="group/b mt-3 inline-flex items-center gap-2 font-medium text-canela">
          Ver sus obras <span className="cedula text-tinta/50">({nObras})</span>
          <Arrow className="h-4 w-4 transition-transform group-hover/b:translate-x-1" />
        </button>
      )}
    </article>
  )
}

/* 07 — ARTISTAS */
export default function Artistas() {
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      gsap.from('.art-card', { y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.art-grid', start: 'top 80%' } })
    })
  }, [])
  return (
    <section ref={ref} id="artistas" className="bg-hueso py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-4">07 — Artistas</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">Quienes<br />hacen la casa</h2>
          </div>
          <p className="max-w-md text-tinta/75 lg:justify-self-end">Creadores de Santa Elena y del Valle de Aburrá que exponen, venden y enseñan aquí. Pasa el cursor para verlos a color.</p>
        </div>
        <div className="art-grid grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {ARTISTAS.map((a, i) => <Tarjeta key={a.id} a={a} i={i} />)}
        </div>
      </div>
    </section>
  )
}
