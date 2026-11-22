#!/bin/bash
# Pasada final de calidad: 60 fps, cuadros casi sin pérdida, x264 de alta calidad, enfoque sutil, volumen unificado (-14 LUFS)
# Uso: bash final_render.sh <pagina> <musica.wav> <salida.mp4>
set -e
case "$1" in video.html|video-marcas.html) echo "omitido $3"; exit 0;; esac
cd "$(dirname "$0")"
TMP=$(mktemp -d)
JPGQ=100 CRF=10 PAGE="$1" node render.js video "$TMP/master.mp4" 60 > "$TMP/log" 2>&1
ffmpeg -v error -i "$TMP/master.mp4" -i "$2" -map 0:v -map 1:a \
  -vf "unsharp=5:5:0.35:5:5:0,format=yuv420p" -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -g 120 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart -y "$3"
rm -rf "$TMP"
echo "listo $3"
