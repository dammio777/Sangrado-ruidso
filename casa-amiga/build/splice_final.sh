#!/bin/bash
# Re-renderiza solo la escena final (desde START s) de un video ya hecho y la une al resto.
# Uso: bash splice_final.sh <pagina> <video_existente.mp4> [START=26.9]
set -e
cd "$(dirname "$0")"
ST=${3:-26.9}; FPS=60; CUT=$(python3 -c "print(round($ST*$FPS))")
TMP=$(mktemp -d)
START=$ST JPGQ=100 CRF=10 PAGE="$1" node render.js video "$TMP/tail.mp4" $FPS > "$TMP/log" 2>&1
ffmpeg -v error -i "$2" -i "$TMP/tail.mp4" -filter_complex \
 "[0:v]trim=end_frame=$CUT,setpts=PTS-STARTPTS[a];[1:v]unsharp=5:5:0.35:5:5:0,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,format=yuv420p[v]" \
 -map "[v]" -map 0:a -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -g 120 \
 -c:a copy -movflags +faststart -y "$TMP/out.mp4"
if [ "$(stat -c %s "$TMP/out.mp4")" -gt 95000000 ]; then
  ffmpeg -v error -i "$TMP/out.mp4" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart -y "$TMP/out2.mp4"; mv "$TMP/out2.mp4" "$TMP/out.mp4"; fi
mv "$TMP/out.mp4" "$2"; rm -rf "$TMP"; echo "listo $2"
