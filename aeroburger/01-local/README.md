# Aero Burger · Video 01 · "Nuestro local" (Spotify / Apple style)

Reel 1080×1920 a 60 fps, de 26 s.

## Estructura
- `src/make_cover.py`: crea la portada pop-art (`assets/cover.png`) y el cuadrante duotono para el match-cut (`assets/reveal_tl.png`) a partir de fotogramas del local.
- `src/index.html`: la animación completa, dibujada en canvas y determinista. `window.seek(t)` dibuja cualquier instante. Para verla en el navegador: `index.html?t=5.7`.
- `src/render.js`: con Playwright, saca fotogramas a ffmpeg (`stills` o `video`).
- `src/make_sfx.py`: efectos sutiles sintetizados (pop, teclas, toque, play, riser, campanita).

## Regenerar
```
# 1) extraer los clips a frames/c1..c7 (ver tiempos en el README de la entrega)
python3 src/make_cover.py .
node src/render.js video 60
python3 src/make_sfx.py out/sfx.wav
ffmpeg -i out/video_noaudio.mp4 -i out/sfx.wav -c:v copy -c:a aac -b:a 256k -shortest out/final.mp4
```

## Clips (archivo, inicio, duración)
c1 sign 66b82bf9 0.0 2.1 · c2 tent c23ea259 0.0 2.95 · c3 plane 66b82bf9 7.1 2.1 · c4 terrace 66b82bf9 9.6 3.1 ·
c5 flight suit 0b59460a 0.0 2.3 · c6 moon 0b59460a 2.8 2.1 · c7 corridor c23ea259 6.2 1.95

## Canción
- El archivo es `assets/song.mp3` ("Sin documentos", Edición Aniversario). Tiene derechos de autor y **no se sube al repo** (está en .gitignore).
- Tempo de unos 97 BPM (beat = 0,62 s). El golpe de la banda en 0:11,86 cae en el match-cut (video 6,75 s); los cortes van por beats.
- Mezcla: la canción entra en el video a los 5,48 s (al tocar Play), desde 0:10,6 del tema, con fade out al final:
```
ffmpeg -i out/video_noaudio.mp4 -i out/sfx.wav -ss 10.6 -i assets/song.mp3 -filter_complex "[2:a]atrim=0:20.6,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=17.8:d=2.7,adelay=5480|5480,volume=0.89[m];[1:a]volume=1.4[s];[m][s]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:26[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k out/AeroBurger_01_Local_ConCancion.mp4
```
