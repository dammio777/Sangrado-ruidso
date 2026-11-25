# Entreverde · sitio web

Bar y cocina al aire libre en Santa Elena, Medellín. «Tragos y comida que se comparten».

- **Sitio listo para publicar:** carpeta `dist/` (estático, funciona en cualquier hosting o GitHub Pages).
- **Código:** React + Tailwind (Vite), framer-motion, GSAP ScrollTrigger (sin pin) y Lenis (solo desktop).

## Cambiar datos sin tocar el diseño

Todo lo editable está en **`src/data.js`**:

| Qué | Dónde |
|---|---|
| WhatsApp, Instagram, dirección | `CONFIG` |
| Horario por día y festivos 2026–2027 | `CONFIG.horario`, `CONFIG.festivos` |
| Carta (nombre, precio, porción, foto, agotado) | `CARTA` (`disponible: false` = agotado) |
| Ingredientes y precios de «Arma tu desgranado» | `DESGRANADO` |
| Zonas y costo de domicilio, pagos, zonas para reservar | `CONFIG.domicilio`, `CONFIG.pagos`, `CONFIG.reservas` |
| Fotos | `FOTOS` (si `src` es `null` se muestra «Foto próximamente») |
| Quitar las marcas de «ejemplo» | `CONFIG.marcasEjemplo = false` |

Para agregar una foto: guárdala en `public/fotos/<nombre>-<ancho>.webp` y pon `src: 'fotos/<nombre>'` y `widths` en `FOTOS`.

## Comandos

```bash
npm install
npm run dev        # desarrollo
npm run build      # genera dist/
```

## Modo presentación de paletas

Agrega `?demo` a la URL (aparece una píldora abajo a la izquierda) o `?paleta=a|b|c`.

## Pendiente por confirmar con el dueño

Dirección exacta y cuál parque · horario vigente (la bio dice «fines de semana», la publicación «jueves a domingo») · precios reales · nombres reales del sándwich, la pasta y el plato a la plancha · lista de tragos · zonas y costos de domicilio · métodos de pago · si se puede recoger · zonas del lugar · perros · qué pasa si llueve · logo en SVG/PNG · fotos reales de la comida, los tragos y la gente · reseñas reales · dominio del sitio (`CONFIG.urlSitio`).
