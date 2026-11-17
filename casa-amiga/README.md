# Casa Amiga · «¿Quieres llegar a casa?» (v2)

Película vertical 1080×1920 para Reels y TikTok, en estilo Apple: capas de vidrio esmerilado sobre la luz cálida de la cabaña.

Alguien abre una app de mapas, busca «Casa Amiga Santa Elena» y toca el resultado. Se abre una ventana con el video de cómo llegar, que crece a pantalla completa:

1. **Video 1:** llegar al Sector Amor y Amistad.
2. **Video 2:** bajar hasta Casa Amiga.

Al final todo vuelve al teléfono: «Llegaste a casa.»

La app de mapas es un diseño original: no usa logo, interfaz ni colores de Google. El único negocio que aparece es Casa Amiga.

## Duración

`16,5 s (intro) + video 1 + video 2 + 3,0 s (cierre)`. Con dos tarjetas de reemplazo de 8 s, la película dura 35,5 s.

## Qué tienes que poner y dónde

| Qué | Dónde | Notas |
| --- | --- | --- |
| **Video 1**: llegando a Amor y Amistad | `assets/videos/video1.mp4` | Vertical u horizontal, cualquier fps y cualquier duración. |
| **Video 2**: bajando a Casa Amiga | `assets/videos/video2.mp4` | Igual. |
| Recortes y textos de los videos | `clips.json` | `inicio` y `fin` dentro del archivo; titulares; texto del banner de ruta. |
| Música (opcional) | `assets/audio/musica.mp3` | Acústica, cálida y con aire. Se repite sola, baja durante los videos y cierra con fundido. |
| Fotos reales (opcional) | `assets/fotos/` | Reemplaza `cabana.svg`, `obra.svg`, `ceramica.svg`, `taller.svg` y `hongo.svg` (mismo nombre; si cambias la extensión, avísame). |
| Textos de marca | `datos.json` | Usuario, lema, dirección, tiempo de viaje (vacío = no se muestra). |
| Etapas de la ruta | `route.json` | Dos etapas: Sector Amor y Amistad → Casa Amiga. |

Nunca hay que tocar el código de animación: los tiempos, la transición entre videos, los titulares, el mini-mapa y la barra de progreso salen de `clips.json`.

## Comandos

```bash
cd casa-amiga
npm install                         # sólo la primera vez
npm run dev                         # vista previa en el navegador con barra de tiempo
node tools/render.mjs --draft       # borrador 30 fps → renders/casa-amiga-draft.mp4
node tools/render.mjs --final --estimate   # estima cuánto tardará el final (sin renderizar)
node tools/render.mjs --final       # final 60 fps → renders/casa-amiga-final.mp4
node tools/determinism.mjs          # prueba de determinismo (30 instantes, dos órdenes)
node tools/sheets.mjs               # hojas antes/después y de calidad del mapa
```

## Cómo funciona

- **Stack:** TypeScript (modo estricto) + Vite + Three.js (WebGL2).
- **Diseño:** todos los valores de estilo viven en `src/tokens.ts`.
- **Escena:** `src/scene.ts` es la función pura `state(t)`, que describe cada cuadro sin tocar la GPU.
- **Render** (`src/film.ts`):
  1. Mide la velocidad de cada elemento evaluando el instante en la apertura y en el cierre del obturador (180°).
  2. Elige los subcuadros: 1 si el cuadro está quieto, 6 a 16 si hay movimiento rápido. Debajo de ese umbral usa un solo subcuadro con blur direccional según la velocidad de cada elemento.
  3. Reutiliza las capas que no cambiaron.
  4. Acumula los subcuadros en un búfer de punto flotante.
  5. Saca el cuadro final con un dither mínimo para evitar bandas.
- **Vidrio:** un único material en shader. Hace un blur dual-Kawase del fondo a 1/4 de resolución y le añade tinte cálido, saturación, borde de 1 px en degradé, brillo especular y una refracción sutil.
- **Mapa:** un solo mapa vectorial continuo, sin teselas. Usa el mismo campo de ruido con semilla para el sombreado y las curvas de nivel. Las vías son curvas Bézier de grosor constante en pantalla, las etiquetas se mantienen derechas y el vuelo de la cámara usa la interpolación de zoom de van Wijk.
- **Captura** (`tools/render.mjs`):
  1. Chromium headless vía Playwright, con N−1 workers en paralelo, cada uno con su propio navegador.
  2. Cada cuadro se lee como RGBA crudo y va directo al stdin de ffmpeg.
  3. Los tramos se concatenan sin pérdida y luego se agrega el audio (AAC 320k, −14 LUFS) y `+faststart`.
- **Video real:** ffmpeg extrae los cuadros exactos a los fps del render, sin deformar ni cambiar la velocidad. Nunca se usa `<video>.currentTime`.
