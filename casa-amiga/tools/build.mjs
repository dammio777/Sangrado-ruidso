#!/usr/bin/env node
// Casa Amiga · build: clips.json + route.json + datos.json → assets/gen/config.json,
// cuadros de video exactos (ffmpeg, a los fps del render) y mezcla de audio (−14 LUFS, AAC 320k).
// Uso: node tools/build.mjs [--fps 30|60] [--no-audio]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = Number(arg('--fps', 30));
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const clipsCfg = rd('clips.json').clips;
const etapas = rd('route.json').etapas;
const datos = rd('datos.json');
const HO = 15.6, WIPE = 0.38;
const r3 = (x) => Math.round(x * 1000) / 1000;
const GEN = path.join(ROOT, 'assets/gen');
fs.mkdirSync(GEN, { recursive: true });

function probe(file) {
  try {
    const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { encoding: 'utf8' }));
    const v = j.streams.find((s) => s.codec_type === 'video');
    const a = j.streams.find((s) => s.codec_type === 'audio');
    const [n, d] = (v?.avg_frame_rate || '0/1').split('/').map(Number);
    return { dur: Number(j.format.duration), w: v?.width, h: v?.height, fps: d ? n / d : 0, audio: !!a };
  } catch { return null; }
}

let t = 0;
const clips = clipsCfg.map((c, i) => {
  const abs = path.join(ROOT, c.archivo || '');
  const info = c.archivo && fs.existsSync(abs) ? probe(abs) : null;
  const inicio = Number(c.inicio || 0);
  let dur = Number(c.duracion_placeholder || 8);
  if (info) dur = Math.max(0.5, Math.min(c.fin ?? info.dur, info.dur) - inicio);
  const out = { i, abs, info, inicio, dur: r3(dur), start: r3(t), c };
  t += dur;
  return out;
});
const F = r3(t);
const TOTAL = r3(HO + F + 3.9);
const C1 = HO + F;

// ── cuadros exactos de cada clip (recorte central a vertical sin deformar; cambio de fps sin cambiar la velocidad) ──
for (const c of clips) {
  c.framesPath = `/gen/frames/${FPS}/clip${c.i}/`;
  c.frameCount = 0;
  if (!c.info) continue;
  const dir = path.join(GEN, `frames/${FPS}/clip${c.i}`);
  const stamp = JSON.stringify({ f: c.abs, m: fs.statSync(c.abs).mtimeMs, i: c.inicio, d: c.dur, FPS });
  const sf = path.join(dir, '.stamp');
  if (!(fs.existsSync(sf) && fs.readFileSync(sf, 'utf8') === stamp)) {
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(c.inicio), '-i', c.abs, '-t', String(c.dur + WIPE + 0.1),
      '-vf', `fps=${FPS},scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,setsar=1`, '-q:v', '2', path.join(dir, '%05d.jpg')]);
    fs.writeFileSync(sf, stamp);
  }
  c.frameCount = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).length;
}

const datosOut = { ...datos }; delete datosOut._ayuda; delete datosOut.musica;
const cfg = {
  fps: FPS, footage: F, total: TOTAL,
  clips: clips.map((c) => ({
    start: c.start, dur: c.dur, existe: !!c.info, framesPath: c.framesPath, frameCount: c.frameCount,
    etiqueta: c.c.etiqueta || `VIDEO ${c.i + 1}`, antetitulo: c.c.antetitulo || '', titulo: c.c.titulo || '', navegacion: c.c.navegacion || '',
    texto_en: c.c.texto_en ?? 0.45, final: c.c.final ?? null,
  })),
  etapas, datos: datosOut,
};
fs.writeFileSync(path.join(GEN, 'config.json'), JSON.stringify(cfg, null, 2));

