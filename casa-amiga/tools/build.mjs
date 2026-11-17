#!/usr/bin/env node
// Casa Amiga · construye la película desde clips.json, route.json y datos.json.
// Uso: node tools/build.mjs [--final]
// Nunca hace falta tocar el código de animación: todo sale de los tres JSON.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FINAL = process.argv.includes('--final');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const clipsCfg = rd('clips.json').clips;
const hitos = rd('route.json').hitos;
const datos = rd('datos.json');

const HANDOFF = 15.6;      // la ventana del video se abre aquí (el intro "termina" en 16.5)
const WIPE = 0.36;         // duración del barrido entre clips
const r3 = (x) => Math.round(x * 1000) / 1000;

function probe(file) {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { encoding: 'utf8' });
    const j = JSON.parse(out);
    const v = j.streams.find((s) => s.codec_type === 'video');
    const a = j.streams.find((s) => s.codec_type === 'audio');
    let w = v?.width, h = v?.height; const rot = Number(v?.tags?.rotate || v?.side_data_list?.find((d) => d.rotation !== undefined)?.rotation || 0);
    if (Math.abs(rot) === 90) [w, h] = [h, w];
    const [n, d] = (v?.avg_frame_rate || '0/1').split('/').map(Number);
    return { dur: Number(j.format.duration), w, h, fps: d ? n / d : 0, audio: !!a };
  } catch (e) { return null; }
}

// ---------- clips ----------
let t = 0;
const clips = clipsCfg.map((c, i) => {
  const abs = path.join(ROOT, c.archivo || '');
  const exists = c.archivo && fs.existsSync(abs);
  const info = exists ? probe(abs) : null;
  let inicio = Number(c.inicio || 0), fin, dur;
  if (info) { fin = Math.min(c.fin ?? info.dur, info.dur); dur = Math.max(0.5, fin - inicio); }
  else dur = Number(c.duracion_placeholder || 6);
  const out = { i, archivo: c.archivo, existe: !!info, info, inicio, dur: r3(dur), start: r3(t), hito: c.hito, texto_en: c.texto_en ?? 0.35,
    etiqueta: c.etiqueta || `VIDEO ${i + 1}`, antetitulo: c.antetitulo || '', titulo: c.titulo || '', audio: c.audio || 'auto', volumen: c.volumen ?? 0.35 };
  t += dur; return out;
});
const F = r3(t);
const TOTAL = r3(HANDOFF + F + 3.9); // = 16.5 + metraje + 3.0
const C1 = HANDOFF + F;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ROAD = '<svg class="road" width="1080" height="1920" viewBox="0 0 1080 1920"><path d="M470 1150 L610 1150 L1080 1920 L0 1920 Z" fill="#20140F"/><path d="M470 1150 L0 1920 M610 1150 L1080 1920" stroke="#5A3A2A" stroke-width="4"/><path class="dash" d="M540 1150 L540 1920" stroke="#FFC874" stroke-width="18" stroke-dasharray="60 90" stroke-opacity=".55"/></svg>';
const PLAY = '<svg class="play" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="#F29021" stroke-width="5"/><path d="M80 62 L144 100 L80 138 Z" fill="#F29021"/></svg>';
const slots = clips.map((c, k) => {
  const last = k === clips.length - 1;
  const dd = r3(c.dur + (last ? 0 : WIPE)); // el clip sigue corriendo debajo del barrido
  const lane = k % 2;
  let inner;
  if (c.existe) {
    const keep = c.audio === 'si' || (c.audio === 'auto' && c.info.audio);
    const aud = keep ? `data-has-audio="true" data-volume="${c.volumen}" data-fade-in="0.25" data-fade-out="0.35"` : 'muted';
    inner = `<video id="r-v${k}" class="clip" src="${esc(c.archivo)}" data-start="${c.start}" data-duration="${dd}" data-media-start="${r3(c.inicio)}" data-track-index="${lane}" playsinline ${aud}></video>`;
  } else {
    const secs = c.dur.toFixed(1).replace('.', ',');
    inner = `<div data-layout-ignore class="ph clip" id="r-ph${k}" data-start="${c.start}" data-duration="${dd}" data-track-index="${lane}">${ROAD}<div class="frame"></div>${PLAY}<div class="lab">${esc(c.etiqueta)}</div><div class="dur">${secs} s</div><div class="file">${esc(c.archivo || '')}</div><div class="bar"><i></i></div></div>`;
  }
  return `        <div class="slot" id="r-slot${k}" style="z-index:${k + 1}">${inner}</div>`;
}).join('\n');
const caps = clips.map((c, k) => `    <div class="cap" id="r-cap${k}"><div class="e">${esc(c.antetitulo)}</div><div class="l">${esc(c.titulo)}</div></div>`).join('\n');

function replaceBlock(src, a, b, body) { const i = src.indexOf(a), j = src.indexOf(b); if (i < 0 || j < 0) throw new Error('marcador no encontrado: ' + a); return src.slice(0, i + a.length) + '\n' + body + '\n' + src.slice(j); }
function setConfig(file, obj) { const p = path.join(ROOT, file); let s = fs.readFileSync(p, 'utf8'); s = replaceBlock(s, '/*CONFIG:BEGIN*/', '/*CONFIG:END*/', '    const CONFIG = ' + JSON.stringify(obj) + ';\n    '); return [p, s]; }

