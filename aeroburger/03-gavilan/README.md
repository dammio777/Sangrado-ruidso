# Aero Burger · Video 03 · Desgranado especial Gavilán

Reel 1080×1920 a 60 fps, de 21 s. Usa la misma tipografía (Bevan) y el mismo degradado ámbar que la Airbus.

**Estructura:** foto en tarjeta con "GAVILÁN" → "Así se arma" en 5 pasos (timelapse) → foto con tenedor ("Todo en un solo bowl.") → cierre con ingredientes y la firma.

**Fuente:** VID-20261114-WA0040.mp4 (480×854, WhatsApp). Se recorta un cuadro de 400 px que sigue el bowl y se escala a 900, por eso va en tarjeta y no a pantalla completa.
Pasos (inicio, duración, velocidad): s1 0.0 7.0 3.5× · s2 18.3 7.2 3.6× · s3 28.3 10.2 5.1× · s4 48.3 7.2 3.6× · s5 56.5 4.5 2.25×

**Regenerar:**
```
node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav
ffmpeg -i out/video_noaudio.mp4 -i out/sfx.wav -c:v copy -c:a aac -b:a 256k -shortest out/AeroBurger_03_Gavilan.mp4
```
