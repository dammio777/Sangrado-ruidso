import { gsap, useMM, MOTION } from '../lib/motion'
import LogoIcon from './LogoIcon'

// [AJUSTAR CON EL DUEÑO]
const TEXTO = 'Casa Amiga existe para que el arte no se quede lejos. Aquí cuelgan obras de artistas de Santa Elena, se venden objetos hechos a mano y se aprende en talleres abiertos a todos. Entra, mira con calma, pregunta. Esta también es tu casa.'

/* 04 — Manifiesto que se "pinta" palabra por palabra + sello giratorio. */
export default function Manifiesto() {
  const palabras = TEXTO.split(' ')
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.mf-texto', start: 'top 78%', end: 'bottom 45%', scrub: 0.6 } })
      tl.fromTo('.mf-w', { opacity: 0.2 }, { opacity: 1, stagger: 0.1, ease: 'none' })
        .fromTo('.mf-circulo .draw', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 1.2, ease: 'power1.inOut' }, '-=1.4')
      gsap.from('.mf-sello', { scale: 0.6, opacity: 0, rotate: -60, duration: 1.2, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.mf-sello', start: 'top 85%' } })
    })
  }, [])

  return (
    <section ref={ref} id="manifiesto" className="bg-hueso py-24 sm:py-32 lg:py-44">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-9">
          <p className="eyebrow mb-8">04 — Manifiesto</p>
          <p className="mf-texto font-display text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.01em] text-tinta">
            {palabras.map((w, i) => {
              const esCasa = w === 'casa.'
              return (
                <span key={i} className="mf-w relative inline-block">
                  {esCasa ? (
                    <>
                      <span className="relative z-10">casa</span>.
                      <svg className="mf-circulo pointer-events-none absolute -left-[0.3em] -top-[0.28em] h-[1.55em] w-[3.6em] text-ambar" viewBox="0 0 300 120" fill="none" aria-hidden="true">
                        <path d="M250 18 C190 2 70 4 26 30 C-6 50 12 96 90 108 C170 118 280 104 292 66 C300 38 250 20 196 16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" pathLength="1" className="draw" />
                      </svg>
                    </>
                  ) : w}
                  {i < palabras.length - 1 && ' '}
                </span>
              )
            })}
          </p>
        </div>
        <div className="flex justify-center lg:col-span-3 lg:justify-end">
          <div className="mf-sello relative h-44 w-44 sm:h-52 sm:w-52">
            <div className="absolute inset-0 rounded-full bg-ambar" />
            <svg viewBox="0 0 200 200" className="girar absolute inset-0 h-full w-full text-tinta" aria-hidden="true">
              <defs><path id="sello-circulo" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
              <text className="font-mono" fontSize="13" fontWeight="500" fill="currentColor">
                <textPath href="#sello-circulo" textLength="458" lengthAdjust="spacing">ARTE · DISEÑO · AMOR Y AMISTAD ·</textPath>
              </text>
            </svg>
            <LogoIcon className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-canela sm:h-24 sm:w-24" strokeWidth={5} title="Ícono de Casa Amiga" />
          </div>
        </div>
      </div>
    </section>
  )
}
