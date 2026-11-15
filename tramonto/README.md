# Tramonto di Santa Elena · sitio web

Sitio de una sola página para **Tramonto di Santa Elena**, restaurante italiano en Santa Elena, Medellín.
Concepto: **"Tramonto: la hora dorada"**. Todo el sitio es un atardecer que avanza con el scroll.

- **Stack:** React 19 + Vite + Tailwind v4 · GSAP + ScrollTrigger · Lenis · framer-motion · SplitType
- **Diseño:** sigue `DESIGN.md` (paleta medida del logo, Italiana / Italianno / Manrope / DM Mono, zigzag y arcos).
- **Sin fotos:** la única imagen es el logo. Todo lo demás son ilustraciones SVG y marcos "FOTO PRÓXIMAMENTE".

## Uso

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera /dist (rutas relativas: funciona en cualquier carpeta o hosting estático)
npm run preview
```

La carpeta `dist/` ya viene compilada: se puede subir tal cual a cualquier hosting estático.

## Dónde se edita el contenido

Todo vive en **`src/data/site.js`**:

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `business.whatsapp.number` (formato `573001234567`). Mientras esté vacío, los botones abren `wa.link/04iqwg` y copian el mensaje al portapapeles. |
| Dirección | `business.address.line` |
| Horas reales | `schedule.days` (0 = domingo … 6 = sábado) y `schedule.holiday` |
| Festivos de Colombia | `holidays` (2026–2027, editable) |
| Menú y precios | `menu` (cada plato: nombre, precio, ingredientes, `veg`, imagen) |
| Galería | `gallery` (`featured: true` = la que aparece en "Todo", 1 por categoría) |
| Testimonios | `testimonials` |
| Preguntas frecuentes | `faq` |
| Zonas de domicilio | `business.delivery.zones` (también en `faq`) |

Además, actualiza el bloque `schema.org` y las etiquetas Open Graph de `index.html` (dirección, teléfono, horas y dominio final).

### Cambiar un placeholder por una foto real
Cada marco lee su imagen del campo `src` (o `video` para loops mudos). Pon las fotos en `public/fotos/` (mejor en WebP) y escribe, por ejemplo:

```js
{ ..., src: './fotos/pizza-margherita.webp' }
```

El diseño no cambia: la foto entra en el mismo marco de arco, con carga diferida (lazy).

### Etiquetas "PENDIENTE"
Los datos por confirmar se ven en pantalla con una etiqueta punteada (✎). Cuando todo esté confirmado, pon `SHOW_PENDING = false` en `site.js`.

## Material que falta
- Número de WhatsApp real, dirección exacta, horas de jueves a domingo y de festivos
- Menú completo con precios (highlight "Menú"), zonas de domicilio
- Logo en SVG (por ahora se usa una versión PNG/WebP con fondo transparente, generada del logo original)
- Fotos en alta: pizza vista desde arriba, pasta, galleta en sartén, cócteles, interior de madera de noche, fachada al atardecer, perros en el restaurante
- 2–3 reels cortos para la galería y reseñas reales (highlight "Clientes")

## Accesibilidad y movimiento
- Con `prefers-reduced-motion` no hay pin, parallax ni cambio animado del cielo: el hero aparece de noche, con la pizza ya a la vista.
- En móvil no hay scroll horizontal fijado ni cursor personalizado; se mantienen el cambio de cielo, los reveals de texto y los contadores.
- Tabs, filtros, acordeón, carrusel y formulario funcionan con teclado y tienen foco visible.
