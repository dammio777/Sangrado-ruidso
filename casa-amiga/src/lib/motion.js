import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const MOTION = '(prefers-reduced-motion: no-preference)'
export const DESK = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
export const MOB = '(max-width: 1023px) and (prefers-reduced-motion: no-preference)'

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Dibuja trazos SVG (paths con pathLength="1" y clase .draw). */
export const drawFrom = { strokeDashoffset: 1.05 }
export const drawTo = { strokeDashoffset: 0, autoRound: false }
export function draw(targets, vars = {}) {
  return gsap.fromTo(targets, drawFrom, { ...drawTo, ease: 'power2.inOut', ...vars })
}

/**
 * Hook de animación con gsap.matchMedia acotado a un elemento.
 * El estado oculto inicial SIEMPRE lo pone GSAP: con reduced-motion todo queda visible y estático.
 */
export function useMM(setup, deps = []) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(ref.current)
    setup(mm, ref.current)
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

export { gsap, ScrollTrigger }
