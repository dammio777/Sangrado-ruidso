# Casa Amiga — sitio web

Galería de arte y diseño · Vereda El Placer, sector Amor y Amistad · Santa Elena, Medellín.
Concepto: **"Una línea que te trae a casa"**: el trazo continuo del logo dibuja el ícono, el camino del mapa, el marco de cada obra y la puerta que se abre.

**Stack:** React 18 + Vite 5 + Tailwind 3 · GSAP 3 + ScrollTrigger (pin/scrub) · Lenis (scroll con inercia) · Framer Motion (drag, layout, modales) · SplitType.
Respeta `prefers-reduced-motion`: sin preloader, sin pin, sin parallax ni zoom; trazos ya dibujados.

## Desarrollo

```bash
cd casa-amiga
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/ (estático, rutas relativas: sirve en cualquier carpeta)
npm run preview
```

`dist/` está versionado: se puede subir tal cual a cualquier hosting (Netlify, Vercel, cPanel, GitHub Pages).

## Contenido pendiente (todo está en `src/data.js`)

| Qué | Dónde |
|---|---|
| **Número de WhatsApp** (hoy `573000000000`, ficticio) | `WHATSAPP` |
| Dirección / pin exacto de Google Maps | `DIRECCION` |
| Horario real (alimenta el indicador "Abierto ahora") | `HORARIO`, `HORARIO_NOTA` |
| Nombre del perro (hoy "El anfitrión") | `PERRO` |
| Orden de las paradas del mapa | `PARADAS` |
| Obras: artista, título, técnica, medidas, precio | `OBRAS` |
| Artistas: nombres, disciplina, Instagram, permiso de uso de retrato | `ARTISTAS` |
| Talleres: fechas, horas, cupos, precios | `EVENTOS` |
| Cifras reales (las que estén en `null` no se muestran) | `CIFRAS` |
| Reseñas reales (hoy marcadas PLACEHOLDER) | `VISITAS` |
| Respuestas del FAQ | `FAQ` |
| Texto del manifiesto | `src/components/Manifiesto.jsx` |

### Fotos
Las imágenes de `public/img/` son **recortes de baja resolución del Instagram**, solo para maquetar.
Reemplázalas por las originales manteniendo el nombre de archivo (ideal ≥ 2000 px de ancho, JPG/WebP):

`fachada-noche.jpg` (hero: la puerta debe quedar centrada) · `fachada-dia.jpg` · `interior.jpg` · `obra-01…04.jpg` · `obras-pared.jpg` · `objeto-lampara-hongo.jpg` · `plantas.jpg` · `perro-anfitrion.jpg` · `artista-1.jpg` · `artista-2.jpg` · `mapa-ilustrado.jpg` · `logo-casa-amiga.jpg`.

## Estructura

`src/components/` — una sección por archivo, en el orden del sitio: Preloader → Navbar → Hero (la puerta se abre) → Marquee → Manifiesto → Camino (scroll horizontal del mapa) → Galeria → Artistas → Talleres → LaCasa (día/noche) → Cifras → LibroVisitas → Faq → Ubicacion → CtaFinal → Formulario → Footer + WhatsAppFab + Cursor.

`src/components/LogoIcon.jsx` contiene el ícono redibujado como trazos (hojas → manos → casa) que se reutiliza en todo el sitio.
