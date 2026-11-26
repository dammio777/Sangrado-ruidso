#!/usr/bin/env bash
# H2 «Mándale esto al que siempre dice que no tiene hambre» · Airbus en macro (versión de alta calidad).
# Planos: 1) macro de capas  2) tapa/papel/brasas  3) retroceso hasta la hamburguesa completa  (foto con upscale x4 por recortes)
#         y el momento real del queso estirándose al levantar la tapa, en cámara lenta (video del celular, upscale x4 con IA).
# Requiere el modelo ONNX (ver 04-local-dia/src/sr_build_onnx.py) en $M y el video original en $SRC.
set -euo pipefail; cd "$(dirname "$0")/.."
M=${M:?ruta al modelo onnx}; SRC=${SRC:?video de armado de la Airbus}; P=../06-nuevo/assets/n_airbus_sr.png
python3 src/sr_still.py $M $P out/air_A.png 420 380 760 1250
python3 src/sr_still.py $M $P out/air_B.png 380 0 660 1250
python3 ../07-aerosanduche/src/sr_clip.py $M $SRC 5.90 28 230 360 720 1280 out/sr_R1.mp4 1080 1920 30
for n in 1 2 3; do PAGE=photo.html THEME=$n LOSSLESS=1 CRF=12 OUT=hp$n.mp4 node src/render.js video 30; done
ffmpeg -nostdin -v error -y -i out/sr_R1.mp4 -vf "setpts=2.0*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,tpad=stop_mode=clone:stop=3,eq=contrast=1.05:saturation=1.08:gamma=0.98,format=yuv420p" -frames:v 56 -c:v libx264 -crf 12 -preset slow -r 30 out/hR1.mp4
printf "file 'hp1.mp4'\nfile 'hR1.mp4'\nfile 'hp2.mp4'\nfile 'hp3.mp4'\n" > out/hl.txt
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/hl.txt -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30 -an out/base_hambre.mp4
# texto + música: node src/render_enganche.js video hambre_sd out/base_hambre.mp4 <musica.wav> <salida.mp4>
