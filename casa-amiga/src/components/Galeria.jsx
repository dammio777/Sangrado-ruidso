import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { CATEGORIAS, OBRAS, ARTISTAS, asset, wa } from '../data'
import { ScrollTrigger, finePointer, prefersReduced } from '../lib/motion'
import { lockScroll } from '../lib/scroll'
import { Close, WhatsAppIcon } from './Icons'

const artista = (id) => ARTISTAS.find((a) => a.id === id)
const precio = (o) => (o.precio == null ? 'Precio a consultar' : `$ ${o.precio.toLocaleString('es-CO')} COP`)
const ESC = [0, 2, 1, 3, 0, 2] // alturas de "colgado" para que la pared respire

function Cedula({ o, abierta }) {
  return (
    <div className="mt-5 border-l-2 border-canela/70 pl-3">
      <p className="cedula text-canela">Obra {o.n} · {artista(o.artistaId)?.nombre}</p>
      <p className="mt-0.5 font-display text-xl font-bold leading-tight text-tinta">{o.titulo}</p>
      <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100 ${abierta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100'}`}>
        <p className="cedula overflow-hidden text-tinta/70">
          {o.tecnica && <span className="block pt-1.5">{o.tecnica}</span>}
          <span className="block">{[o.medidas, precio(o)].filter(Boolean).join(' · ')}</span>
        </p>
      </div>
    </div>
  )
}

function Modal({ o, onClose }) {
  const box = useRef(null)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  useEffect(() => {
    lockScroll(true)
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { lockScroll(false); window.removeEventListener('keydown', esc) }
  }, [onClose])
  const move = (e) => {
    const r = box.current.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const a = artista(o.artistaId)
  const msg = `¡Hola Casa Amiga! Me interesa la obra "${o.titulo}" de ${a?.nombre} (Obra ${o.n}). ¿Me cuentan precio y disponibilidad?`
  return (
    <motion.div className="fixed inset-0 z-[80] overflow-y-auto bg-white/95 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={o.titulo} data-lenis-prevent>
      <button type="button" onClick={onClose} className="fixed right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-ambar text-tinta sm:right-8 sm:top-8" aria-label="Cerrar obra" autoFocus>
        <Close />
      </button>
      <div className="mx-auto grid min-h-full max-w-site items-center gap-10 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <div
            ref={box}
            className="relative mx-auto max-h-[80vh] overflow-hidden bg-hueso shadow-[0_40px_80px_-30px_rgba(43,26,18,.5)]"
            onMouseEnter={() => finePointer() && setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={move}
            style={{ cursor: zoom ? 'zoom-in' : 'default' }}
          >
            <div className="transition-transform duration-300 ease-out" style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}>
              <motion.img
                layoutId={`obra-${o.id}`}
                src={asset(o.img)}
                alt={o.titulo}
                className="mx-auto max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
          <p className="cedula mt-3 text-center text-tinta/50 [@media(hover:none)]:hidden">Mueve el cursor sobre la obra para ver el detalle</p>
        </div>
        <motion.div className="lg:col-span-5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }} exit={{ opacity: 0 }}>
          <p className="eyebrow">Obra {o.n} · {CATEGORIAS.find((c) => c.id === o.categoria)?.label}</p>
          <h3 className="titulo mt-3 text-[clamp(2.6rem,5vw,4.5rem)] text-tinta">{o.titulo}</h3>
          <p className="mt-2 text-lg text-canela">{a?.nombre} — {a?.disciplina}</p>
          <dl className="cedula mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-canela/20 py-5 text-tinta/80">
            <dt className="text-canela">Artista</dt><dd>{a?.nombre}</dd>
            {o.tecnica && <><dt className="text-canela">Técnica</dt><dd>{o.tecnica}</dd></>}
            {o.medidas && <><dt className="text-canela">Medidas</dt><dd>{o.medidas}</dd></>}
            <dt className="text-canela">Precio</dt><dd>{precio(o)}</dd>
          </dl>
          <p className="mt-6 text-tinta/80">{o.descripcion}</p>
          <a href={wa(msg)} target="_blank" rel="noreferrer" className="btn-ambar mt-8 px-7 py-4">
            <WhatsAppIcon className="h-5 w-5" /> Me interesa esta obra
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* 06 — LA GALERÍA (sala virtual) */
export default function Galeria() {
  const [filtro, setFiltro] = useState('todo')
  const [abierta, setAbierta] = useState(null)
  const sala = useRef(null)

  useEffect(() => {
    const on = (e) => setFiltro(e.detail)
    window.addEventListener('casa:filtro', on)
    return () => window.removeEventListener('casa:filtro', on)
  }, [])
  useEffect(() => { const t = setTimeout(() => ScrollTrigger.refresh(), 650); return () => clearTimeout(t) }, [filtro])

  const obras = useMemo(() => {
    if (filtro === 'todo') {
      return CATEGORIAS.slice(1).map((c) => OBRAS.find((o) => o.categoria === c.id && o.destacada) || OBRAS.find((o) => o.categoria === c.id)).filter(Boolean).slice(0, 5)
    }
    if (filtro.startsWith('artista:')) return OBRAS.filter((o) => o.artistaId === filtro.slice(8))
    return OBRAS.filter((o) => o.categoria === filtro)
  }, [filtro])

  // Luz de galería: la sombra se mueve en contra del cursor
  const luz = (e) => {
    if (!finePointer() || prefersReduced()) return
    const r = sala.current.getBoundingClientRect()
    sala.current.style.setProperty('--lx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    sala.current.style.setProperty('--ly', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }
  const artistaFiltro = filtro.startsWith('artista:') ? artista(filtro.slice(8)) : null
  const obraAbierta = OBRAS.find((o) => o.id === abierta)

  return (
    <section id="galeria" ref={sala} onMouseMove={luz} className="relative overflow-hidden bg-blanco py-24 sm:py-32" style={{ '--lx': 0, '--ly': -0.4 }}>
      {/* luz cenital */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(251,246,238,1),rgba(255,255,255,0))]" />
      <div className="wrap relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-4">06 — La galería</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">La sala</h2>
            <p className="mt-4 max-w-md text-tinta/75">Obras, objetos y plantas que hoy cuelgan en la casa. Toca una obra para verla de cerca.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar obras">
            {CATEGORIAS.map((c) => {
              const on = filtro === c.id
              return (
                <button key={c.id} type="button" onClick={() => setFiltro(c.id)} aria-pressed={on}
                  className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? 'border-tinta text-tinta' : 'border-canela/20 text-tinta/70 hover:border-canela/60'}`}>
                  {on && <motion.span layoutId="filtro-activo" className="absolute inset-0 -z-0 rounded-full bg-ambar" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className="relative">{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        {artistaFiltro && (
          <p className="cedula mt-6 text-canela">
            Mostrando obras de {artistaFiltro.nombre} ·{' '}
            <button type="button" className="underline underline-offset-4" onClick={() => setFiltro('todo')}>ver todo</button>
          </p>
        )}
        {filtro === 'todo' && <p className="cedula mt-6 text-tinta/50">Una obra destacada por sala · elige una categoría para ver más</p>}

        <LayoutGroup>
          <motion.ul layout className="mt-12 grid items-start gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
            <AnimatePresence mode="popLayout">
              {obras.map((o, i) => (
                <motion.li
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  className="lg:[margin-top:var(--mt)]"
                  style={{ '--mt': `${ESC[i % ESC.length] * 2.5}rem` }}
                >
                  <button type="button" onClick={() => setAbierta(o.id)} className="group block w-full text-left" data-cursor="ver" aria-label={`Ver ${o.titulo} de ${artista(o.artistaId)?.nombre}`}>
                    {/* hilo de colgar */}
                    <svg aria-hidden="true" viewBox="0 0 120 28" className="mx-auto -mb-px block h-7 w-32 text-canela/40" fill="none"><path d="M8 27 L60 3 L112 27" stroke="currentColor" strokeWidth="1" /><circle cx="60" cy="3" r="2.5" fill="currentColor" /></svg>
                    <span
                      className="block bg-white p-3 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] [box-shadow:calc(var(--lx)*-16px)_calc(14px+var(--ly)*-8px)_34px_-14px_rgba(43,26,18,.38)] group-hover:scale-[1.03] group-hover:[box-shadow:calc(var(--lx)*-28px)_calc(26px+var(--ly)*-12px)_60px_-18px_rgba(43,26,18,.5)]"
                    >
                      <span className="block aspect-[4/5] overflow-hidden bg-hueso">
                        <motion.img layoutId={`obra-${o.id}`} src={asset(o.img)} alt={o.titulo} loading="lazy" className="h-full w-full object-cover" />
                      </span>
                    </span>
                    <Cedula o={o} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          <AnimatePresence>{obraAbierta && <Modal o={obraAbierta} onClose={() => setAbierta(null)} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
