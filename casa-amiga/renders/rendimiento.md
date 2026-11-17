# Informe de rendimiento · Casa Amiga v2

Máquina: 4 núcleos de CPU, **sin GPU**. WebGL2 corre en SwiftShader (render por software) dentro de Chromium headless.

## Stack

- TypeScript en modo estricto + Vite 5 + Three.js 0.170 (WebGL2).
- Un archivo de tokens de diseño (`src/tokens.ts`) y una sola función pura `state(t)` (`src/scene.ts`).
- Vidrio en shader: blur dual-Kawase a 1/4 de resolución, compartido por todos los paneles del mismo cuadro.
- Subcuadros adaptativos con acumulación en un búfer de punto flotante (half-float), más blur direccional por elemento según su velocidad.
- Caché de capas quietas: pantalla del teléfono, mapas, fondo ambiental (1/2 resolución), texto e íconos.
- Captura con Playwright: 3 workers, cada uno con su propio Chromium. El RGBA crudo va directo al stdin de ffmpeg; el envío de un cuadro se superpone con el render del siguiente.
- Concatenación sin pérdida de los tramos; audio AAC 320k normalizado a −14 LUFS.

## Borrador (30 fps, 6–8 subcuadros sólo en movimientos rápidos, preset veryfast)

| | primera versión | optimizada |
| --- | --- | --- |
| Tiempo total | 1270 s (21,2 min) | **857 s (14,3 min)** |
| Render por segundo de video | 35,8 s | **24,2 s** |
| Subcuadros promedio | 2,89 | 1,94 |
| Cuadros con blur de movimiento real (≥ 6 subcuadros) | 342 | 192 |
| Memoria pico (suma de procesos) | 7,8 GB | 8,1 GB |

Optimizaciones aplicadas:
- Umbral de movimiento rápido: por debajo de 10 px durante el obturador se usa 1 subcuadro con blur direccional.
- En captura no se compone el canvas visible.
- Si hay un solo subcuadro, no se pasa por el acumulador.
- El fondo ambiental sale de caché a 1/2 resolución.
- No se dibuja lo que queda tapado por el video a pantalla completa.
- Los paneles de pantalla completa no llevan sombra.
- El envío de cada cuadro se superpone con el render del siguiente.

Desglose por cuadro y por worker (medido):

| Etapa | Tiempo |
| --- | --- |
| CPU (`state(t)`, listas y mapas) | ~0,13 s |
| GPU por software + lectura | ~1,2 s |
| Envío del cuadro | ~0,1–0,4 s |

El cuello de botella es la GPU por software. En una máquina con GPU real esta etapa sería decenas de veces más rápida.

## Verificaciones

- **ffprobe:** 1065 cuadros, 30/1 fps constantes, paso de 0,033333 a 0,033334 s, duración 35,500 s (= 16,5 + 16 + 3,0), H.264 High, yuv420p, BT.709.
- **Audio:** −15,4 LUFS integrados, pico −1,5 dBFS. Medido, no escuchado.
- **Determinismo:** 30 instantes aleatorios con semilla fija, renderizados en dos órdenes distintos: **30/30 idénticos** (SHA-256 de los píxeles).
- **Vista previa:** en esta máquina sin GPU la vista previa no llega a 60 fps (~5–15 fps al desplazar la barra). No pude medirla con GPU real.

## Estimación del render final (60 fps, 2130 cuadros)

Medido con una muestra de 126 cuadros y corregido con el error observado en el borrador:

| Opción | Ajustes | Tiempo estimado |
| --- | --- | --- |
| A · Final completo | 60 fps, 8–16 subcuadros, pantalla 1,5×, CRF 15 preset slow | **30–35 min** |
| B · Final ligero | 60 fps, 4–8 subcuadros, pantalla 1,25×, CRF 16 | **20–25 min** |
| C · Final a 30 fps | 30 fps, 8–12 subcuadros, pantalla 1,5×, CRF 15 | **15–18 min** |

Con el video real el costo es parecido: cada cuadro de metraje es una imagen JPEG ya extraída por ffmpeg.
