import { useLayoutEffect } from 'react'
import { gsap, useMM, DESK, MOB, MOTION, prefersReduced } from '../lib/motion'
import { scrollTo } from '../lib/scroll'
import { asset } from '../data'
import Magnetic from './Magnetic'
import { Arrow } from './Icons'

const LINEAS = [['Arte', 'que'], ['se', 'siente'], ['en', 'casa.']]
const FS = 'clamp(3.2rem,7.6vw,9rem)'
const PUERTA = '51% 52%' // centro de la puerta en la foto

/* 02 — HERO a pantalla completa. La foto de la casa es lo primero que se ve; con el scroll la cámara entra por la puerta. */
export default function Hero({ ready }) {
  const root = useMM((mm, el) => {
    mm.add(DESK, () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=210%', scrub: 1, pin: true, anticipatePin: 1 },
      })
      tl.to('.hero-copy', { y: -80, opacity: 0, duration: 0.22 }, 0)
        .to('.hero-hint', { opacity: 0, duration: 0.08 }, 0)
        .to('.hero-grad', { opacity: 0, duration: 0.4 }, 0.1)
        .to('.hero-noche', { scale: 3.4, duration: 0.62, ease: 'power2.in' }, 0.1)
        .fromTo('.hero-dentro', { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.56)
        .fromTo('.hero-nota', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.12 }, 0.78)
        .fromTo('.hero-flecha .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 0.14 }, 0.8)
        .to({}, { duration: 0.12 })
    })
    mm.add(MOB, () => {
      gsap.to('.hero-noche', { scale: 1.35, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-copy', { y: -40, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: el, start: '30% top', end: 'bottom top', scrub: true } })
    })
  }, [])

  // Entrada (cuando el iris del preloader se abre)
  useLayoutEffect(() => {
    if (!ready || prefersReduced()) return
    const mm = gsap.matchMedia(root.current)
    mm.add(MOTION, () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo('.hero-noche', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
        .from('.hero-word', { yPercent: 115, duration: 1.1, stagger: 0.07 }, 0.25)
        .fromTo('.hero-circulo .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 0.9, ease: 'power2.inOut' }, 0.9)
        .from('.hero-eyebrow, .hero-sub, .hero-btns, .hero-hint', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.6)
    })
    return () => mm.revert()
  }, [ready, root])

  return (
    <section id="inicio" ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-tinta" aria-label="Inicio">
      {/* Fachada → puerta → interior */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={asset('img/hero-noche.jpg')}
          alt="Casa Amiga al atardecer: cabaña de madera con luces cálidas, el letrero en la fachada, la puerta abierta y el husky de la casa recostado en la terraza"
          className="hero-noche absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 55%', transformOrigin: PUERTA }}
          fetchpriority="high"
        />
        <img
          src={asset('img/hero-interior.jpg')}
          alt="Interior de la galería: lámpara-hongo roja, ropa, plantas y repisas con productos"
          className="hero-dentro absolute inset-0 h-full w-full object-cover opacity-0 motion-reduce:hidden"
        />
        <div className="hero-grad pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(43,26,18,.88)_0%,rgba(43,26,18,.45)_38%,rgba(43,26,18,0)_65%),linear-gradient(to_right,rgba(43,26,18,.55)_0%,rgba(43,26,18,0)_55%)]" />
        <div className="hero-nota pointer-events-none absolute bottom-[10%] left-[6%] opacity-0 motion-reduce:hidden">
          <span aria-hidden="true" className="absolute -inset-x-10 -inset-y-12 -z-10 bg-[radial-gradient(closest-side,rgba(43,26,18,.7),transparent)]" />
          <p className="font-script text-[clamp(3rem,6vw,6rem)] leading-none text-white [text-shadow:0_2px_24px_rgba(43,26,18,.55)]">pasa, estás en casa</p>
          <svg className="hero-flecha ml-[40%] mt-2 h-20 w-40 text-ambar" viewBox="0 0 160 80" fill="none" aria-hidden="true">
            <path d="M6 8 C40 60 100 70 146 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="1" className="draw" />
            <path d="M128 40 L148 52 L130 66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw" />
          </svg>
        </div>
      </div>

      {/* Texto encima de la foto */}
      <div className="wrap absolute inset-x-0 bottom-0 z-10 pb-24 sm:pb-20 lg:pb-[9vh]">
        <div className="hero-copy max-w-[44rem]">
          <p className="hero-eyebrow eyebrow mb-5 !text-ambar">Galería de arte y diseño · Santa Elena</p>
          <h1 className="titulo text-white" style={{ fontSize: FS }}>
            {LINEAS.map((linea, i) => (
              <span key={i} className="block overflow-hidden pb-[0.04em]">
                {linea.map((w, j) => (
                  <span key={w} className={`hero-word relative inline-block ${j ? 'ml-[0.22em]' : ''}`}>
                    {w === 'casa.' ? (
                      <span className="relative inline-block"><span className="text-ambar">casa</span><span>.</span></span>
                    ) : w}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="relative">
            <svg className="hero-circulo pointer-events-none absolute text-white" style={{ left: '0.92em', bottom: '-0.04em', width: '2.55em', height: '1.2em', fontSize: FS }} viewBox="0 0 300 120" fill="none" aria-hidden="true">
              <path d="M250 18 C190 2 70 4 26 30 C-6 50 12 96 90 108 C170 118 280 104 292 66 C300 38 250 20 196 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" pathLength="1" className="draw" />
            </svg>
          </div>
          <p className="hero-sub mt-8 max-w-[34rem] text-lg text-white/90 sm:text-xl">
            Galería de arte y diseño en el corazón de Santa Elena. Obras, objetos y talleres de artistas locales, en una cabaña de madera en la Vereda El Placer.
          </p>
          <div className="hero-btns mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#galeria" onClick={(e) => { e.preventDefault(); scrollTo('#galeria') }} className="btn-ambar px-7 py-4 text-base">
                Ver la galería <Arrow />
              </a>
            </Magnetic>
            <a href="#camino" onClick={(e) => { e.preventDefault(); scrollTo('#camino') }} className="group btn border border-white/80 px-7 py-4 text-base text-white hover:bg-white hover:text-canela">
              Cómo llegar
            </a>
          </div>
        </div>
      </div>

      <p className="hero-hint cedula absolute bottom-5 right-4 z-10 text-white/85 sm:bottom-8 sm:right-8">
        Desliza para entrar <span aria-hidden="true">↓</span>
      </p>
    </section>
  )
}
