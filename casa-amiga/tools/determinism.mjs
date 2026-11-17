#!/usr/bin/env node
// Prueba de determinismo: 30 instantes aleatorios (semilla fija), dos pasadas en órdenes distintos,
// hash SHA-256 de los píxeles de cada cuadro. Deben ser idénticos.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const mode = process.argv.includes('--final') ? 'final' : 'draft';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/gen/config.json'), 'utf8'));
let s = 20261117;
const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const fps = cfg.fps;
const ts = [...Array(30)].map(() => Math.floor(rnd() * cfg.total * fps) / fps);
const orderB = [...ts].sort(() => rnd() - 0.5).sort((a, b) => ((a * 7919) % 1) - ((b * 7919) % 1));
const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://127.0.0.1:${port}/?mode=${mode}`);
await page.evaluate(() => window.__casa.ready);
const pass = async (list) => { const m = new Map(); for (const t of list) m.set(t, await page.evaluate((t) => window.__casa.hash(t), t)); return m; };
const A = await pass(ts);
const B = await pass(orderB.reverse());
await browser.close(); server.close();
const bad = ts.filter((t) => A.get(t) !== B.get(t));
const rep = { mode, samples: ts.length, identical: ts.length - bad.length, mismatches: bad.map((t) => +t.toFixed(3)), ok: bad.length === 0 };
fs.mkdirSync(path.join(ROOT, 'renders'), { recursive: true });
fs.writeFileSync(path.join(ROOT, `renders/determinismo-${mode}.json`), JSON.stringify(rep, null, 2));
console.log(JSON.stringify(rep, null, 2));
process.exit(rep.ok ? 0 : 1);
