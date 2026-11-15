# Aero Burger · Video 03 · Desgranado especial Gavilán

Reel 1080×1920 a 60 fps, de 21 s. Usa la misma tipografía (Bevan) y el mismo degradado ámbar que la Airbus.

**Estructura:** foto en tarjeta con "GAVILÁN" → "Plan de vuelo" en 5 escalas de 2 s a velocidad normal → foto con tenedor ("Todo en un solo bowl.") → cierre con ingredientes y la firma.

**Fuente:** VID-20261114-WA0040.mp4 (480×854, WhatsApp). Se recorta un cuadro de 400 px que sigue el bowl y se escala a 900, por eso va en tarjeta y no a pantalla completa.
Pasos a velocidad normal, 2 s cada uno (inicio en la fuente): s1 2.8 · s2 20.0 · s3 29.5 · s4 49.2 · s5 57.0

**Regenerar:**
```
node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav
ffmpeg -i out/video_noaudio.mp4 -i out/sfx.wav -c:v copy -c:a aac -b:a 256k -shortest out/AeroBurger_03_Gavilan.mp4
```

**Temas:** `THEME=dark` (fondo negro, elementos blancos) o `THEME=light` (fondo blanco, elementos negros):
```
THEME=light OUT=video_light.mp4 node src/render.js video 60
```

**Color de los pasos (natural, solo más luz):** `curves=all='0/0.02 0.25/0.32 0.5/0.6 0.75/0.83 1/1',eq=saturation=1.08,unsharp=5:5:0.6`
