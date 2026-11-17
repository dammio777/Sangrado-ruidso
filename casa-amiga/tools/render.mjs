#!/usr/bin/env node
// Casa Amiga · render en paralelo.
//   node tools/render.mjs --draft            30 fps, 6–8 subcuadros sólo en movimientos rápidos, preset veryfast
//   node tools/render.mjs --final            60 fps, 8–16 subcuadros, CRF 15, preset slow
//   opciones: --workers N  --range a,b (segundos)  --out archivo.mp4  --estimate (sólo mide y estima)
// Chromium headless (Playwright) → RGBA crudo leído del canvas WebGL → stdin de ffmpeg (sin PNG por cuadro).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const argv = process.argv;
const arg = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const FINAL = argv.includes('--final');
const MODE = FINAL ? 'final' : 'draft';
const ENC = FINAL ? { preset: 'slow', crf: 15, fps: 60 } : { preset: 'veryfast', crf: 20, fps: 30 };
const FPS = Number(arg('--fps', ENC.fps));
const WORKERS = Number(arg('--workers', Math.max(1, os.cpus().length - 1)));
const OUT = path.resolve(ROOT, arg('--out', `renders/casa-amiga-${MODE}.mp4`));
const ESTIMATE = argv.includes('--estimate');

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...opts });

// 1) datos + cuadros + audio, 2) bundle
const tB = Date.now();
sh('node', ['tools/build.mjs', '--fps', String(FPS), ...(ESTIMATE ? ['--no-audio'] : [])]);
sh('npx', ['vite', 'build', '--logLevel', 'warn']);
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/gen/config.json'), 'utf8'));
const TOTAL = cfg.total;
const NF = Math.round(TOTAL * FPS);
let [r0, r1] = (arg('--range', `0,${TOTAL}`)).split(',').map(Number);
const f0 = Math.round(r0 * FPS), f1 = Math.min(NF, Math.round(r1 * FPS));
log(`build ${((Date.now() - tB) / 1000).toFixed(1)} s · ${MODE} · ${FPS} fps · cuadros ${f0}–${f1} de ${NF} · ${WORKERS} workers`);

// memoria pico (RSS de todos los procesos hijos: Chromium + ffmpeg + node)
let peakRSS = 0;
const rssAll = () => {
  let sum = 0;
  for (const pid of fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d))) {
    try { const st = fs.readFileSync(`/proc/${pid}/status`, 'utf8'); const m = /VmRSS:\s+(\d+)/.exec(st); const pp = /PPid:\s+(\d+)/.exec(st); if (m && pp) sum += Number(m[1]); } catch {}
  }
  return sum / 1024;
};
const base = rssAll();
const memTimer = setInterval(() => { peakRSS = Math.max(peakRSS, rssAll() - base); }, 1000);

const CH = path.join(ROOT, 'renders/.chunks'); fs.rmSync(CH, { recursive: true, force: true }); fs.mkdirSync(CH, { recursive: true });
const sinks = new Map();
const { server, port } = await serve(sinks);

// reparto en tramos contiguos (uno por worker)
const frames = f1 - f0;
const per = Math.ceil(frames / WORKERS);
const chunks = [...Array(WORKERS)].map((_, w) => [f0 + w * per, Math.min(f1, f0 + (w + 1) * per)]).filter(([a, b]) => b > a);
const stats = { n: [], ms: [], cpu: [], gpu: [], post: [], wall: [] };
const tR = Date.now();
let done = 0;

async function worker(w, [a, b]) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => console.error(`[w${w}]`, e.message));
  await page.goto(`http://127.0.0.1:${port}/?mode=${MODE}&fps=${FPS}`);
  await page.evaluate(() => window.__casa.ready);
  const file = path.join(CH, `part${String(w).padStart(2, '0')}.mp4`);
  const ff = ESTIMATE ? null : spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1080x1920', '-r', String(FPS), '-i', '-',
    '-vf', 'vflip,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', ENC.preset, '-crf', String(ENC.crf), '-threads', '2',
    '-x264-params', `keyint=${FPS * 2}:min-keyint=${FPS}`, '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  // escritura en orden estricto de índice (los envíos pueden solaparse)
  let next = a; const pending = new Map();
  const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });
  sinks.set(String(w), async (buf, i) => {
    if (!ff) return;
    pending.set(i, buf);
    while (pending.has(next)) { const b = pending.get(next); pending.delete(next); next += 1; await write(b); }
  });
  const step = ESTIMATE ? Math.max(1, Math.floor((b - a) / 40)) : 1;
  for (let i = a; i < b; i += step) {
    const tw = Date.now();
    const s = await page.evaluate(([i, url]) => window.__casa.renderTo(i, url), [i, `http://127.0.0.1:${port}/frame/${w}`]);
    stats.n.push(s.n); stats.ms.push(s.ms); stats.cpu.push(s.cpu); stats.gpu.push(s.gpuRead); stats.post.push(s.post); stats.wall.push(Date.now() - tw);
    done++;
    if (done % 50 === 0) log(`${done}/${ESTIMATE ? '~' : frames} cuadros · ${((Date.now() - tR) / done).toFixed(0)} ms/cuadro (pared)`);
  }
  await page.evaluate(() => window.__casa.flush());
  if (ff) { ff.stdin.end(); await new Promise((r) => ff.on('close', r)); }
  await browser.close();
  return file;
}

