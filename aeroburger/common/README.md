# Herramientas comunes

- `render.js`: renderizador común (Playwright + ffmpeg). Acepta `PAGE`, `THEME`, `OUT`, `LOSSLESS`, `CRF` y **`TIMESCALE`**: con `TIMESCALE=1.35` todo el video (animación, cortes y metraje) va un 35 % más lento. Se ejecuta desde la carpeta del proyecto: `cd 06-nuevo && node src/render.js video 60`.
- `render_lentos.sh`: genera las versiones "calmadas" (35 % más lentas) del Menú, el Aerosanduche en la mesa, Una noche, la Airbus y el Gavilán, con su música compuesta al tempo nuevo (tempo / 1.35) y los efectos estirados.
