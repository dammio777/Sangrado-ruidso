# 12 · «Estoy a esto de pedir una Airbus»

Carrusel de 2 imágenes 1080×1350 (4:5). Chiste del formato «Estoy a esto» (mano en pinza): lámina 1 = mano completa con «Estoy a esto» y flecha a la pinza (con el remate diminuto dentro);
lámina 2 = acercamiento a los dedos con «de pedir una Airbus».

**Forma:** medida de la silueta de la referencia (captura de pantalla) con `src/measure_reference.py` (mano verde, puño blanco, manga roja → mapas de máscara, normales, flujo y espesor en `assets/`).
**Pelo, luz y colores:** propios (`src/hand3.html`): 3 capas de trazos con luz de arriba-izquierda, luz de borde, mechones y sombras de contacto. No se usa ningún píxel de la referencia.
Render: `HAND=hand3.html SS=2 SCALE=2 node src/render.js 1,2` y reducir a 1080×1350 (ver `out/`). Fuentes (OFL): Caveat Brush y Baloo 2.
Versiones anteriores (formas aproximadas): `src/hand.html`, `src/hand2.html`.
