# Aero Burger · Video 05 · Promo "Partidos de hoy" (sábado 21 de noviembre)

Reel 1080×1920 a 60 fps, de 18,5 s. Concepto: un tablero de salidas de aeropuerto con letras giratorias, donde los partidos aparecen como vuelos.
1. "HOY HAY FÚTBOL / EN AERO BURGER", con el aviso "ding‑dong" de aeropuerto
2. Tablero: 17:30 MINEIRO VS BOCA (CONMEBOL Sudamericana, "LA FINAL") · 20:15 CALDAS VS NACIONAL (Liga Dimayor, "A TIEMPO")
3. Cuatro tomas de noche (letrero, luna con pantalla, terraza con gente, Airbus), cada una con su leyenda en el tablero
4. Cierre: "TU PUERTA DE EMBARQUE · AERO BURGER", "Llega antes del pitazo.", horarios y @aero.burger

Reutiliza fotogramas de `01-local/frames` y `02-airbus/frames`. No usa escudos de clubes (son marcas registradas): solo nombres y colores.
Regenerar: `node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav`, luego unir con ffmpeg.
