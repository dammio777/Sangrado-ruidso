import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, useMM, DESK, MOB } from '../lib/motion'
import { PARADAS, asset, MAPS_DIR } from '../data'
import { Casita } from './LogoIcon'
import { Arrow, Close } from './Icons'
import { lockScroll } from '../lib/scroll'

/* Lienzo del camino (unidades SVG). La pista mide 6 × alto de pantalla => escala uniforme. */
const W = 6000, H = 1000
const STOPS = [[560, 700], [1500, 470], [2450, 720], [3400, 430], [4350, 690], [5420, 500]]
const PTS = [[-40, 820], ...STOPS, [6040, 560]]

function smooth(p) {
  let d = `M${p[0]}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1.map(Math.round)} ${c2.map(Math.round)} ${p2}`
  }
  return d
}
const CAMINO = smooth(PTS)

// pseudoaleatorio estable para montañas y pinos
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646 }

function Paisaje() {
  const { montes, pinos } = useMemo(() => {
    const r = rng(7)
    const montes = []
    for (let k = 0; k < 2; k++) {
      let d = `M0 ${330 + k * 70}`
      for (let x = 0; x <= W; x += 260) d += ` L${x + 130} ${180 + k * 80 + r() * 120} L${x + 260} ${320 + k * 70 + r() * 60}`
      montes.push(d)
    }
    const pinos = []
    for (let i = 0; i < 120; i++) {
      const x = r() * W, y = 470 + r() * 470, s = 0.6 + r() * 0.9
      if (STOPS.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 210)) continue
      pinos.push({ x, y, s })
    }
    return { montes, pinos }
  }, [])
  return (
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" className="text-canela/20">
      {montes.map((d) => <path key={d} d={d} />)}
      {pinos.map(({ x, y, s }, i) => (
        <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -60 L-18 -24 L-8 -24 L-24 4 L24 4 L8 -24 L18 -24 Z M0 4 V18" />
      ))}
    </g>
  )
}

function Pin({ p, i, vertical = false }) {
  if (p.casa) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative grid h-24 w-24 place-items-center rounded-full bg-ambar text-canela shadow-[0_20px_50px_-15px_rgba(180,96,14,.8)]">
          <span className="pin-destello absolute inset-0 rounded-full bg-ambar/50" />
          <Casita className="relative h-14 w-14" strokeWidth={9} />
        </div>
      </div>
    )
  }
  return (
    <div className={`flex flex-col items-center ${vertical ? '' : ''}`}>
      <div className="relative grid h-14 w-14 place-items-center rounded-full rounded-br-none border-2 border-canela bg-white font-mono text-sm font-medium text-canela [transform:rotate(45deg)]">
        <span className="[transform:rotate(-45deg)]">{p.n}</span>
      </div>
      <span className="mt-1 h-2 w-2 rounded-full bg-canela/40" />
    </div>
  )
}

function Encabezado({ className = '', abrir }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-4">05 — El camino a casa</p>
      <h2 className="titulo text-[clamp(2.6rem,5.2vw,5.4rem)] text-tinta">¿Cómo llegar<br />a Casa Amiga?</h2>
      <p className="mt-4 max-w-sm text-tinta/75">Desde El Silletero hasta la Vereda El Placer. Sigue la línea: te trae a casa.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => abrir(true)} className="btn-outline px-5 py-3 text-sm hover:bg-canela hover:text-white">
          Ver el mapa original
        </button>
        <a href={MAPS_DIR} target="_blank" rel="noreferrer" className="btn-ambar px-5 py-3 text-sm">Abrir en Google Maps <Arrow /></a>
      </div>
    </div>
  )
}

