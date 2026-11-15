import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis = null;
export const getLenis = () => lenis;

export function initSmoothScroll() {
  if (prefersReducedMotion() || lenis) return lenis;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** Ir a un ancla (respeta Lenis o scroll nativo). */
export function scrollToId(id, { offset = 0, immediate = false } = {}) {
  const el = typeof id === 'string' ? document.querySelector(id) : id;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, immediate, duration: 1.6 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}

/** Hora del día "simulada" según el progreso del scroll de toda la página. */
export function scrollClock(progress) {
  const start = 16 * 60, end = 21 * 60 + 30;
  const m = Math.round(start + (end - start) * Math.min(1, Math.max(0, progress)));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
