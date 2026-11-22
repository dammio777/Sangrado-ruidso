#!/bin/bash
# Render final: 60 fps, cuadros casi sin pérdida, x264 alta calidad, enfoque sutil, volumen -14 LUFS.
# Si el archivo pasa de 95 MB (límite de GitHub: 100 MB) se recomprime con CRF 19.
# Uso: bash final_render.sh <pagina> <musica.wav> <salida.mp4>
set -e
cd "$(dirname "$0")"
TMP=$(mktemp -d)
JPGQ=100 CRF=10 PAGE="$1" node render.js video "$TMP/master.mp4" 60 > "$TMP/log" 2>&1
enc(){ ffmpeg -v error -i "$TMP/master.mp4" -i "$2" -map 0:v -map 1:a \
  -vf "unsharp=5:5:0.35:5:5:0,format=yuv420p" -c:v libx264 -preset slow -crf "$1" -profile:v high -level 4.2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -g 120 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart -y "$TMP/out.mp4"; }
enc 17 "$2"
if [ "$(stat -c %s "$TMP/out.mp4")" -gt 95000000 ]; then enc 19 "$2"; fi
mv "$TMP/out.mp4" "$3"
rm -rf "$TMP"
echo "listo $3"
