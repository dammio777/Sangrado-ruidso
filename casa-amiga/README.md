# Casa Amiga · «¿Quieres llegar a casa?»

Película vertical 1080×1920 para Reels/TikTok. Una persona abre una app de mapas en su celular, busca «Casa Amiga Santa Elena», toca el resultado y se abre una **ventana emergente con el video de cómo llegar**. Ese video crece a pantalla completa y al final vuelve al teléfono: «Llegaste a casa.»

La app de mapas es un diseño original, con la paleta de Casa Amiga: fondo blanco, textos en negro y acentos en el naranja del logo. No usa nada de Google, ni su logo, ni su interfaz, ni sus colores.

## Duración

`16,5 s (intro) + suma de los videos + 3,0 s (cierre)`. Con los 3 videos de reemplazo de 6 s dura 37,5 s.

## Qué tienes que poner y dónde

| Qué | Archivo / carpeta | Notas |
| --- | --- | --- |
| **Videos del recorrido** | `assets/videos/video1.mp4`, `video2.mp4`, `video3.mp4` | Verticales u horizontales (los horizontales se recortan al centro sin deformarse). Cualquier fps. |
| Lista de videos | `clips.json` | Orden, `inicio` / `fin` de cada clip, titular (`antetitulo` + `titulo`), punto del mapa (`hito`), audio. |
| Música (opcional) | `assets/audio/musica.mp3` | Folk acústico o lo-fi cálido, ~100 BPM. Se repite sola hasta cubrir la película, baja de volumen durante los videos y cierra con un fundido. |
| Fotos reales (opcional) | `assets/fotos/` | Reemplaza `cabana.svg`, `obra.svg`, `ceramica.svg`, `taller.svg` y `hongo.svg` por fotos con el **mismo nombre** (o cambia la extensión en `compositions/app.html`). Hoy son ilustraciones originales. |
| Puntos del recorrido | `route.json` | Nombres de los hitos del mapa dibujado y su posición en la vía (0 = inicio, 1 = llegada). |
| Textos de marca | `datos.json` | Usuario, lema, dirección, tiempo de viaje (si lo dejas vacío, no se muestra). |

Puedes agregar más videos o quitar alguno: agrega o borra entradas en `clips.json`. **Nunca hay que tocar el código de animación.** Todo se reacomoda solo: los tiempos, los barridos entre clips, los titulares, el mini-mapa y la barra de progreso.

## Cómo renderizar

```bash
cd casa-amiga
./render.sh          # borrador 30 fps  → renders/casa-amiga-borrador.mp4
./render.sh final    # final 60 fps     → renders/casa-amiga-final.mp4
```

`tools/build.mjs` lee los tres JSON, mide cada video con `ffprobe`, ajusta su duración y regenera los tiempos y la mezcla de audio. Después se renderiza.

## Estructura

- `index.html`: raíz. Monta las dos escenas y el audio (el bloque de audio lo genera `build.mjs`).
- `compositions/app.html`: el teléfono, la app de mapas (mapa digital y mapa dibujado a mano, los dos generados en SVG), la búsqueda, la tarjeta del lugar, los momentos de marca y el cierre.
- `compositions/ruta.html`: la ventana emergente con los videos, el mini-mapa, los titulares sobre el video y el regreso al teléfono.
- `assets/img/icono.png` y `firma.png`: el ícono y la firma, extraídos del logo naranja oficial.

## Pendiente de confirmar

- Usuario de Instagram: el brief dice **@galeria.casaamiga** y el letrero dice **@galeriacasaamiga**. Corrígelo en `datos.json` si hace falta.
- Nombres de los hitos en `route.json` (tomados del mapa ilustrado).
- Música y efectos: hoy suenan los efectos básicos incluidos (toques, teclado, «tok» del pin, campanita). Todavía no hay música.
