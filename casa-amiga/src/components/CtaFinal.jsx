import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, useMM, MOTION } from '../lib/motion'
import { wa } from '../data'
import LogoIcon from './LogoIcon'
import Magnetic from './Magnetic'
import { WhatsAppIcon } from './Icons'

/* 14 — CTA FINAL */
export default function CtaFinal() {
  const titulo = useRef(null)
  const ref = useMM((mm, el) => {
    mm.add(MOTION, () => {
      const split = new SplitType(titulo.current, { types: 'lines,words' })
      split.lines?.forEach((l) => { l.style.overflow = 'hidden'; l.style.paddingBottom = '0.04em' })
      gsap.from(split.words, { yPercent: 115, duration: 1, stagger: 0.06, ease: 'power4.out', scrollTrigger: { trigger: titulo.current, start: 'top 80%' } })
      gsap.fromTo('.cta-icono .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 60%', scrub: 1 } })
      gsap.fromTo('.cta-icono', { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      return () => split.revert()
    })
  }, [])

  return (
    <section ref={ref} id="cta" className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-ambar py-28">
      <LogoIcon className="cta-icono pointer-events-none absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 text-canela opacity-[.12]" strokeWidth={2.2} />
      <div className="wrap relative text-center">
        <p className="cedula mb-8 text-tinta">14 — Te esperamos</p>
        <h2 ref={titulo} className="titulo mx-auto max-w-[14ch] text-[clamp(3.5rem,11vw,11rem)] text-tinta">
          Ven, esta también es tu casa.
        </h2>
        <Magnetic className="mt-12">
          <a href={wa('¡Hola Casa Amiga! Quiero visitarlos. ¿Me cuentan horarios y cómo llegar?')} target="_blank" rel="noreferrer" className="btn bg-white px-9 py-5 text-lg text-canela shadow-[0_20px_50px_-20px_rgba(43,26,18,.5)] hover:bg-hueso">
            <WhatsAppIcon className="h-6 w-6" /> Escríbenos por WhatsApp
          </a>
        </Magnetic>
      </div>
    </section>
  )
}
