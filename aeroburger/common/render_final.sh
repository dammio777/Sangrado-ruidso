#!/usr/bin/env bash
# Render final (sin audio) de los 3 videos: captura PNG sin pérdida, CRF 13.
set -uo pipefail; cd "$(dirname "$0")/.."
(cd 06-nuevo        && LOSSLESS=1 CRF=13 TIMESCALE=1.35 OUT=final_noaudio.mp4 node src/render.js video 60 | tail -1)
(cd 07-aerosanduche && LOSSLESS=1 CRF=13 TIMESCALE=1.5 THEME=mesa OUT=final_noaudio.mp4 node src/render.js video 60 | tail -1)
(cd 10-llegar       && LOSSLESS=1 CRF=13 OUT=final_noaudio.mp4 node src/render.js video 60 | tail -1)
echo TODO_LISTO
