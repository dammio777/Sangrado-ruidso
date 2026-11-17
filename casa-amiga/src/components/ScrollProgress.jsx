import { gsap, ScrollTrigger, useMM, MOTION } from '../lib/motion'

/* Barra ámbar fina arriba que avanza con el scroll de toda la página. */
export default function ScrollProgress() {
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      gsap.to('.sp-bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } })
    })
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="sp-bar h-full origin-left scale-x-0 bg-ambar" />
    </div>
  )
}