// ── efectos: suaves y "de vidrio", derivados de los sonidos base ──
const SFX = path.join(GEN, 'sfx'); fs.mkdirSync(SFX, { recursive: true });
const A = (f) => path.join(ROOT, 'assets/audio', f);
const mk = (name, args) => { const o = path.join(SFX, name); if (!fs.existsSync(o)) execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, o]); return o; };
const fx = {
  tap: mk('tap.wav', ['-i', A('sfx-click.mp3'), '-af', 'highpass=f=900,lowpass=f=7000,volume=0.55,afade=t=out:st=0.08:d=0.12']),
  tink: mk('tink.wav', ['-i', A('sfx-chime-bundled.mp3'), '-af', 'atrim=0:0.6,highpass=f=2200,volume=0.8,afade=t=out:st=0.15:d=0.45']),
  whoosh: mk('whoosh.wav', ['-f', 'lavfi', '-i', 'anoisesrc=d=0.9:c=pink:a=0.5:seed=7', '-af', 'bandpass=f=1100:width_type=o:w=1.6,afade=t=in:d=0.4:curve=qsin,afade=t=out:st=0.42:d=0.48:curve=qsin,volume=0.55']),
  drop: mk('drop.wav', ['-f', 'lavfi', '-i', 'anoisesrc=d=0.7:c=brown:a=0.5:seed=3', '-af', 'lowpass=f=900,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.45,volume=0.7']),
  tok: mk('tok.wav', ['-i', A('sfx-tok.mp3'), '-af', 'lowpass=f=1800,volume=0.6']),
  chime: mk('chime.wav', ['-i', A('sfx-chime-bundled.mp3'), '-af', 'highpass=f=500,volume=0.75,afade=t=out:st=1.6:d=0.9']),
};
const ev = [
  [fx.tap, 2.56, 0.5], [fx.tap, 3.99, 0.5], [fx.tink, 4.03, 0.35], [fx.whoosh, 4.2, 0.45], [fx.tok, 5.18, 0.8],
  [fx.whoosh, 8.92, 0.35], [fx.tink, 9.12 + 0.56, 0.3], [fx.tok, 14.44, 0.45], [fx.tap, 15.47, 0.5], [fx.tink, 15.52, 0.35],
  [fx.whoosh, HO + 0.36, 0.5], [fx.tok, C1 + 0.3, 0.8], [fx.chime, C1 + 1.3, 0.6],
];
clips.slice(1).forEach((c) => ev.push([fx.drop, HO + c.start - 0.05, 0.45]));
ev.push([fx.whoosh, C1 - 0.9, 0.3]);

let musicNote = 'sin música (falta ' + (datos.musica || 'assets/audio/musica.mp3') + ')';
if (!process.argv.includes('--no-audio')) {
  const inputs = [], filters = [], labels = [];
  ev.forEach(([f, at, v], i) => { inputs.push('-i', f); filters.push(`[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${v},adelay=${Math.round(at * 1000)}:all=1[e${i}]`); labels.push(`[e${i}]`); });
  let idx = ev.length;
  const mus = datos.musica && path.join(ROOT, datos.musica);
  const fa = HO + 0.9, fb = HO + F - 0.9;
  if (mus && fs.existsSync(mus)) {
    inputs.push('-stream_loop', '-1', '-i', mus);
    filters.push(`[${idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${TOTAL},afade=t=in:d=0.4,volume='1-0.5*clip((t-${fa.toFixed(2)})/0.8,0,1)+0.5*clip((t-${fb.toFixed(2)})/0.8,0,1)':eval=frame,afade=t=out:st=${(TOTAL - 1.8).toFixed(2)}:d=1.8[m]`);
    labels.push('[m]'); idx++; musicNote = 'música: ' + datos.musica;
  }
  // ambiente natural de los clips, bajito, bajo la música
  for (const c of clips) {
    const keep = c.info && (c.c.audio === 'si' || (c.c.audio !== 'no' && c.info.audio));
    if (!keep) continue;
    inputs.push('-ss', String(c.inicio), '-t', String(c.dur), '-i', c.abs);
    filters.push(`[${idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${c.c.volumen ?? 0.35},afade=t=in:d=0.25,afade=t=out:st=${Math.max(0, c.dur - 0.35).toFixed(2)}:d=0.35,adelay=${Math.round((HO + c.start) * 1000)}:all=1[c${idx}]`);
    labels.push(`[c${idx}]`); idx++;
  }
  inputs.push('-f', 'lavfi', '-t', String(TOTAL), '-i', 'anullsrc=r=48000:cl=stereo');
  labels.push(`[${idx}:a]`);
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest,atrim=0:${TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[out]`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'aac', '-b:a', '320k', path.join(GEN, 'mezcla.m4a')]);
}

console.log(`Casa Amiga · ${clips.length} clips · metraje ${F} s · total ${TOTAL} s (16.5 + ${F} + 3.0) · ${FPS} fps · ${musicNote}`);
clips.forEach((c) => console.log(`  ${c.i + 1}. ${c.info ? `${path.relative(ROOT, c.abs)} (${c.info.w}×${c.info.h}, ${c.info.fps.toFixed(2)} fps, audio ${c.info.audio ? 'sí' : 'no'}, ${c.frameCount} cuadros)` : 'TARJETA DE REEMPLAZO → ' + c.c.archivo} · ${c.start}–${r3(c.start + c.dur)} s`));