const parts = await Promise.all(chunks.map((c, w) => worker(w, c)));
clearInterval(memTimer);
server.close();
const wall = (Date.now() - tR) / 1000;
const sub = stats.n.reduce((a, b) => a + b, 0);
const avgN = sub / stats.n.length;
const avgMs = stats.ms.reduce((a, b) => a + b, 0) / stats.ms.length;
const fast = stats.n.filter((n) => n > 1).length;

if (ESTIMATE) {
  // estimación para el render completo: tiempo medido por cuadro muestreado × cuadros totales / workers
  // tiempo de pared real por cuadro (incluye GPU por software, lectura, envío y contención entre workers)
  const wallPer = stats.wall.reduce((x, y) => x + y, 0) / stats.wall.length;
  const est = (wallPer * NF) / 1000 / WORKERS * (FINAL ? 1.15 : 1.05);
  const av = (a) => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  const rep = { breakdownMs: { cpuSubmit: av(stats.cpu), gpuAndRead: av(stats.gpu), post: av(stats.post), evaluateWall: av(stats.wall) }, mode: MODE, fps: FPS, framesTotal: NF, sampled: stats.n.length, avgSubframes: +avgN.toFixed(2), avgMsPerFrame: +avgMs.toFixed(0), workers: WORKERS, estimatedSeconds: Math.round(est), estimatedMinutes: +(est / 60).toFixed(1), peakRSSMB: Math.round(peakRSS) };
  fs.writeFileSync(path.join(ROOT, `renders/estimacion-${MODE}.json`), JSON.stringify(rep, null, 2));
  console.log(JSON.stringify(rep, null, 2));
  process.exit(0);
}

// concatenación sin pérdida + audio + faststart
fs.writeFileSync(path.join(CH, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const audio = path.join(ROOT, 'assets/gen/mezcla.m4a');
const ss = (f0 / FPS).toFixed(3), dur = ((f1 - f0) / FPS).toFixed(3);
sh('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(CH, 'list.txt'), ...(fs.existsSync(audio) ? ['-ss', ss, '-t', dur, '-i', audio] : []),
  '-map', '0:v', ...(fs.existsSync(audio) ? ['-map', '1:a', '-c:a', 'copy'] : []), '-c:v', 'copy', '-movflags', '+faststart', '-t', dur, OUT]);
fs.rmSync(CH, { recursive: true, force: true });

// verificación con ffprobe
const pts = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', OUT], { encoding: 'utf8' }).trim().split('\n').map(Number).sort((a, b) => a - b);
const steps = pts.slice(1).map((p, i) => p - pts[i]);
const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', OUT], { encoding: 'utf8' }));
const v = info.streams.find((s) => s.codec_type === 'video');
const report = {
  mode: MODE, file: path.relative(ROOT, OUT), fps: FPS, frames: pts.length, expectedFrames: f1 - f0,
  duration: Number(info.format.duration), expectedDuration: +((f1 - f0) / FPS).toFixed(3),
  frameStepMin: +Math.min(...steps).toFixed(6), frameStepMax: +Math.max(...steps).toFixed(6), rFrameRate: v.r_frame_rate,
  size: `${v.width}x${v.height}`, pixFmt: v.pix_fmt, profile: v.profile, colorPrimaries: v.color_primaries,
  wallSeconds: +wall.toFixed(1), secondsPerVideoSecond: +(wall / ((f1 - f0) / FPS)).toFixed(2),
  avgSubframes: +avgN.toFixed(2), framesWithMotionBlur: fast, avgMsPerFramePerWorker: +avgMs.toFixed(0), workers: WORKERS, peakRSSMB: Math.round(peakRSS),
};
fs.writeFileSync(OUT.replace(/\.mp4$/, '.report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
