# Aero Burger · Video 06 · "Menú de a bordo"

Reel 1080×1920 a 60 fps, de 22 s, en papel crema. Una carta de avión pasa páginas con cinco platos: Clásica CTA, Airbus, Sánduche de la casa, Torre de control personal y Gavilán. Luego aparece la chimenea ("Noches frías, chimenea encendida.") y al final el mapa "¿Cómo llegar desde El Silletero?", con la invitación a venir al local o pedir domicilio.

Material del Drive en `src_media/`. Las fotos de historias se recortaron para quitarles el texto. La chimenea (video de 10 cuadros) se usa como imagen fija mejorada con Real-ESRGAN.
Regenerar: `node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav`, luego unir con ffmpeg.

## Versión con "Para no verte más" (La Mosca)
Estribillo desde 1:39,83 (golpe de entrada) a ~100 BPM. Cada página dura 5 tiempos (0,5986 s) y la primera cae en el golpe. Render: `TIMESCALE=1.35 OUT=song_noaudio.mp4 node src/render.js video 60`; la canción se corta desde 96,24 s (99,83 − 3,59) con fundidos y `loudnorm` a −13 LUFS. El MP3 no se sube al repo (derechos de autor).
