import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { ScrollTrigger } from './lib/motion'
import { initScroll } from './lib/scroll'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Manifiesto from './components/Manifiesto'
import Camino from './components/Camino'
import Galeria from './components/Galeria'
import Artistas from './components/Artistas'
import Talleres from './components/Talleres'
import LaCasa from './components/LaCasa'
import Cifras from './components/Cifras'
import LibroVisitas from './components/LibroVisitas'
import Faq from './components/Faq'
import Ubicacion from './components/Ubicacion'
import CtaFinal from './components/CtaFinal'
import Formulario from './components/Formulario'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import Divider from './components/Divider'
import ScrollProgress from './components/ScrollProgress'
import { initEffects } from './lib/effects'

export default function App() {
  const [revealed, setRevealed] = useState(false) // el iris empezó a abrir: arranca el hero
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initScroll()
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    let off = () => {}
    let t
    const start = () => { off(); off = initEffects(); ScrollTrigger.refresh() }
    const onResize = () => { clearTimeout(t); t = setTimeout(() => { if (window.__w !== innerWidth) { window.__w = innerWidth; start() } }, 350) }
    window.__w = innerWidth
    const boot = setTimeout(start, 80)
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(boot); clearTimeout(t); off(); window.removeEventListener('resize', onResize); window.removeEventListener('load', refresh) }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#galeria" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ambar focus:px-4 focus:py-2">
        Saltar a la galería
      </a>
      {loading && <Preloader onReveal={() => setRevealed(true)} onDone={() => setLoading(false)} />}
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero ready={revealed} />
        <Marquee />
        <Manifiesto />
        <Divider />
        <Camino />
        <Divider />
        <Galeria />
        <Divider />
        <Artistas />
        <Divider />
        <Talleres />
        <Divider />
        <LaCasa />
        <Divider />
        <Cifras />
        <Divider />
        <LibroVisitas />
        <Divider />
        <Faq />
        <Divider />
        <Ubicacion />
        <CtaFinal />
        <Formulario />
      </main>
      <Footer />
      <WhatsAppFab />
    </MotionConfig>
  )
}
