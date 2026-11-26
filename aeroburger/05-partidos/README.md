# Aero Burger · Video 05 · Promo "Partidos de hoy" (sábado 21 de noviembre)

Reel 1080×1920 a 60 fps, de 18,5 s. Concepto: un tablero de salidas de aeropuerto con letras giratorias, donde los partidos aparecen como vuelos.
1. "HOY HAY FÚTBOL / EN AERO BURGER", con el aviso "ding‑dong" de aeropuerto
2. Tablero: 17:30 MINEIRO VS BOCA (CONMEBOL Sudamericana, "LA FINAL") · 20:15 CALDAS VS NACIONAL (Liga Dimayor, "A TIEMPO")
3. Cuatro tomas de noche (letrero, luna con pantalla, terraza con gente, Airbus), cada una con su leyenda en el tablero
4. Cierre: "TU PUERTA DE EMBARQUE · AERO BURGER", "Llega antes del pitazo.", horarios y @aero.burger

Reutiliza fotogramas de `01-local/frames` y `02-airbus/frames`. No usa escudos de clubes (son marcas registradas): solo nombres y colores.
Regenerar: `node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav`, luego unir con ffmpeg.

## Afiches (uno por partido)
`src/poster.html?m=1|2&f=feed|story` dibuja el afiche con el mismo tablero de letras, ya detenido. `node src/posters.js` exporta los 4 PNG a `out/afiches/`:
Mineiro‑Boca y Caldas‑Nacional, cada uno en publicación (1080×1350) e historia (1080×1920).

## Clásico Nacional vs Medellín (miércoles 25 de noviembre, 20:30)
- Afiche (mismo diseño que el de Boca): `node src/posters.js 3` → `out/afiches/AeroBurger_Nacional-Medellin_{historia,publicacion}.png`. Datos del partido y fecha en el objeto `MATCH` de `src/poster.html`.
- Video: `src/clasico.html` (tablero con un solo vuelo), `PAGE=clasico.html TIMESCALE=1.25 LOSSLESS=1 CRF=13 OUT=clasico_noaudio.mp4 node src/render.js video 60`; sonido del tablero con `src/make_sfx_clasico.py`; música `python3 ../music/cozy.py partido ...` (La menor, 96 BPM; 39 tiempos). Mezcla: música 0,85 + efectos 0,55.