const datosApp = { ...datos }; delete datosApp._ayuda; delete datosApp.musica;
let [pApp, sApp] = setConfig('compositions/app.html', { footage: F, handoff: HANDOFF, hitos, datos: datosApp });
sApp = sApp.replace(/(data-composition-id="app"[^>]*data-duration=")[\d.]+/, `$1${TOTAL}`);
fs.writeFileSync(pApp, sApp);

let [pR, sR] = setConfig('compositions/ruta.html', { footage: F, clips: clips.map((c) => ({ start: c.start, dur: c.dur, hito: c.hito, texto_en: c.texto_en })), hitos });
sR = replaceBlock(sR, '<!--CLIPS:BEGIN-->', '        <!--CLIPS:END-->', slots);
sR = replaceBlock(sR, '<!--CAPS:BEGIN-->', '    <!--CAPS:END-->', caps);
sR = sR.replace(/(data-composition-id="ruta"[^>]*data-duration=")[\d.]+/, `$1${F}`);
fs.writeFileSync(pR, sR);

// ---------- audio ----------
const audios = [];
let lane = 4;
const sfx = (id, src, at, vol) => { const d = src.includes('chime') ? 2.5 : 0.4; audios.push(`    <audio id="${id}" class="clip" src="${src}" data-start="${r3(at)}" data-duration="${d}" data-track-index="${lane}" data-volume="${vol}"></audio>`); lane = lane === 7 ? 4 : lane + 1; };
sfx('s-tap1', 'assets/audio/sfx-click.mp3', 2.56, 0.55);
const TYPE0 = 3.12, TYPEN = 22, TYPEDT = 0.7 / TYPEN;
for (let i = 0; i < TYPEN; i += 3) sfx('s-key' + i, 'assets/audio/sfx-click.mp3', TYPE0 + i * TYPEDT + 0.01, 0.22);
sfx('s-tap2', 'assets/audio/sfx-click.mp3', 3.99, 0.55);
sfx('s-tok1', 'assets/audio/sfx-tok.mp3', 5.13, 0.9);
sfx('s-tok2', 'assets/audio/sfx-tok.mp3', 14.47, 0.55);
sfx('s-tap3', 'assets/audio/sfx-click.mp3', 15.47, 0.55);
sfx('s-chime1', 'assets/audio/sfx-chime-bundled.mp3', 15.52, 0.22);
sfx('s-tok3', 'assets/audio/sfx-tok.mp3', C1 + 0.27, 0.9);
sfx('s-chime2', 'assets/audio/sfx-chime-bundled.mp3', C1 + 1.31, 0.5);

let musicNote = 'sin música (falta assets/audio/musica.mp3)';
const mus = datos.musica && path.join(ROOT, datos.musica);
if (mus && fs.existsSync(mus)) {
  // cama musical: se repite hasta cubrir toda la película, entra suave, baja (ducking) durante el metraje y cierra con fundido
  const a = HANDOFF + 0.9, b = HANDOFF + F - 0.9;
  const vol = `volume='1-0.45*clip((t-${a.toFixed(2)})/0.8,0,1)+0.45*clip((t-${b.toFixed(2)})/0.8,0,1)':eval=frame`;
  const bed = path.join(ROOT, 'assets/audio/_cama.m4a');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-stream_loop', '-1', '-i', mus, '-t', String(TOTAL), '-af',
    `afade=t=in:d=0.4,${vol},afade=t=out:st=${(TOTAL - 1.8).toFixed(2)}:d=1.8,loudnorm=I=-16:TP=-1.5:LRA=11`, '-c:a', 'aac', '-b:a', '192k', bed]);
  audios.unshift(`    <audio id="musica" class="clip" src="assets/audio/_cama.m4a" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-volume="0.8"></audio>`);
  musicNote = 'cama musical: ' + datos.musica;
}

let sIdx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
sIdx = replaceBlock(sIdx, '<!--AUDIO:BEGIN-->', '    <!--AUDIO:END-->', audios.join('\n'));
sIdx = sIdx.replace(/(id="root"[^>]*data-duration=")[\d.]+/, `$1${TOTAL}`);
sIdx = sIdx.replace(/(id="app"[^>]*data-duration=")[\d.]+/, `$1${TOTAL}`);
sIdx = sIdx.replace(/(id="ruta"[^>]*data-start=")[\d.]+(" data-duration=")[\d.]+/, `$1${HANDOFF}$2${F}`);
sIdx = sIdx.replace(/data-motion-blur="(on|off)"/, `data-motion-blur="${FINAL ? 'on' : 'off'}"`);
fs.writeFileSync(path.join(ROOT, 'index.html'), sIdx);

console.log(`Casa Amiga · ${clips.length} clips · metraje ${F}s · total ${TOTAL}s (16.5 + ${F} + 3.0) · ${musicNote}`);
clips.forEach((c) => console.log(`  ${c.i + 1}. ${c.existe ? c.archivo + ` (${c.info.w}×${c.info.h}, ${c.info.fps.toFixed(2)} fps, audio ${c.info.audio ? 'sí' : 'no'})` : 'TARJETA DE REEMPLAZO → ' + c.archivo} · ${c.start}s → ${r3(c.start + c.dur)}s`));