export default function Camino() {
  const [mapa, setMapa] = useState(false)
  const abrir = (v) => { setMapa(v); lockScroll(v) }

  const ref = useMM((mm, el) => {
    mm.add(DESK, () => {
      const track = el.querySelector('.cm-track')
      const dist = () => track.scrollWidth - window.innerWidth
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.cm-pin', start: 'top top', end: () => `+=${dist()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      })
      tl.to(track, { x: () => -dist(), duration: 1 }, 0)
        .fromTo('.cm-mask', { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, autoRound: false, duration: 1 }, 0)
        .fromTo('.cm-barra', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
        .to('.cm-head', { opacity: 0, y: -40, duration: 0.07 }, 0.1)
        .fromTo('.cm-mini', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.14)
      gsap.utils.toArray('.cm-parada', el).forEach((p, i) => {
        const at = Math.max(0.02, STOPS[i][0] / W - 0.06)
        tl.fromTo(p.querySelector('.cm-pin-in'), { y: -160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.06, ease: 'bounce.out' }, at)
          .fromTo(p.querySelector('.cm-label'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.04 }, at + 0.03)
      })
      tl.fromTo('.cm-final', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.05, ease: 'back.out(2)' }, 0.9)
        .fromTo('.pin-destello', { scale: 1, opacity: 0.8 }, { scale: 2.4, opacity: 0, duration: 0.08 }, 0.9)
    })
    mm.add(MOB, () => {
      gsap.fromTo('.cmv-linea', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.cmv-lista', start: 'top 70%', end: 'bottom 70%', scrub: true } })
      gsap.utils.toArray('.cmv-item', el).forEach((it) => {
        gsap.from(it.querySelector('.cm-pin-in'), { y: -50, opacity: 0, duration: 0.9, ease: 'bounce.out', scrollTrigger: { trigger: it, start: 'top 72%' } })
      })
    })
  }, [])


  return (
    <section ref={ref} id="camino" className="relative bg-hueso">
      {/* DESKTOP: scroll horizontal fijado */}
      <div className="cm-pin relative hidden h-[100svh] overflow-hidden lg:block motion-reduce:h-auto motion-reduce:overflow-x-auto">
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-canela/10">
          <div className="cm-barra h-full origin-left bg-ambar" />
        </div>
        <Encabezado abrir={abrir} className="cm-head wrap absolute inset-x-0 top-[13vh] z-10 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto" />
        <div className="cm-mini absolute bottom-8 left-12 z-10 flex items-center gap-4 rounded-full border border-canela/15 bg-white/90 py-2 pl-5 pr-2 opacity-0 backdrop-blur">
          <span className="cedula text-canela">05 — El camino a casa</span>
          <button type="button" onClick={() => abrir(true)} className="btn-ambar px-4 py-2 text-sm">Ver el mapa original</button>
        </div>
        <div className="cm-track relative h-[100svh] will-change-transform" style={{ width: `calc(100svh * ${W / H})` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
            <Paisaje />
            <defs>
              <mask id="cm-mascara" maskUnits="userSpaceOnUse" x="-100" y="0" width={W + 200} height={H}>
                <path d={CAMINO} stroke="#fff" strokeWidth="40" pathLength="1" className="cm-mask draw" fill="none" />
              </mask>
            </defs>
            <path d={CAMINO} stroke="var(--canela)" strokeOpacity=".12" strokeWidth="6" strokeDasharray="2 22" strokeLinecap="round" />
            <path d={CAMINO} stroke="var(--canela)" strokeWidth="7" strokeDasharray="2 20" strokeLinecap="round" mask="url(#cm-mascara)" />
          </svg>
          {PARADAS.map((p, i) => {
            const [x, y] = STOPS[i]
            const arriba = i % 2 === 1
            return (
              <div key={p.n} className="cm-parada absolute" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}>
                <div className="cm-pin-in absolute bottom-0 left-0 -translate-x-1/2"><Pin p={p} i={i} /></div>
                <div className={`cm-label absolute left-0 w-64 -translate-x-1/2 text-center ${arriba ? 'bottom-[7.5rem]' : 'top-6'} ${p.casa ? '!w-80' : ''}`}>
                  <p className="cedula text-ambar-oscuro">Parada {p.n}</p>
                  <p className={`titulo mt-1 text-canela ${p.casa ? 'text-5xl' : 'text-3xl'}`}>{p.nombre}</p>
                  <p className="mt-1 text-sm text-tinta/70">{p.nota}</p>
                </div>
                {p.casa && (
                  <p className="cm-final absolute bottom-[8.5rem] left-1/2 -translate-x-1/2 -rotate-6 whitespace-nowrap font-script text-7xl text-canela">¡Te esperamos!</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* MÓVIL: camino vertical que se dibuja al bajar */}
      <div className="wrap py-24 lg:hidden">
        <Encabezado abrir={abrir} />
        <ol className="cmv-lista relative mt-14 space-y-12 pl-2">
          <span aria-hidden="true" className="absolute bottom-6 left-9 top-6 w-0 border-l-[3px] border-dotted border-canela/15" />
          <span aria-hidden="true" className="cmv-linea absolute bottom-6 left-9 top-6 w-0 origin-top border-l-[3px] border-dotted border-canela" />
          {PARADAS.map((p, i) => (
            <li key={p.n} className="cmv-item relative flex items-center gap-6">
              <div className="cm-pin-in relative z-10 flex w-16 shrink-0 justify-center bg-hueso py-1"><Pin p={p} i={i} vertical /></div>
              <div>
                <p className="cedula text-ambar-oscuro">Parada {p.n}</p>
                <p className="titulo text-2xl text-canela">{p.nombre}</p>
                <p className="text-sm text-tinta/70">{p.nota}</p>
                {p.casa && <p className="mt-2 -rotate-3 font-script text-5xl text-canela">¡Te esperamos!</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence>
        {mapa && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-tinta/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => abrir(false)}
            role="dialog" aria-modal="true" aria-label="Mapa ilustrado original"
          >
            <motion.figure
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-white p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={asset('img/mapa-ilustrado.jpg')} alt="Mapa ilustrado a mano: ¿Cómo llegar a Casa Amiga? Desde El Silletero hasta Vereda El Placer" className="max-h-[78vh] w-full rounded-2xl object-contain" />
              <figcaption className="cedula px-2 pt-3 text-canela">Mapa ilustrado · Casa Amiga</figcaption>
              <button type="button" onClick={() => abrir(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-ambar text-tinta" aria-label="Cerrar mapa" autoFocus>
                <Close />
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
