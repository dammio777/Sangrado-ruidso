// Convierte dist-artifact/index.html en una página para el visor de artefactos
// (sin <!doctype>/<html>/<head>/<body>; el visor pone el esqueleto).
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
const src = readFileSync('dist-artifact/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<title>[\s\S]*?<\/title>/, '');
const body = src.match(/<body>([\s\S]*?)<\/body>/)[1];
const out = `<title>Entreverde</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${head.trim()}\n${body.trim()}\n`;
if (existsSync('artifact')) rmSync('artifact', { recursive: true });
mkdirSync('artifact');
cpSync('dist-artifact', 'artifact', { recursive: true });
writeFileSync('artifact/index.html', out);
console.log('ok');
