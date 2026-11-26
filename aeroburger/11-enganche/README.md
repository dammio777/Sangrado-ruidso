# 11 · Videos de enganche

Video REAL del celular (7–15 s) + animación solo en el texto. Sin logos ni intros, arrancan en movimiento y con una frase que pica.
Reglas en `../GUIA_DE_ESTILO.md`; cómo grabar más en `GUIA_DE_RODAJE.md`.

| Video | Material real | Texto | Música |
|---|---|---|---|
| **H1 · «400 g. ¿Puedes?»** (14,5 s) | video de armado de la Airbus (0–13,3 s) + 1,2 s de cierre | «400 g.» / «¿Puedes?» → «Airbus · doble carne · doble cheddar · tocineta» → «Etiqueta a quien no se la termina.» | cozy original (`music/cozy.py enganche_airbus`) o «Sin documentos» |
| **H2 · «Mándale esto al que siempre dice que no tiene hambre»** (10,6 s) | Airbus en macro: 3 planos de la foto mejor escalada (upscale x4 con IA por recortes, con empuje/barrido/retroceso) + el momento real del queso estirándose al levantar la tapa (video del celular, cámara lenta 0,5x, upscale x4 con IA) | «Mándale esto / al que siempre dice / que no tiene hambre.» → «Airbus · doble carne · doble cheddar · tocineta» → «Mándaselo ya.» | «Sin documentos» (cortes en el compás) o cozy original a 64,1 BPM |

Pipeline: `ffmpeg` (corte, color natural, desenfoque de relleno arriba para dejar sitio al texto) → `src/overlay.html` (texto animado, fondo transparente, determinista) →
`src/render_enganche.js` (compone texto + video + música) → `src/make_ig30.sh` (versión Instagram a 30 fps).
H2: `src/make_hambre.sh` (planos de `src/photo.html` + toma real escalada con `../07-aerosanduche/src/sr_clip.py`). La primera versión con el video oscuro del Gavilán (`src/make_h2.sh`) se descartó por poco apetecible.
Material original (no se sube al repo): `4dd61a19-…192153_1.mp4` (Airbus) y `74bcbfbf-…WA0040.mp4` (Gavilán).
