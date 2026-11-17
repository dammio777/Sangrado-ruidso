#!/usr/bin/env node
// Hojas de validación:
//  · antes/después: los mismos 12 instantes del borrador v1 y del v2, lado a lado
//  · mapa: 8 niveles de zoom + recorte al 100 % de un paneo lento (8 cuadros seguidos)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const R = (p) => path.join(ROOT, p);
const TMP = R('renders/.sheets'); fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

// ── antes / después ──
const T = [1.1, 3.7, 5.4, 6.3, 7.3, 8.0, 9.5, 10.6, 12.3, 15.55, 18.0, 35.4];
const before = R('renders/v1-borrador.mp4'), after = R(process.argv[2] || 'renders/casa-amiga-draft.mp4');
T.forEach((t, i) => {
  for (const [src, tag] of [[before, 'a'], [after, 'b']]) ff(['-ss', String(t), '-i', src, '-frames:v', '1', '-vf', 'scale=300:-1', path.join(TMP, `${tag}${i}.png`)]);
  ff(['-i', path.join(TMP, `a${i}.png`), '-i', path.join(TMP, `b${i}.png`), '-filter_complex',
    `[0:v]drawtext=text='v1':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=0x000000aa:boxborderw=5[a];[1:v]drawtext=text='v2 · ${t} s':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=0xF28C1Ecc:boxborderw=5[b];[a][b]hstack=inputs=2:shortest=1,pad=iw+16:ih+16:8:8:color=0x1d1410`, path.join(TMP, `p${i}.png`)]);
});
const ins = T.flatMap((_, i) => ['-i', path.join(TMP, `p${i}.png`)]);
ff([...ins, '-filter_complex', `${T.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${T.length}:layout=${T.map((_, i) => `${(i % 4) * 616}_${Math.floor(i / 4) * 549}`).join('|')}:fill=0x1d1410[o]`, '-map', '[o]', '-frames:v', '1', R('renders/antes-despues.jpg')]);
console.log('renders/antes-despues.jpg');

// ── mapa: zooms y paneo lento ──
const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://127.0.0.1:${port}/?mode=final`);
await page.evaluate(() => window.__casa.ready);
const save = async (url, f) => fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
const zooms = [0.42, 0.6, 0.85, 1.1, 1.5, 2.0, 2.6, 3.6];
for (let i = 0; i < zooms.length; i++) {
  const z = zooms[i];
  const u = i / (zooms.length - 1);
  const cx = 1700 + (3030 - 1700) * u, cy = 1830 + (1392 + 68 - 1830) * u;
  await save(await page.evaluate(([cx, cy, z]) => window.__casa.mapShot('digital', cx, cy, z), [cx, cy, z]), path.join(TMP, `z${i}.png`));
}
ff([...zooms.flatMap((_, i) => ['-i', path.join(TMP, `z${i}.png`)]), '-filter_complex',
  `${zooms.map((z, i) => `[${i}:v]scale=320:-1,drawtext=text='zoom ${z}':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=0x000000aa:boxborderw=5[v${i}]`).join(';')};${zooms.map((_, i) => `[v${i}]`).join('')}xstack=inputs=8:layout=${zooms.map((_, i) => `${(i % 4) * 328}_${Math.floor(i / 4) * 560}`).join('|')}:fill=0x1d1410[o]`, '-map', '[o]', '-frames:v', '1', R('renders/mapa-zooms.jpg')]);
for (let i = 0; i < 8; i++) await save(await page.evaluate(([x]) => window.__casa.mapShot('digital', x, 1400, 2.0), [2900 + i * 0.6]), path.join(TMP, `pan${i}.png`));
ff([...[...Array(8)].flatMap((_, i) => ['-i', path.join(TMP, `pan${i}.png`)]), '-filter_complex',
  `${[...Array(8)].map((_, i) => `[${i}:v]crop=300:300:560:900[c${i}]`).join(';')};${[...Array(8)].map((_, i) => `[c${i}]`).join('')}xstack=inputs=8:layout=${[...Array(8)].map((_, i) => `${(i % 4) * 304}_${Math.floor(i / 4) * 304}`).join('|')}:fill=0x1d1410[o]`, '-map', '[o]', '-frames:v', '1', R('renders/mapa-paneo-100.jpg')]);
await browser.close(); server.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('renders/mapa-zooms.jpg renders/mapa-paneo-100.jpg');
