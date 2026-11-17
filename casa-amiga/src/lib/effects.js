import SplitType from 'split-type'
import { gsap, ScrollTrigger, prefersReduced } from './motion'

/* Animaciones globales avanzadas:
   1) Títulos de sección: cada línea sube dentro de una máscara.
   2) Parallax suave en imágenes marcadas con data-parallax.
   3) Imágenes que se "descubren" con clip-path (data-reveal). */
export function initEffects() {
  if (prefersReduced()) return () => {}
  const splits = []
  const ctx = gsap.context(() => {
    document.querySelectorAll('main h2.titulo').forEach((h) => {
      if (h.closest('#cta, #camino')) return
      const sp = new SplitType(h, { types: 'lines,words' })
      sp.lines?.forEach((l) => { l.style.overflow = 'hidden'; l.style.paddingBottom = '0.06em' })
      splits.push(sp)
      gsap.from(sp.words, { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.07, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } })
    })
    document.querySelectorAll('[data-parallax]').forEach((img) => {
      const f = parseFloat(img.dataset.parallax) || 8
      gsap.fromTo(img, { yPercent: -f }, { yPercent: f, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0 round 20px)', scale: 1.08 }, { clipPath: 'inset(0 0 0% 0 round 20px)', scale: 1, duration: 1.3, ease: 'power4.out', clearProps: 'clipPath,scale', scrollTrigger: { trigger: el, start: 'top 90%' } })
    })
  })
  return () => { ctx.revert(); splits.forEach((s) => s.revert()) }
}
