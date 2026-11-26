#!/usr/bin/env bash
# Versión para Instagram de un video a 30 fps (grabación del celular): H.264 CRF 18, tope 8 Mbps, AAC 256 kbps, BT.709.
# Uso: make_ig30.sh salida.mp4 entrada.mp4
set -euo pipefail
ffmpeg -nostdin -v error -y -i "$2" -c:v libx264 -preset slow -crf 18 -maxrate 8M -bufsize 16M -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30 -c:a copy -movflags +faststart "$1"
