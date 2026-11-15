#!/usr/bin/env bash
# Extracción v2 (alta calidad) de las 8 tomas del local de día.
#  1) recorte "cover" con margen (990x1386) para estabilizar
#  2) estabilización en dos pasadas (vidstab), con desplazamiento limitado al margen
#  3) recorte final 900x1260, limpieza de ruido, nitidez adaptativa (CAS), color natural
#  4) 60 fps reales (interpolación de movimiento para la toma de 30 fps)
#  5) fotogramas PNG sin pérdida
set -euo pipefail
U=${U:-/root/.claude/uploads/0b5a8461-eb45-580e-9088-2514990f7124}
cd "$(dirname "$0")/.."
TMP=out/tmp; mkdir -p "$TMP"
GR="curves=all='0/0.02 0.25/0.28 0.5/0.54 0.75/0.79 1/1',eq=saturation=1.06"
COVER="scale='if(gt(a,990/1386),-2,990)':'if(gt(a,990/1386),1386,-2)':flags=lanczos"

clip(){ # nombre archivo inicio frames xfrac fps_mode denoise sharpen
  local name=$1 src=$U/$2 ss=$3 n=$4 xf=$5 fpsm=$6 dn=$7 sh=$8
  local dur; dur=$(python3 -c "print($n/60+0.25)")
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$src" \
    -vf "$COVER,crop=990:1386:'(iw-990)*$xf':'(ih-1386)/2',format=yuv420p" -c:v libx264 -crf 6 -preset veryfast "$TMP/$name.mp4"
  ffmpeg -nostdin -v error -y -i "$TMP/$name.mp4" -vf "vidstabdetect=shakiness=6:accuracy=15:result=$TMP/$name.trf" -f null -
  local fpsf="fps=60"
  [ "$fpsm" = interp ] && fpsf="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
  rm -rf "frames/$name"; mkdir -p "frames/$name"
  ffmpeg -nostdin -v error -y -i "$TMP/$name.mp4" -vf "vidstabtransform=input=$TMP/$name.trf:smoothing=18:optzoom=0:zoom=0:maxshift=42:maxangle=0.03:interpol=bicubic:crop=keep,crop=900:1260:45:63,$dn,$fpsf,$GR,$sh" \
    -frames:v "$n" "frames/$name/%04d.png"
  echo "$name $(ls frames/$name | wc -l) frames"
}
# Clips de WhatsApp: primero super-resolución con IA (src/sr_clip.py -> out/tmp/cN_sr.mp4), luego estabilización
clip_sr(){ # nombre frames sharpen
  local name=$1 n=$2 sh=$3
  ffmpeg -nostdin -v error -y -i "$TMP/${name}_sr.mp4" -vf "vidstabdetect=shakiness=6:accuracy=15:result=$TMP/$name.trf" -f null -
  rm -rf "frames/$name"; mkdir -p "frames/$name"
  ffmpeg -nostdin -v error -y -i "$TMP/${name}_sr.mp4" -vf "vidstabtransform=input=$TMP/$name.trf:smoothing=18:optzoom=0:zoom=0:maxshift=42:maxangle=0.03:interpol=bicubic:crop=keep,crop=900:1260:45:63,$GR,$sh" \
    -frames:v "$n" "frames/$name/%04d.png"
  echo "$name $(ls frames/$name | wc -l) frames (IA)"
}
WA=98f03849-VID-20261115-WA0074.mp4
NL="nlmeans=s=2.2:p=5:r=11"; HQ="hqdn3d=1:1:2:2"
if [ -f "$TMP/c3_sr.mp4" ]; then
  clip_sr c1 115 "cas=0.2"; clip_sr c2 133 "cas=0.2"; clip_sr c3 145 "cas=0.2"
else
  clip c1 $WA 1.7 115 0.5  fps    "$NL" "cas=0.55"
  clip c2 $WA 3.4 133 0.5  fps    "$NL" "cas=0.55"
  clip c3 $WA 8.0 145 0.5  fps    "$NL" "cas=0.55"
fi
clip c4 16b381ea-20261115_160132.mp4 0.0  87 0.5  fps "$HQ" "cas=0.35"
clip c5 e228af8a-20261115_160127.mp4 0.0 136 0.5  fps "$HQ" "cas=0.35"
clip c6 767288cf-20261115_160317.mp4 0.0 114 0.13 fps "$HQ" "cas=0.40"
clip c7 19bfed6a-20261115_160117.mp4 1.95 68 0.5  fps "$HQ" "cas=0.35"
clip c8 e97b2a9e-20261115_160501.mp4 0.0 147 0.4  interp "$HQ" "cas=0.30"
python3 src/strip_png_color.py "frames/*/*.png"
