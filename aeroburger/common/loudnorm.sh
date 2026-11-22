#!/usr/bin/env bash
# Normalización de sonoridad en dos pasadas (lineal): -14 LUFS integrados, pico real -1.5 dBTP.
set -euo pipefail
in=$1; out=$2
J=$(ffmpeg -nostdin -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -nostdin -v error -y -i "$in" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le "$out"
