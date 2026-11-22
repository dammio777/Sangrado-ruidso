# Aero Burger · Video 04 · El local de día

Reel 1080×1920 a 60 fps, de 21,5 s. Minimal tipo galería: fondo blanco, cada toma en una tarjeta con su número y nombre, y cortes limpios con un clic de obturador.

**Tomas** (archivo, inicio, duración; recorte a 900×1260 con color natural):
c1 La llegada · VID-WA0074 1.7 1.9 · c2 Bajo la carpa · WA0074 3.4 2.2 · c3 El corredor · WA0074 8.0 2.4 ·
c4 Cada rincón · 20261115_160132 0.0 1.45 · c5 La luna · 160127 0.0 2.27 · c6 Alma de piloto · 160317 0.0 1.9 (x 0.13) ·
c7 La barra · 160117 1.95 1.1 · c8 Tu mesa · 160501 (4K) 0.0 2.44 (x 0.4)

**Regenerar:** `node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav`, luego unir con ffmpeg.

## v3: interfaz cálida y super-resolución con IA
- **Interfaz:** cada toma tiene su `bg` (tono claro) y su `ink` (café oscuro) medidos del propio clip; el fondo y los textos cambian suavemente en cada corte. Intro y cierre en crema `#F3ECE2` con tinta `#2A221B`.
- **IA:** los 3 clips de WhatsApp pasan por Real-ESRGAN compacto (realesr-general-x4v3 mezclado 0,6 con wdn), ejecutado con ONNX Runtime en CPU, sin PyTorch:
```
python src/sr_build_onnx.py realesr-general-x4v3.pth realesr-general-wdn-x4v3.pth 0.6 out/tmp/srvgg_mix06.onnx
python src/sr_clip.py out/tmp/srvgg_mix06.onnx VID-WA0074.mp4 1.7 130 0 136 720 1008 out/tmp/c1_sr.mp4   # ídem c2 (3.4,148) y c3 (8.0,160)
bash src/extract.sh      # usa los *_sr.mp4 si existen
LOSSLESS=1 CRF=14 node src/render.js video 60
```

## Versión final "primer plano" calmada y en alta calidad
- `src/natural.html`: video a pantalla completa con la interfaz discreta y fundidos suaves entre tomas.
- `src/extract_full.sh`: tomas a 1080×1920 estabilizadas. Los clips de WhatsApp (c1–c3) y el diploma (c6) pasan por Real-ESRGAN **a cuadro completo** (`out/tmp/fullsr_cN.mp4`, 30 fps con interpolación a 60), en vez de recortar una franja.
- Render: `PAGE=natural.html TIMESCALE=1.35 CRF=13 OUT=slow_noaudio.mp4 node src/render.js video 60` (35 % más lento) y música a 77,8 BPM.
