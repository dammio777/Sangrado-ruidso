#!/usr/bin/env node
// Perfil por etapa (con gl.finish): node tools/profile.mjs --at 2.2,4.6,9.5
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const times = arg('--at', '2.2,4.6,9.5,18').split(',').map(Number);
const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(`http://127.0.0.1:${port}/?mode=${arg('--mode', 'draft')}&prof=1&canvas=1`);
await page.evaluate(() => window.__casa.ready);
for (const t of times) {
  await page.evaluate(() => window.__casa.prof());
  const t0 = Date.now();
  const r = await page.evaluate(async (t) => { await window.__casa.seek(t); return window.__casa.prof(); }, t);
  console.log(t, 's', Date.now() - t0, 'ms', JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v)]))));
}
await browser.close(); server.close();
