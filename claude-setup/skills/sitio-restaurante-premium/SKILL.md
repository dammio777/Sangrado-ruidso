---
name: sitio-restaurante-premium
description: Úsala al crear, rediseñar o arrancar el sitio web de un restaurante, café o negocio gastronómico (Artesano, SOUL, CandeLatte & Frida u otro cliente en Santa Elena/Medellín). Define stack fijo, concepto creativo, paleta, tipografías, animaciones, SEO y los datos que hay que pedirle al cliente.
---

# Sitio premium para restaurante

## 0. Antes de escribir código: datos del cliente
Pide (o confirma) SIEMPRE esta lista. Si falta algo, deja un placeholder marcado `TODO-CLIENTE` y lístalo al final.
- Nombre comercial exacto y logo (SVG si existe)
- Dirección exacta + link de Google Maps
- Horarios por día (incluye festivos)
- WhatsApp (formato `57XXXXXXXXXX`) y mensaje prellenado
- Instagram / TikTok / Facebook
- Link de la carta (PDF, web o fotos) o la carta completa
- Precios (o rango de precios)
- Zonas y costo de domicilio, apps de domicilio (Rappi, etc.)
- Reservas: cómo se hacen (WhatsApp, formulario, plataforma) y capacidad
- Fotos reales del lugar, platos y equipo (nada de stock si hay reales)
- Dominio deseado y si ya lo tienen comprado

## 1. Concepto creativo propio
Cada cliente tiene un concepto único; nunca reciclar el de otro. Antes de codear escribe en `CONCEPTO.md`:
- Idea central en una frase (ej. "fogón de montaña al amanecer")
- Paleta: 4–6 colores con hex y rol (fondo, texto, acento, apoyo). Contraste AA mínimo.
- Tipografías: display + texto (Google Fonts o self-hosted), pesos usados.
- Lenguaje de movimiento: qué se anima, ritmo, easing.
Lleva paleta y fuentes a `tailwind.config` (`theme.extend.colors`, `fontFamily`) desde el inicio.

## 2. Stack fijo
```bash
npm create vite@latest <cliente> -- --template react
cd <cliente> && npm i gsap lenis framer-motion
npm i -D tailwindcss @tailwindcss/vite
```
- Tailwind v4 vía plugin `@tailwindcss/vite` (o la versión que ya use el proyecto).
- `gsap` + `ScrollTrigger` para scroll; `lenis` para scroll suave sincronizado con `ScrollTrigger.update`; `framer-motion` para micro-interacciones y transiciones de componentes.
- Registra plugins una sola vez: `gsap.registerPlugin(ScrollTrigger)`.
- Limpia animaciones con `gsap.context()` / `useGSAP` y `ctx.revert()` al desmontar.

## 3. Movimiento accesible
- Respeta `prefers-reduced-motion`: sin Lenis, sin parallax ni scrub; solo fades cortos o nada.
```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduce) { /* iniciar Lenis + ScrollTrigger */ }
```
- En framer-motion usa `useReducedMotion()`.

## 4. Mobile primero
- Diseña a 375px y escala con `sm: md: lg:`. Botón flotante de WhatsApp visible en móvil.
- Targets táctiles ≥ 44px, texto base ≥ 16px, sin scroll horizontal.

## 5. Imágenes
- Convierte a WebP (calidad ~75–80), tamaños 640/1280/1920 con `srcset`:
  `ffmpeg -i foto.jpg -vf scale=1280:-1 -q:v 78 foto-1280.webp`
- `loading="lazy"` excepto el hero; `width`/`height` fijos para evitar CLS.
- Hero de video: MP4 H.264 + WebM, sin audio, `muted playsinline`, poster WebP.

## 6. SEO y Open Graph
En `index.html`: `lang="es"`, `<title>`, `meta description`, `og:title`, `og:description`, `og:image` (1200×630), `og:type=restaurant`, `twitter:card`, canonical, favicon + apple-touch-icon.
Agrega JSON-LD `Restaurant` con dirección, horarios (`openingHoursSpecification`), teléfono, `servesCuisine`, `priceRange`, `menu`.

## 7. Contenido
Todo en español (Colombia), tono del concepto, sin lorem ipsum en la entrega. Precios en COP.

Al terminar, usa la skill `entrega-cliente`.
