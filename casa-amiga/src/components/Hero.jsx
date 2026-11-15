import { useLayoutEffect, useRef } from 'react'
import { gsap, useMM, DESK, MOB, MOTION, prefersReduced } from '../lib/motion'
import { scrollTo } from '../lib/scroll'
import { asset } from '../data'
import Magnetic from './Magnetic'
import { Arrow } from './Icons'

const LINEAS = [['Arte', 'que'], ['se', 'siente'], ['en', 'casa.']]

/* 02 — HERO con efecto estrella "La puerta se abre". */
export default function Hero({ ready }) {
  const copy = useRef(null)

  // Scroll: pin + scrub (desktop) / zoom corto (móvil)
  const root = useMM((mm, el) => {
    mm.add(DESK, () => {
      const card = el.querySelector('.hero-card')
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=210%', scrub: 1, pin: true, anticipatePin: 1 },
      })
      tl.to('.hero-copy', { xPercent: -18, opacity: 0, duration: 0.25 }, 0)
        .to('.hero-hint', { opacity: 0, duration: 0.08 }, 0)
        .to('.hero-trazo', { opacity: 0, duration: 0.12 }, 0)
        .to(card, { top: 0, right: 0, bottom: 0, width: '100vw', borderRadius: 0, duration: 0.35, ease: 'power2.inOut' }, 0)
        .to('.hero-tag', { opacity: 0, duration: 0.1 }, 0.05)
        .to('.hero-noche', { scale: 3.6, duration: 0.6, ease: 'power2.in' }, 0.12)
        .fromTo('.hero-dentro', { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.55)
        .fromTo('.hero-nota', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.12 }, 0.78)
        .fromTo('.hero-flecha .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 0.14 }, 0.8)
        .to({}, { duration: 0.12 })
      return () => gsap.set(card, { clearProps: 'all' })
    })
    mm.add(MOB, () => {
      gsap.fromTo('.hero-noche', { scale: 1 }, {
        scale: 1.6, ease: 'none',
        scrollTrigger: { trigger: '.hero-card', start: 'top 70%', end: 'bottom top', scrub: true },
      })
    })
  }, [])

  // Entrada (cuando el iris del preloader se abre)
  useLayoutEffect(() => {
    if (!ready || prefersReduced()) return
    const mm = gsap.matchMedia(root.current)
    mm.add(MOTION, () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.from('.hero-word', { yPercent: 115, duration: 1.1, stagger: 0.07 }, 0.05)
        .fromTo('.hero-circulo .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 0.9, ease: 'power2.inOut' }, 0.7)
        .from('.hero-sub, .hero-btns, .hero-hint', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5)
        .fromTo('.hero-card-in', { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, 0.15)
        .fromTo('.hero-trazo .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 1.4, ease: 'power2.inOut', stagger: 0.15 }, 0.6)
    })
    return () => mm.revert()
  }, [ready, root])

  return (
    <section id="inicio" ref={root} className="relative overflow-hidden bg-blanco lg:h-[100svh] lg:min-h-[680px]" aria-label="Inicio">
      <div ref={copy} className="wrap relative z-10 grid pt-28 lg:h-full lg:grid-cols-12 lg:items-center lg:pt-16">
        <div className="hero-copy lg:col-span-7 xl:col-span-6">
          <p className="eyebrow mb-6">Galería de arte y diseño · Santa Elena</p>
          <h1 className="titulo text-[clamp(3.5rem,8.4vw,10rem)] text-tinta">
            {LINEAS.map((linea, i) => (
              <span key={i} className="block overflow-hidden pb-[0.04em]">
                {linea.map((w, j) => {
                  const esCasa = w === 'casa.'
                  return (
                    <span key={w} className={`hero-word relative inline-block ${j ? 'ml-[0.22em]' : ''}`}>
                      {esCasa ? (
                        <span className="relative inline-block">
                          <span className="text-ambar [-webkit-text-stroke:1.5px_var(--canela)] [paint-order:stroke_fill]">casa</span>
                          <span>.</span>
                        </span>
                      ) : (
                        w
                      )}
                    </span>
                  )
                })}
              </span>
            ))}
          </h1>
          {/* trazo manuscrito que rodea "CASA" (fuera del overflow para que no se corte) */}
          <div className="relative">
            <svg
              className="hero-circulo pointer-events-none absolute text-canela"
              style={{ left: '0.92em', bottom: '-0.04em', width: '2.55em', height: '1.2em', fontSize: 'clamp(3.5rem,8.4vw,10rem)' }}
              viewBox="0 0 300 120"
              fill="none"
              aria-hidden="true"
            >
              <path d="M250 18 C190 2 70 4 26 30 C-6 50 12 96 90 108 C170 118 280 104 292 66 C300 38 250 20 196 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" pathLength="1" className="draw" />
            </svg>
          </div>
          <p className="hero-sub mt-8 max-w-[34rem] text-lg text-tinta/80 sm:text-xl">
            Galería de arte y diseño en el corazón de Santa Elena. Obras, objetos y talleres de artistas locales, en una cabaña de madera en la Vereda El Placer.
          </p>
          <div className="hero-btns mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#galeria" onClick={(e) => { e.preventDefault(); scrollTo('#galeria') }} className="btn-ambar px-7 py-4 text-base">
                Ver la galería <Arrow />
              </a>
            </Magnetic>
            <a href="#camino" onClick={(e) => { e.preventDefault(); scrollTo('#camino') }} className="group btn-outline px-7 py-4 text-base">
              Cómo llegar
              <svg className="hover-line absolute inset-0 h-full w-full overflow-visible text-canela" viewBox="0 0 200 56" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M28 2 H172 A26 26 0 0 1 172 54 H28 A26 26 0 0 1 28 2" stroke="currentColor" strokeWidth="2" pathLength="1" className="draw" vectorEffect="non-scaling-stroke" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Tarjeta de la fachada → la puerta → el interior */}
      <div className="hero-card relative z-0 mx-4 mt-12 aspect-[4/5] overflow-hidden rounded-[28px] sm:mx-8 lg:absolute lg:bottom-[9vh] lg:right-[4vw] lg:top-[15vh] lg:mx-0 lg:mt-0 lg:aspect-auto lg:w-[38vw]">
        <div className="hero-card-in absolute inset-0 overflow-hidden rounded-[inherit] bg-tinta">
          <img
            src={asset('img/fachada-noche.jpg')}
            alt="Fachada de madera de Casa Amiga de noche, con luces cálidas y el perro de la casa en la entrada"
            className="hero-noche absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: '50% 52%', transformOrigin: '50% 52%' }}
            fetchpriority="high"
          />
          <img
            src={asset('img/interior.jpg')}
            alt="Interior de la galería: repisas con plantas, objetos y la lámpara-hongo roja"
            className="hero-dentro absolute inset-0 h-full w-full object-cover opacity-0 motion-reduce:hidden"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tinta/50 via-transparent to-transparent" />
          <p className="hero-tag cedula absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-canela">Fachada · Vereda El Placer</p>
          <div className="hero-nota pointer-events-none absolute bottom-[14%] left-[8%] opacity-0 motion-reduce:hidden">
            <p className="font-script text-[clamp(3rem,6vw,6rem)] leading-none text-white [text-shadow:0_2px_24px_rgba(43,26,18,.55)]">pasa, estás en casa</p>
            <svg className="hero-flecha ml-[40%] mt-2 h-20 w-40 text-ambar" viewBox="0 0 160 80" fill="none" aria-hidden="true">
              <path d="M6 8 C40 60 100 70 146 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="1" className="draw" />
              <path d="M128 40 L148 52 L130 66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw" />
            </svg>
          </div>
        </div>
      </div>
      {/* contorno de la casa (mismo trazo del logo) dibujado sobre la tarjeta en desktop */}
      <svg
        className="hero-trazo pointer-events-none absolute bottom-[9vh] right-[4vw] top-[15vh] hidden w-[38vw] overflow-visible text-canela lg:block"
        viewBox="0 0 86 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M-4 6 L40 -11 C42 -12 44 -12 46 -11 L90 6" stroke="currentColor" strokeWidth=".45" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw" />
        <path d="M-2.5 9 V104 H88.5 V9" stroke="currentColor" strokeWidth=".3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw" />
      </svg>

      <p className="hero-hint cedula wrap mt-6 pb-10 text-canela lg:absolute lg:bottom-8 lg:left-0 lg:mt-0 lg:w-auto lg:pb-0">
        Desliza para entrar <span aria-hidden="true">↓</span>
      </p>
    </section>
  )
}
