#!/usr/bin/env bash
# Versiones para Instagram: 1080x1920, 60 fps, H.264 (CRF 18, tope 10 Mbps), AAC 256 kbps, BT.709.
# Uso: make_ig.sh salida.mp4 video [audio]    (si hay audio separado, reemplaza al del video)
set -euo pipefail
out=$1; v=$2; a=${3:-}
args=(-nostdin -v error -y -i "$v")
[ -n "$a" ] && args+=(-i "$a" -map 0:v -map 1:a) || args+=(-map 0:v -map 0:a)
ffmpeg "${args[@]}" -c:v libx264 -preset slow -crf 18 -maxrate 10M -bufsize 20M -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 60 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$out"
