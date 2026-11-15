import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReduced } from '../lib/motion'
import { lockScroll } from '../lib/scroll'
import LogoIcon from './LogoIcon'

/* 00 — Trazo que dibuja el logo, firma en Allura, círculo ámbar e iris que revela el hero. Máx 2.2 s. */
export default function Preloader({ onReveal, onDone }) {
  const root = useRef(null)
  const [n, setN] = useState(0)

  useLayoutEffect(() => {
    if (prefersReduced()) { onReveal(); onDone(); return }
    lockScroll(true)
    const ctx = gsap.context(() => {
      const c = { v: 0 }
      const d = { strokeDashoffset: 1.05 }
      const tl = gsap.timeline({
        onComplete: () => { lockScroll(false); onDone() },
      })
      tl.to(c, { v: 100, duration: 1.55, ease: 'power2.inOut', onUpdate: () => setN(Math.round(c.v)) }, 0)
        .fromTo('.logo-hojas .draw', d, { strokeDashoffset: 0, autoRound: false, duration: 0.42, stagger: 0.07, ease: 'power1.inOut' }, 0)
        .fromTo('.logo-manos .draw', d, { strokeDashoffset: 0, autoRound: false, duration: 0.45, stagger: 0.08, ease: 'power1.inOut' }, 0.3)
        .fromTo('.logo-casa .draw', d, { strokeDashoffset: 0, autoRound: false, duration: 0.42, stagger: 0.07, ease: 'power1.inOut' }, 0.55)
        .fromTo('.pl-firma', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' }, 0.75)
        .fromTo('.pl-circulo', { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(1.6)' }, 1.15)
        .call(onReveal, null, 1.6)
        .to('.pl-circulo', { scale: 9, duration: 0.6, ease: 'power3.in' }, 1.6)
        .to('.pl-centro', { opacity: 0, scale: 0.92, duration: 0.25 }, 1.6)
        .to(root.current, { '--r': 160, duration: 0.6, ease: 'power3.in' }, 1.6)
    }, root)
    return () => { ctx.revert(); lockScroll(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mask = 'radial-gradient(circle at 50% 46%, transparent calc(var(--r) * 1vmax), #000 calc(var(--r) * 1vmax + 1px))'
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-blanco"
      style={{ '--r': 0, maskImage: mask, WebkitMaskImage: mask }}
      aria-hidden="true"
    >
      <div className="pl-circulo absolute left-1/2 top-[46%] h-[min(62vw,340px)] w-[min(62vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ambar" />
      <div className="pl-centro relative -mt-[8vh] flex flex-col items-center text-canela">
        <LogoIcon className="h-[min(30vw,150px)] w-[min(30vw,150px)]" strokeWidth={4.5} />
        <span className="pl-firma -mt-2 font-script text-[clamp(2.6rem,9vw,4rem)] leading-none">Casa Amiga</span>
      </div>
      <p className="cedula absolute bottom-6 left-1/2 -translate-x-1/2 text-canela sm:bottom-8 sm:left-8 sm:translate-x-0">
        Obra {String(n).padStart(3, '0')} <span className="text-canela/40">/ 100</span>
      </p>
      <p className="cedula absolute bottom-8 right-8 hidden text-canela/60 sm:block">Santa Elena · Medellín</p>
    </div>
  )
}
