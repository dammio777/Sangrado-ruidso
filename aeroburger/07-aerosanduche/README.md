# Aero Burger · Video 07 · Aerosanduche de pollo

Reel 1080×1920 a 60 fps. Hay dos versiones:
- **Mesa** (`THEME=mesa`, 17 s), la principal: abre con el primer plano de frente, sigue con 4 pasos de preparación a velocidad normal ("Así se prepara", con ruta de vuelo) y cierra con el combo y las papas en la mesa, más el pase de abordar.
- **Foto de estudio** (20,5 s): abre y cierra con la foto de estudio e incluye el combo y el primer plano en el medio.

El video de preparación (720×404 dentro de una grabación de pantalla) se recorta en 4 tramos de 2,2 s, se mejora con IA (`src/sr_clip.py`, a 900×676 y 30 fps) y `src/frames.sh` lo pasa a PNG a 60 fps.
```
THEME=mesa OUT=video_mesa.mp4 LOSSLESS=1 CRF=14 node src/render.js video 60 && python3 src/make_sfx.py out/sfx_mesa.wav mesa
```
