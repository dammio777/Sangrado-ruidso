import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReduced } from './motion'

let lenis = null

export function initScroll() {
  if (lenis || prefersReduced()) return
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export const getLenis = () => lenis

export function scrollTo(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' })
}

export function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
