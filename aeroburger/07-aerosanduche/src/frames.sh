#!/usr/bin/env bash
# Convierte los clips mejorados con IA (out/tmp/sN_sr.mp4, 30 fps, 900x676) en 120 cuadros PNG a 60 fps con color natural.
set -euo pipefail; cd "$(dirname "$0")/.."
GR="curves=all='0/0.02 0.25/0.29 0.5/0.56 0.75/0.8 1/1',eq=saturation=1.04,cas=0.2"
for s in s1 s2 s3 s4; do rm -rf frames/$s; mkdir -p frames/$s
  ffmpeg -nostdin -v error -y -i out/tmp/${s}_sr.mp4 -vf "fps=60,$GR" -frames:v 120 frames/$s/%04d.png; echo "$s $(ls frames/$s | wc -l)"; done
python3 ../04-local-dia/src/strip_png_color.py "frames/*/*.png"
