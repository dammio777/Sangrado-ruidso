# Aero Burger · Video 02 · Airbus doble carne

Reel 1080×1920 a 60 fps, de 19,5 s, sin intro de Spotify.

**Estructura:** título grande "AIRBUS" sobre la cámara lenta del queso → contador de 400 g → tarjeta "Lo que lleva" → vista lateral → envoltorio → foto con papas → cierre con la foto del afiche.

**Clips** (del video 20261114_192153_1, con zoom de 1,3× arriba para sacar la toalla y gradación cálida):
a1 4.9 s +2.1 a 0.7× (minterpolate) · a2 0.0 +0.5 · a3 1.05 +1.4 · a4 9.45 +1.0 · a5 10.4 +1.8

**Regenerar:**
```
node src/render.js video 60
python3 src/make_sfx.py out/sfx.wav
ffmpeg -i out/video_noaudio.mp4 -i out/sfx.wav -c:v copy -c:a aac -b:a 256k -shortest out/AeroBurger_02_Airbus.mp4
```
