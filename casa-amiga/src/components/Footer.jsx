import { gsap, useMM, MOTION } from '../lib/motion'
import { scrollTo } from '../lib/scroll'
import { DIRECCION, INSTAGRAM, INSTAGRAM_URL, wa } from '../data'
import LogoIcon from './LogoIcon'
import { InstagramIcon, WhatsAppIcon } from './Icons'

const LINKS = [['#galeria', 'Galería'], ['#artistas', 'Artistas'], ['#talleres', 'Talleres'], ['#camino', 'Cómo llegar'], ['#visitanos', 'Visítanos'], ['#formulario', 'Agendar visita']]

/* 16 — FOOTER */
export default function Footer() {
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.ft-firma', start: 'top 95%' } })
      tl.fromTo('.ft-firma text', { strokeDashoffset: 1600, fillOpacity: 0 }, { strokeDashoffset: 0, autoRound: false, duration: 2.4, ease: 'power2.inOut' })
        .to('.ft-firma text', { fillOpacity: 1, duration: 0.8 }, '-=0.6')
    })
  }, [])
  return (
    <footer ref={ref} className="overflow-hidden bg-canela text-white">
      <div className="wrap grid gap-12 pb-10 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-16 w-16 text-white" strokeWidth={5} title="Casa Amiga" />
            <span className="font-script text-5xl leading-none">Casa Amiga</span>
          </div>
          <p className="mt-6 max-w-sm text-white/80">Somos una galería de arte y diseño ubicada en el corazón de Santa Elena.</p>
          <a href={wa('¡Hola Casa Amiga!')} target="_blank" rel="noreferrer" className="btn-ambar mt-8 px-6 py-3.5"><WhatsAppIcon className="h-5 w-5" /> Escríbenos</a>
        </div>
        <nav aria-label="Pie de página" className="lg:col-span-3">
          <p className="cedula mb-4 text-ambar">Navegar</p>
          <ul className="space-y-2">
            {LINKS.map(([h, t]) => (
              <li key={h}><a href={h} onClick={(e) => { e.preventDefault(); scrollTo(h) }} className="text-white/85 transition-colors hover:text-ambar">{t}</a></li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-4">
          <p className="cedula mb-4 text-ambar">Encuéntranos</p>
          <address className="not-italic text-white/85">{DIRECCION.linea1}<br />{DIRECCION.linea2}</address>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-white/85 transition-colors hover:text-ambar">
            <InstagramIcon /> @{INSTAGRAM}
          </a>
        </div>
      </div>
      <div className="wrap">
        <svg className="ft-firma w-full" viewBox="0 0 1000 268" aria-label="Casa Amiga" role="img">
          <text x="500" y="178" textAnchor="middle" fontFamily="Allura, cursive" fontSize="215" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeDasharray="1600" style={{ strokeDashoffset: 0 }}>Casa Amiga</text>
        </svg>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-white/15 py-6 text-sm text-white/70 sm:flex-row sm:justify-between">
        <p>© 2026 Casa Amiga — Galería de arte y diseño. Vereda El Placer, Santa Elena, Medellín.</p>
        <p className="cedula">Hecho con amor y amistad</p>
      </div>
    </footer>
  )
}
