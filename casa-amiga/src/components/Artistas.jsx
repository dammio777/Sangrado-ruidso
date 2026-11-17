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
      <div className="relative mx-auto aspect-square w-full max-w-[17rem]">
        <span aria-hidden="true" className="absolute -inset-3 rounded-full border border-dashed border-canela/35 transition-colors duration-500 [animation:girar_40s_linear_infinite] group-hover:border-ambar" />
        <div className="art-foto relative h-full w-full overflow-hidden rounded-full bg-white shadow-[0_24px_44px_-26px_rgba(43,26,18,.55)]">
          {a.foto ? (
            <img src={asset(a.foto)} alt={`Imagen de ${a.nombre}`} loading="lazy" className="h-full w-full scale-[1.04] object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-110 group-hover:grayscale-0" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-white text-canela/40"><LogoIcon className="h-1/2 w-1/2" strokeWidth={3} /></div>
          )}
        </div>
        <span className="cedula absolute -left-1 top-2 rounded-full bg-ambar px-3 py-1 text-tinta">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <div className="mt-7 text-center">
        <h3 className="titulo text-[1.7rem] text-tinta">{a.nombre}</h3>
        <p className="cedula mt-1 text-ambar-oscuro">{a.disciplina}</p>
        {a.bio && <p className="mx-auto mt-2 max-w-[17rem] text-sm text-tinta/70">{a.bio}</p>}
        {a.instagram && (
          <a href={`https://www.instagram.com/${a.instagram}/`} target="_blank" rel="noreferrer" aria-label={`Instagram de ${a.nombre}`} className="mx-auto mt-3 grid h-10 w-10 place-items-center rounded-full border border-canela/25 text-canela transition-colors hover:bg-canela hover:text-white"><InstagramIcon /></a>
        )}
      </div>
      {nObras > 0 && (
        <button type="button" onClick={verObras} className="group/b mx-auto mt-3 flex items-center gap-2 font-medium text-canela">
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
    <section ref={ref} id="artistas" className="overflow-x-clip bg-hueso py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-4">07 — Artistas</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">Quienes<br />hacen la casa</h2>
          </div>
          <p className="max-w-md text-tinta/75 lg:justify-self-end">Marcas, artistas y músicos que han pasado por la casa: exponen, venden y comparten aquí. Pasa el cursor para verlos a color.</p>
        </div>
        <div className="art-grid grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {ARTISTAS.filter((a) => !a.oculto).map((a, i) => <Tarjeta key={a.id} a={a} i={i} />)}
        </div>
      </div>
    </section>
  )
}
