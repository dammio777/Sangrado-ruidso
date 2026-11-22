# Aero Burger · Video 06 · "Menú de a bordo"

Reel 1080×1920 a 60 fps, de 22 s, en papel crema. Una carta de avión pasa páginas con cinco platos: Clásica CTA, Airbus, Sánduche de la casa, Torre de control personal y Gavilán. Luego aparece la chimenea ("Noches frías, chimenea encendida.") y al final el mapa "¿Cómo llegar desde El Silletero?", con la invitación a venir al local o pedir domicilio.

Material del Drive en `src_media/`. Las fotos de historias se recortaron para quitarles el texto. La chimenea (video de 10 cuadros) se usa como imagen fija mejorada con Real-ESRGAN.
Regenerar: `node src/render.js video 60 && python3 src/make_sfx.py out/sfx.wav`, luego unir con ffmpeg.
