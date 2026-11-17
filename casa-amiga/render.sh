#!/usr/bin/env bash
# Casa Amiga · render
#   ./render.sh            → borrador 30 fps (rápido)
#   ./render.sh final      → final 60 fps, calidad de entrega, desenfoque de movimiento
set -euo pipefail
cd "$(dirname "$0")"
CLI="node ../.claude/skills/hyperframes/scripts/plugin-cli.mjs"
if ! [ -f ../.claude/skills/hyperframes/scripts/plugin-cli.mjs ]; then CLI="npx --yes hyperframes@0.9.64"; fi
mkdir -p renders
if [ "${1:-}" = "final" ]; then
  node tools/build.mjs --final
  $CLI render --fps 60 --quality delivery -o renders/casa-amiga-final.mp4 --skill=hyperframes
  node tools/build.mjs   # deja el proyecto otra vez en modo borrador
else
  node tools/build.mjs
  $CLI render --fps 30 --quality draft -o renders/casa-amiga-borrador.mp4 --skill=hyperframes
fi
