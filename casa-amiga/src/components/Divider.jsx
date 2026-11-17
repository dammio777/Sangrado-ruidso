import { gsap, useMM, MOTION } from '../lib/motion'
import { Casita } from './LogoIcon'

/* Separador entre secciones: una línea que se dibuja desde el centro y la casita del logo que aparece en el borde. */
export default function Divider() {
  const ref = useMM((mm, el) => {
    mm.add(MOTION, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
      tl.fromTo('.dv-line', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' })
        .fromTo('.dv-badge', { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(2)' }, 0.25)
        .fromTo('.dv-badge .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 0.9, stagger: 0.08, ease: 'power2.inOut' }, 0.45)
    })
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className="relative z-20 h-0">
      <span className="dv-line absolute inset-x-0 -top-px mx-auto block h-px w-[min(92%,1300px)] origin-center bg-canela/25" />
      <span className="dv-badge absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-ambar text-canela shadow-[0_10px_24px_-10px_rgba(180,96,14,.7)]">
        <Casita className="h-8 w-8" strokeWidth={11} />
      </span>
    </div>
  )
}
