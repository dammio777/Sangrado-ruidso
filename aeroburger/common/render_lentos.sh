#!/usr/bin/env bash
# Renderiza las versiones "35 % más lentas y calmadas" (TIMESCALE=1.35) con su música a la nueva velocidad.
# Música: tempo / 1.35, compás inicial y duración × 1.35. Efectos estirados con atempo (1/1.35).
set -uo pipefail
cd "$(dirname "$0")/.."
TS=1.35
M=music/aero_bossa.py
job(){ # carpeta salida_final variables_entorno bpm bar0 dur [breakdown] sfx
  local dir=$1 final=$2 envs=$3 bpm=$4 bar0=$5 dur=$6 brk=$7 sfx=$8
  echo "== $dir $(date +%T)"
  ( cd "$dir" && env $envs TIMESCALE=$TS CRF=14 OUT=slow_noaudio.mp4 node src/render.js video 60 ) || return
  python3 $M "$dir/out/music_slow.wav" --bpm "$bpm" --bar0 "$bar0" --dur "$dur" $brk --seed 9 --fade 2.6 >/dev/null
  if [ -n "$sfx" ]; then
    ffmpeg -nostdin -v error -y -i "$dir/out/slow_noaudio.mp4" -i "$dir/out/music_slow.wav" -i "$dir/out/$sfx" \
      -filter_complex "[1:a]volume=0.9[m];[2:a]atempo=0.7407,volume=0.28[s];[m][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$dir/out/$final"
  else
    ffmpeg -nostdin -v error -y -i "$dir/out/slow_noaudio.mp4" -i "$dir/out/music_slow.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$dir/out/$final"
  fi
  echo "   listo $final $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/out/$final")s"
}
job 06-nuevo        AeroBurger_06_MenuDeABordo_Calmado.mp4      "PAGE=index.html"  84.656 3.51  33.21 "--breakdown 20.52 26.19" sfx.wav
job 07-aerosanduche AeroBurger_07_Aerosanduche_Mesa_Calmado.mp4 "THEME=mesa"       88.889 4.05  22.95 "" sfx_mesa.wav
job 09-noche        AeroBurger_09_UnaNoche_Calmado.mp4          "PAGE=index.html"  74.074 0.0   33.21 "" ""
job 02-airbus       AeroBurger_02_Airbus_Calmado.mp4            "PAGE=index.html"  88.889 3.942 26.325 "" sfx.wav
job 03-gavilan      AeroBurger_03_Gavilan_Calmado.mp4           "THEME=light"      88.889 4.32  28.35 "" sfx.wav
echo TODO_LISTO
