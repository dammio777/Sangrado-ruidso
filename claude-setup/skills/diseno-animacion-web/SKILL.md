---
name: diseno-animacion-web
description: Úsala al diseñar o animar cualquier sección de un sitio web (hero, scroll storytelling, galerías, carta, transiciones, micro-interacciones) con gsap + ScrollTrigger, lenis y framer-motion en React. Da dirección de arte nivel agencia, patrones de código probados, rendimiento y accesibilidad.
---

# Diseño y animación web nivel agencia

## Dirección de arte (antes de animar)
- **Jerarquía:** un protagonista por pantalla. Titulares display grandes (clamp 3–9rem), texto 16–18px, mucho aire.
- **Grid:** 12 columnas en desktop, 4 en móvil; rompe la grilla a propósito solo en momentos clave.
- **Tipografía:** máx. 2 familias. Tracking negativo en display (`tracking-tight`), interlineado 0.9–1.05 en titulares.
- **Color:** 1 acento fuerte, resto neutros del concepto. Fondos con textura sutil (grano, papel) si el concepto lo pide.
- **Fotografía:** encuadres cerrados de comida, luz cálida, recortes con `object-cover` y `aspect-*` consistentes.
- **Movimiento con intención:** cada animación cuenta algo (revelar, guiar, dar peso). Si no aporta, se quita.

## Ritmo y easing
| Uso | Duración | Ease |
|---|---|---|
| Micro-interacción (hover, botón) | 0.2–0.3 s | `power2.out` / spring suave |
| Entrada de elemento | 0.6–0.9 s | `power3.out` / `expo.out` |
| Titular por líneas | 0.8–1.2 s, stagger 0.08 | `power4.out` |
| Scroll scrub | ligado al scroll | `none` |
Nunca animes más de 3–4 cosas a la vez en pantalla.

## Reparto de responsabilidades
- **lenis:** scroll suave global (una sola instancia).
- **gsap + ScrollTrigger:** todo lo ligado al scroll (pin, scrub, parallax, timelines de secciones).
- **framer-motion:** estado de UI en React (hover, menú, modales, `AnimatePresence`, layout, transiciones de ruta).
No mezcles gsap y framer-motion sobre el mismo elemento y la misma propiedad.

## Setup base (`src/lib/motion.js`)
```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll() {
  if (reduceMotion) return null
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
```
En React usa `@gsap/react` (`npm i @gsap/react`) y `useGSAP(() => {...}, { scope: ref })`: limpia solo al desmontar.

## Patrones listos
**Revelado de titular por líneas (máscara):**
```jsx
// Cada línea en <span class="block overflow-hidden"><span class="line block">...</span></span>
useGSAP(() => {
  if (reduceMotion) return
  gsap.from('.line', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.08 })
}, { scope: ref })
```
**Entrada al hacer scroll (batch, eficiente):**
```js
ScrollTrigger.batch('.reveal', {
  start: 'top 85%',
  onEnter: (els) => gsap.from(els, { y: 40, autoAlpha: 0, stagger: 0.1, ease: 'power3.out' }),
  once: true,
})
```
**Hero con pin + scrub (imagen que escala):**
```js
gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: true, pin: true } })
  .to('.hero-img', { scale: 1.15, ease: 'none' })
  .to('.hero-title', { yPercent: -30, autoAlpha: 0, ease: 'none' }, 0)
```
**Galería horizontal en desktop, vertical en móvil:**
```js
ScrollTrigger.matchMedia({
  '(min-width: 1024px)': () => {
    const track = document.querySelector('.track')
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth), ease: 'none',
      scrollTrigger: { trigger: '.gallery', pin: true, scrub: 1, end: () => '+=' + track.scrollWidth, invalidateOnRefresh: true },
    })
  },
})
```
**Botón magnético / hover con framer-motion:**
```jsx
<motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}>Reservar</motion.a>
```
**Menú / modal:** `AnimatePresence` + `initial/animate/exit` con opacidad y `y`, bloquea scroll con `lenis.stop()` / `lenis.start()`.

## Rendimiento
- Anima solo `transform` y `opacity` (`x`, `y`, `scale`, `rotate`, `autoAlpha`). Nunca `top/left/width/height`.
- `will-change` solo durante la animación; no en todo el sitio.
- Pins y scrubs pesados solo en `min-width: 1024px`; en móvil, revelados simples.
- `ScrollTrigger.refresh()` tras cargar imágenes/fuentes si cambian alturas.
- Sin `markers: true` en producción.
- Meta: 60 fps en un Android de gama media; revisa con Performance de DevTools en CPU 4x.

## Accesibilidad
- `prefers-reduced-motion`: sin Lenis, sin pin/scrub/parallax; contenido visible sin animación (nunca dejes elementos en `opacity: 0` si JS no corre).
- Foco visible en todos los interactivos; no animes el foco fuera de pantalla.
- Nada parpadea más de 3 veces por segundo.

## Verificación
Con el MCP de Playwright: captura móvil (iPhone 13) y desktop (1440px), prueba `emulateMedia({ reducedMotion: 'reduce' })` y revisa la consola sin errores.
