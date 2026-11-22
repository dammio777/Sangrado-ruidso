#!/usr/bin/env bash
# Versión "primer plano": las 8 tomas a pantalla completa (1080x1920), estabilizadas, en frames_full/cN/*.jpg
# Los clips de WhatsApp parten de los intermedios con IA (out/tmp/cN_sr.mp4, 990x1386).
set -euo pipefail
U=${U:-/root/.claude/uploads/0b5a8461-eb45-580e-9088-2514990f7124}
cd "$(dirname "$0")/.."
TMP=out/tmp; mkdir -p "$TMP" frames_full
COVER="scale='if(gt(a,1188/2112),-2,1188)':'if(gt(a,1188/2112),2112,-2)':flags=lanczos"
stab(){ # nombre entrada.mp4 frames
  local name=$1 in=$2 n=$3
  ffmpeg -nostdin -v error -y -i "$in" -vf "vidstabdetect=shakiness=6:accuracy=15:result=$TMP/full_$name.trf" -f null -
  rm -rf "frames_full/$name"; mkdir -p "frames_full/$name"
  ffmpeg -nostdin -v error -y -i "$in" -vf "vidstabtransform=input=$TMP/full_$name.trf:smoothing=18:optzoom=0:zoom=0:maxshift=50:maxangle=0.03:interpol=bicubic:crop=keep,crop=1080:1920:54:96,cas=0.25" \
    -frames:v "$n" -q:v 2 "frames_full/$name/%04d.jpg"
  echo "$name $(ls frames_full/$name | wc -l)"
}
src(){ # nombre archivo inicio dur xfrac modo_fps
  local name=$1 f=$U/$2 ss=$3 dur=$4 xf=$5 fm=$6 fpsf="fps=60"
  [ "$fm" = interp ] && fpsf="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$f" -vf "$COVER,crop=1188:2112:'(iw-1188)*$xf':'(ih-2112)/2',hqdn3d=1:1:2:2,$fpsf,format=yuv420p" -c:v libx264 -crf 6 -preset veryfast "$TMP/full_$name.mp4"
}
sr(){ # nombre (desde el intermedio con IA 990x1386)
  ffmpeg -nostdin -v error -y -i "$TMP/${1}_sr.mp4" -vf "crop=780:1386:105:0,scale=1188:2112:flags=lanczos,format=yuv420p" -c:v libx264 -crf 6 -preset veryfast "$TMP/full_$1.mp4"
}
# v2: si existen los intermedios con IA a cuadro completo (out/tmp/fullsr_cN.mp4, 1188x2112), se usan esos
if [ -f "$TMP/fullsr_c3.mp4" ]; then
  stab c1 "$TMP/fullsr_c1.mp4" 113; stab c2 "$TMP/fullsr_c2.mp4" 148; stab c3 "$TMP/fullsr_c3.mp4" 147
else
  sr c1; stab c1 "$TMP/full_c1.mp4" 113
  sr c2; stab c2 "$TMP/full_c2.mp4" 148
  sr c3; stab c3 "$TMP/full_c3.mp4" 147
fi
src c4 16b381ea-20261115_160132.mp4 0.0  1.5 0.5 fps;    stab c4 "$TMP/full_c4.mp4" 87
src c5 e228af8a-20261115_160127.mp4 0.0  2.3 0.5 fps;    stab c5 "$TMP/full_c5.mp4" 137
if [ -f "$TMP/fullsr_c6.mp4" ]; then stab c6 "$TMP/fullsr_c6.mp4" 113
else src c6 767288cf-20261115_160317.mp4 0.0  1.95 0.27 fps;  stab c6 "$TMP/full_c6.mp4" 113; fi
src c7 19bfed6a-20261115_160117.mp4 1.95 1.12 0.5 fps;   stab c7 "$TMP/full_c7.mp4" 67
src c8 e97b2a9e-20261115_160501.mp4 0.0  2.44 0.4 interp; stab c8 "$TMP/full_c8.mp4" 140
