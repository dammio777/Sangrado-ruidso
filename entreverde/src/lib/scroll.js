import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ui } from './store.js';
import { reducido } from './util.js';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export let lenis = null;
export const velocidad = { v: 0 };

export function iniciarScroll() {
  const desktop = matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
  if (desktop && !reducido()) {
    lenis = new Lenis({ duration: 1.0, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', (l) => { velocidad.v = l.velocity || 0; ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let last = scrollY, lt = performance.now();
    addEventListener('scroll', () => {
      const now = performance.now();
      velocidad.v = ((scrollY - last) / Math.max(1, now - lt)) * 16;
      last = scrollY; lt = now;
    }, { passive: true });
  }
  // Lenis se pausa solo mientras haya un modal o el panel abierto.
  let prev = false;
  ui.sub(() => {
    const u = ui.get();
    const bloqueado = u.panel || u.modales > 0 || u.menu;
    if (bloqueado === prev) return;
    prev = bloqueado;
    if (lenis) (bloqueado ? lenis.stop() : lenis.start());
    document.documentElement.classList.toggle('modal-abierto', bloqueado);
  });
}

export function irA(id) {
  const el = typeof id === 'string' ? document.getElementById(id.replace('#', '')) : id;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -88 });
  else {
    const y = el.getBoundingClientRect().top + scrollY - 80;
    scrollTo({ top: y, behavior: reducido() ? 'auto' : 'smooth' });
  }
}
