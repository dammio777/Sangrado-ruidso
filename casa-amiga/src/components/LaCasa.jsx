import { useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { asset, PERRO } from '../data'
import { gsap, useMM, MOTION } from '../lib/motion'

function Comparador() {
  const box = useRef(null)
  const pos = useMotionValue(50)
  const clip = useTransform(pos, (p) => `inset(0 0 0 ${p}%)`)
  const left = useTransform(pos, (p) => `${p}%`)
  const [drag, setDrag] = useState(false)

  const set = (clientX) => {
    const r = box.current.getBoundingClientRect()
    pos.set(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100)))
  }
  const down = (e) => { setDrag(true); box.current.setPointerCapture(e.pointerId); set(e.clientX) }
  const move = (e) => drag && set(e.clientX)
  const up = () => { setDrag(false); animate(pos, 50, { type: 'spring', stiffness: 120, damping: 18 }) }
  const key = (e) => {
    if (e.key === 'ArrowLeft') pos.set(Math.max(2, pos.get() - 5))
    if (e.key === 'ArrowRight') pos.set(Math.min(98, pos.get() + 5))
  }

  return (
    <div
      ref={box}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[28px] bg-tinta sm:aspect-[16/10]"
      data-cursor="arrastra"
    >
      <img src={asset('img/atardecer.jpg')} alt="La cabaña de Casa Amiga al atardecer, con la huerta de flores" className="absolute inset-0 h-full w-full object-cover" draggable="false" />
      <motion.img src={asset('img/noche.jpg')} alt="La cabaña de Casa Amiga de noche, iluminada" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: clip }} draggable="false" />
      <span className="cedula absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-canela">Atardecer</span>
      <span className="cedula absolute right-4 top-4 rounded-full bg-tinta/80 px-3 py-1.5 text-ambar">De noche</span>
      <motion.div className="absolute inset-y-0 w-0" style={{ left }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white/90" />
        <button
          type="button"
          onKeyDown={key}
          aria-label="Comparar de día y de noche: usa las flechas izquierda y derecha"
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ambar text-tinta shadow-xl"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </button>
      </motion.div>
    </div>
  )
}

const MINI = [
  { img: 'img/casa-interior.jpg', alt: 'Interior de la galería con sofá verde, repisas y plantas', t: 'Interior' },
  { img: 'img/repisa-lampara.jpg', alt: 'Lámpara-hongo roja con puntos blancos sobre una mesa de hierro', t: 'La lámpara-hongo' },
  { img: 'img/casa-interior-2.jpg', alt: 'Cuadros, plantas y ropa en la pared blanca de la galería', t: 'Cuadros y plantas' },
  { img: 'img/perro-anfitrion.jpg', alt: 'El husky de la casa recostado en el pasto, frente a la cabaña', t: PERRO || 'El anfitrión', perro: true },
]

/* 09 — LA CASA (de día / de noche) */
export default function LaCasa() {
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      gsap.from('.mini', { y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.mini-grid', start: 'top 85%' } })
    })
  }, [])
  return (
    <section ref={ref} id="la-casa" className="bg-hueso py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-4">09 — La casa</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">Del atardecer<br />a la noche</h2>
          </div>
          <p className="max-w-md text-tinta/75 lg:justify-self-end">Una cabaña de madera entre pinos. Arrastra para encender las luces.</p>
        </div>
        <Comparador />
        <ul className="mini-grid mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {MINI.map((m) => (
            <li key={m.img} className="mini group relative" data-reveal>
              <div className="aspect-square overflow-hidden rounded-[20px] bg-hueso">
                <img src={asset(m.img)} alt={m.alt} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${m.perro ? 'object-[62%_50%]' : ''}`} />
              </div>
              {m.perro ? (
                <p className="absolute -bottom-4 right-2 -rotate-6 rounded-xl bg-white px-3 py-1 font-script text-[2.1rem] leading-none text-canela shadow-md">{m.t}</p>
              ) : (
                <p className="cedula mt-3 text-canela">{m.t}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
