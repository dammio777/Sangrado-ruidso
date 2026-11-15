#!/usr/bin/env bash
# Instala skills, CLAUDE.md global, CLIs y servidores MCP de Claude Code (macOS/Linux).
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "== Skills y CLAUDE.md =="
mkdir -p ~/.claude/skills
cp -R "$DIR/skills/." ~/.claude/skills/
if [ -f ~/.claude/CLAUDE.md ] && ! grep -q "Preferencias globales" ~/.claude/CLAUDE.md; then
  printf "\n" >> ~/.claude/CLAUDE.md; cat "$DIR/CLAUDE.md" >> ~/.claude/CLAUDE.md
elif [ ! -f ~/.claude/CLAUDE.md ]; then
  cp "$DIR/CLAUDE.md" ~/.claude/CLAUDE.md
fi

echo "== CLIs =="
if [ "$(uname)" = "Darwin" ] && command -v brew >/dev/null; then
  command -v gh >/dev/null     || brew install gh
  command -v ffmpeg >/dev/null || brew install ffmpeg
elif command -v apt-get >/dev/null; then
  command -v gh >/dev/null     || sudo apt-get install -y gh
  command -v ffmpeg >/dev/null || sudo apt-get install -y ffmpeg
fi
command -v vercel >/dev/null || npm i -g vercel

echo "== MCP (scope usuario) =="
add() { claude mcp get "$1" >/dev/null 2>&1 || claude mcp add --scope user "$@"; }
add context7 -- npx -y @upstash/context7-mcp
add playwright -- npx @playwright/mcp@latest
add higgsfield --transport http https://mcp.higgsfield.ai/mcp
add figma      --transport http https://mcp.figma.com/mcp
add vercel     --transport http https://mcp.vercel.com
claude mcp list

echo "== Logins (abren el navegador) =="
gh auth status >/dev/null 2>&1 || gh auth login --web --git-protocol https
vercel whoami  >/dev/null 2>&1 || vercel login
echo "Listo. Abre 'claude' y corre /mcp para autenticar higgsfield, figma y vercel."
