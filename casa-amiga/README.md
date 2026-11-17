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

## Publicar en Vercel (evita la pantalla en blanco)

El `index.html` de esta carpeta es el código fuente: **no se puede subir tal cual**, porque apunta a `/src/main.jsx` y queda en blanco. Usa una de estas opciones:

1. **Con compilación (recomendada):** en Vercel, *Root Directory* = `casa-amiga`, framework Vite (ya lo define `vercel.json`: `npm run build` → `dist`).
2. **Sin compilar:** *Root Directory* = `casa-amiga/dist` (framework "Other", sin build command). `dist/` ya viene compilado.
3. **Un solo archivo:** `standalone/index.html` (13 MB, con las imágenes incluidas) funciona suelto en cualquier hosting.

El repositorio también tiene en la raíz otro proyecto (`index.html` + `audio/`): por eso el Root Directory es obligatorio.

## Contenido pendiente (todo está en `src/data.js`)

| Qué | Dónde |
|---|---|
| **Número de WhatsApp** (hoy `573000000000`, ficticio) | `WHATSAPP` |
| Dirección / pin exacto de Google Maps | `DIRECCION` |
| Horario real; luego `HORARIO_CONFIRMADO = true` para activar "Abierto ahora" | `HORARIO`, `HORARIO_NOTA`, `HORARIO_CONFIRMADO` |
| Nombre del perro (hoy "El anfitrión") | `PERRO` |
| Orden de las paradas del mapa | `PARADAS` |
| Obras: artista, título, técnica, medidas, precio | `OBRAS` |
| Artistas: nombres, disciplina, Instagram, permiso de uso de retrato | `ARTISTAS` |
| Talleres: fechas, horas, cupos, precios | `EVENTOS` |
| Cifras reales (las que estén en `null` no se muestran) | `CIFRAS` |
| Reseñas reales (hoy marcadas PLACEHOLDER) | `VISITAS` |
| Respuestas del FAQ | `FAQ` |
| Texto del manifiesto | `src/components/Manifiesto.jsx` |

### Fotos y contenido ya cargados (del Drive de Casa Amiga)
Las fotos de `public/img/` son reales (feria, montaje y ecards), optimizadas a ~1700 px. Se reemplazan manteniendo el nombre.
Los datos de marcas, programa y horarios de la **Feria Casa Amiga (20 de septiembre)** salen de las ecards.
**Pendiente:** fotos del mapa ilustrado completo (hoy es un recorte de Instagram), permiso de las personas que aparecen en las fotos y de las marcas, Instagram de cada marca, técnica/medidas/precio de cada pieza y eventos futuros (`EVENTOS` con `pasado: false`).
Los PDFs de asistencia e inscripciones del Drive tienen datos personales: **no se usaron ni se suben al repositorio**.

## Estructura

`src/components/` — una sección por archivo, en el orden del sitio: Preloader → Navbar → Hero (la puerta se abre) → Marquee → Manifiesto → Camino (scroll horizontal del mapa) → Galeria → Artistas → Talleres → LaCasa (día/noche) → Cifras → LibroVisitas → Faq → Ubicacion → CtaFinal → Formulario → Footer + WhatsAppFab + Cursor.

`src/components/LogoIcon.jsx` contiene el ícono redibujado como trazos (hojas → manos → casa) que se reutiliza en todo el sitio.
