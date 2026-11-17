#!/usr/bin/env node
// Capturas de cuadros sueltos (para revisar sin renderizar todo) y hojas de contacto.
//   node tools/shots.mjs --at 1,2.5,8 --out renders/shots [--mode draft|final] [--sheet nombre.jpg] [--cols 6]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const times = arg('--at', '1').split(',').map(Number);
const out = path.resolve(ROOT, arg('--out', 'renders/shots'));
const mode = arg('--mode', 'draft');
fs.mkdirSync(out, { recursive: true });
const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
await page.goto(`http://127.0.0.1:${port}/?mode=${mode}&canvas=1`);
await page.evaluate(() => window.__casa.ready);
const files = [];
for (const t of times) {
  const t0 = Date.now();
  await page.evaluate((t) => window.__casa.seek(t), t);
  const f = path.join(out, `t${t.toFixed(2).padStart(6, '0')}.png`);
  await page.locator('#c').screenshot({ path: f });
  files.push(f);
  console.log(`${t}s  ${Date.now() - t0} ms`);
}
await browser.close(); server.close();
const sheet = arg('--sheet', '');
if (sheet) {
  const cols = Number(arg('--cols', 6));
  const lab = files.map((f, i) => ['-i', f]).flat();
  const filt = files.map((_, i) => `[${i}:v]scale=360:-1,drawtext=text='${times[i]} s':x=10:y=10:fontsize=24:fontcolor=white:box=1:boxcolor=0x16110Ecc:boxborderw=6[v${i}]`).join(';');
  const rows = Math.ceil(files.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...lab, '-filter_complex', `${filt};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 368}_${Math.floor(i / cols) * 648}`).join('|')}:fill=0x1d1410[o]`, '-map', '[o]', '-frames:v', '1', path.resolve(ROOT, sheet)]);
  console.log('hoja:', sheet, rows, 'filas');
}
