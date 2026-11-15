import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { scrollTo, lockScroll } from '../lib/scroll'
import LogoIcon from './LogoIcon'
import { INSTAGRAM, INSTAGRAM_URL } from '../data'

const LINKS = [
  { href: '#galeria', label: 'Galería' },
  { href: '#artistas', label: 'Artistas' },
  { href: '#talleres', label: 'Talleres' },
  { href: '#visitanos', label: 'Visítanos' },
]

export function Marca({ className = '', claro = false }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ambar text-canela">
        <LogoIcon className="h-7 w-7" strokeWidth={7} />
      </span>
      <span className={`font-script text-[1.9rem] leading-none ${claro ? 'text-white' : 'text-canela'}`}>Casa Amiga</span>
    </span>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > 240 && y > last.current + 2)
      if (y < last.current - 2) setHidden(false)
      last.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    lockScroll(open)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => scrollTo(href), open ? 350 : 0)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
          hidden && !open ? '-translate-y-[130%]' : 'translate-y-0'
        }`}
      >
        <nav
          aria-label="Principal"
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            scrolled
              ? 'mt-3 max-w-5xl rounded-full border border-canela/15 bg-white/85 py-2 pl-3 pr-2 shadow-[0_10px_40px_-20px_rgba(43,26,18,.35)] backdrop-blur-md sm:mx-auto'
              : 'mt-0 max-w-site px-4 py-5 sm:px-8 lg:px-12'
          } ${scrolled ? 'mx-3' : ''}`}
        >
          <a href="#inicio" onClick={(e) => go(e, '#inicio')} aria-label="Casa Amiga — inicio">
            <Marca claro={open && !scrolled} />
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)} className="group relative px-4 py-2 font-medium text-tinta">
                  {l.label}
                  <svg className="hover-line absolute inset-x-3 -bottom-0.5 h-2 w-[calc(100%-1.5rem)] text-ambar" viewBox="0 0 100 8" preserveAspectRatio="none" fill="none" aria-hidden="true">
                    <path d="M2 5 C30 1 70 7 98 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" pathLength="1" className="draw" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href="#formulario" onClick={(e) => go(e, '#formulario')} className="btn-ambar hidden px-5 py-2.5 text-sm sm:inline-flex">
              Agendar visita
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className={`relative z-[60] grid h-11 w-11 place-items-center rounded-full lg:hidden ${open ? 'bg-ambar' : 'bg-canela'}`}
            >
              <span className={`absolute h-0.5 w-5 rounded transition-all duration-300 ${open ? 'rotate-45 bg-tinta' : '-translate-y-1 bg-white'}`} />
              <span className={`absolute h-0.5 w-5 rounded transition-all duration-300 ${open ? '-rotate-45 bg-tinta' : 'translate-y-1 bg-white'}`} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-canela px-6 pb-10 pt-28 text-white lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <ul className="space-y-2">
              {[...LINKS, { href: '#formulario', label: 'Agendar visita' }].map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="relative inline-block py-1 titulo text-[clamp(3rem,15vw,5.5rem)]"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {l.label}
                    <svg className="absolute -bottom-1 left-0 h-3 w-full text-ambar" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" aria-hidden="true">
                      <motion.path
                        d="M2 6 C25 2 60 9 98 4"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.45 + i * 0.07, duration: 0.7, ease: 'easeInOut' }}
                      />
                    </svg>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div className="flex items-end justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} exit={{ opacity: 0 }}>
              <p className="cedula text-white/70">Vereda El Placer<br />Santa Elena · Medellín</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="cedula text-ambar">@{INSTAGRAM}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
