import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReduced } from '../lib/motion'
import { Casita } from './LogoIcon'

const ITEMS = ['Arte local', 'Diseño', 'Talleres', 'Objetos hechos a mano', 'Santa Elena', 'Vereda El Placer']

function Fila() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {ITEMS.map((t) => (
        <span key={t} className="flex items-center">
          <span className="titulo whitespace-nowrap px-6 text-[clamp(2.4rem,6vw,5.5rem)] text-tinta">{t}</span>
          <svg viewBox="0 0 24 24" className="h-[clamp(1.2rem,2.4vw,2rem)] w-[clamp(1.2rem,2.4vw,2rem)] text-tinta" aria-hidden="true"><path fill="currentColor" d="M12 0l2.2 8.1L21 3l-4.9 6.8L24 12l-7.9 2.2L21 21l-6.8-4.9L12 24l-2.2-7.9L3 21l4.9-6.9L0 12l7.9-2.2L3 3l6.8 5.1z" /></svg>
          <Casita className="mx-6 h-[clamp(2rem,4vw,3.4rem)] w-[clamp(2rem,4vw,3.4rem)] text-canela" strokeWidth={11} />
        </span>
      ))}
    </div>
  )
}

/* 03 — Cinta ámbar que acelera y se inclina con la velocidad del scroll. */
export default function Marquee() {
  const track = useRef(null)
  useEffect(() => {
    if (prefersReduced()) return
    const el = track.current
    let x = 0, vel = 0, skew = 0
    const setSkew = gsap.quickSetter(el, 'skewX', 'deg')
    const setX = gsap.quickSetter(el, 'x', 'px')
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { vel = s.getVelocity() } })
    const tick = (_, dt) => {
      const half = el.scrollWidth / 2
      const boost = Math.min(Math.abs(vel) / 120, 14)
      x -= (0.06 + boost * 0.05) * dt * (vel < 0 ? -1 : 1)
      if (x <= -half) x += half
      if (x > 0) x -= half
      setX(x)
      const target = gsap.utils.clamp(-10, 10, vel / -250)
      skew += (target - skew) * 0.1
      setSkew(skew)
      vel *= 0.92
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill() }
  }, [])
  return (
    <section aria-label="Arte local, diseño, talleres, objetos hechos a mano — Santa Elena, Vereda El Placer" className="relative z-10 overflow-hidden border-y border-canela/20 bg-ambar py-5 sm:py-7">
      <div className="flex w-max will-change-transform" ref={track}>
        <Fila />
        <Fila />
      </div>
    </section>
  )
}
