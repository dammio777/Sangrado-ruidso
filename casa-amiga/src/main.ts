// Arranque: fuentes → config → imágenes (decode) → mapas → Film. Expone la API de captura y la vista previa.
import * as THREE from 'three';
import { Gfx, canvasTexture } from './engine/gfx';
import { loadFonts, loadImage, pinTexture, ringTexture, keyboardTexture, placeholderTexture } from './engine/assets';
import { loadConfig, times } from './config';
import { DigitalMap } from './map/digital';
import { SketchMap } from './map/sketch';
import { Film, type Quality } from './film';
import { state, type Assets } from './scene';
import { color as C, render as RQ, stage } from './tokens';

declare global {
  interface Window {
    __casa: {
      ready: Promise<void>;
      total: number; fps: number; frames: number;
      renderTo(i: number, url: string): Promise<{ n: number; ms: number; maxDisp: number; cpu: number; gpuRead: number; post: number }>;
      hash(t: number): Promise<string>;
      flush(): Promise<void>;
      seek(t: number): Promise<void>;
      mapShot(kind: 'digital' | 'sketch', cx: number, cy: number, z: number): string;
      prof(): Record<string, number> | null;
    };
  }
}

const params = new URLSearchParams(location.search);
const mode = (params.get('mode') ?? 'preview') as 'draft' | 'final' | 'preview';
const Q: Quality = mode === 'final' ? { ...RQ.final } : mode === 'draft' ? { ...RQ.draft } : { ...RQ.preview };
if (params.get('fps')) Q.fps = Number(params.get('fps'));

const canvas = document.getElementById('c') as HTMLCanvasElement;
let film!: Film;
let A!: Assets;
const buf = new Uint8Array(stage.w * stage.h * 4);
const bufs = [new Uint8Array(stage.w * stage.h * 4), new Uint8Array(stage.w * stage.h * 4)];
let inflight: Promise<void> | null = null;

// cuadros de video ya extraídos por ffmpeg (decodificación exacta por índice, nunca <video>.currentTime)
const frameCache = new Map<string, THREE.Texture>();
function frameKey(clip: number, local: number): { key: string; url: string } | null {
  const c = A.cfg.clips[clip];
  if (!c || !c.existe || c.frameCount <= 0) return null;
  const idx = Math.min(c.frameCount - 1, Math.max(0, Math.floor(local * A.cfg.fps + 1e-4)));
  return { key: `${clip}:${idx}`, url: `${c.framesPath}${String(idx + 1).padStart(5, '0')}.jpg` };
}
async function ensureFootage(t: number) {
  const f = state(t, A, { screenSS: Q.screenSS, footT: t });
  const want = new Set<string>();
  for (const fr of f.footage) {
    const k = frameKey(fr.clip, fr.local); if (!k) continue;
    want.add(k.key);
    if (!frameCache.has(k.key)) {
      const img = new Image(); img.src = k.url; await img.decode();
      const tex = new THREE.Texture(img); tex.flipY = false; tex.colorSpace = THREE.NoColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
      frameCache.set(k.key, tex);
    }
  }
  for (const [k, tex] of frameCache) if (!want.has(k)) { tex.dispose(); frameCache.delete(k); }
}

async function boot() {
  await loadFonts();
  const cfg = await loadConfig();
  if (mode !== 'preview') Q.fps = cfg.fps;
  const T = times(cfg);
  const [icono, firma, logo, letrero, obra, ceramica, taller, cabana, hongo] = await Promise.all([
    loadImage('/img/icono.png'), loadImage('/img/firma.png'), loadImage('/logo.png'), loadImage('/fotos/letrero.jpg'),
    loadImage('/fotos/obra.svg'), loadImage('/fotos/ceramica.svg'), loadImage('/fotos/taller.svg'), loadImage('/fotos/cabana.svg'), loadImage('/fotos/hongo.svg'),
  ]);
  const gfx = new Gfx(canvas);
  A = {
    cfg, T,
    mapD: new DigitalMap(stage.screen.w, stage.screen.h, Q.mapSS),
    mapS: new SketchMap(stage.screen.w, stage.screen.h, Q.mapSS),
    pin: pinTexture(icono.el), logo: logo.tex, firma, icono,
    photos: { letrero, obra, ceramica, taller, cabana, hongo },
    ring: ringTexture('AMOR Y AMISTAD · ARTE · DISEÑO ·', 200, C.cream),
    keyboard: keyboardTexture(stage.screen.w, 568),
    placeholders: cfg.clips.map((c) => placeholderTexture(c.etiqueta, c.dur, c.framesPath ? `assets/videos/video${cfg.clips.indexOf(c) + 1}.mp4` : '')),
    footFrame: (clip, local) => { const k = frameKey(clip, local); return k ? frameCache.get(k.key) ?? null : null; },
  };
  film = new Film(gfx, A, Q);
  if (params.get('prof')) film.prof = {};
  film.toCanvas = mode === 'preview' || params.has('canvas');
  // calentar: compila shaders y sube texturas antes del primer cuadro medido
  await ensureFootage(0); film.render(0, 0);
  void canvasTexture;
}

const ready = boot();
window.__casa = {
  ready,
  get total() { return A?.T.END ?? 0; },
  get fps() { return Q.fps; },
  get frames() { return Math.round((A?.T.END ?? 0) * Q.fps); },
  async renderTo(i, url) {
    const t = i / Q.fps;
    await ensureFootage(t);
    const t0 = performance.now();
    const s = film.render(t, i);
    const t1 = performance.now();
    // el envío del cuadro anterior se superpone con el render de éste; nunca hay más de uno en vuelo
    if (inflight) await inflight;
    const out = bufs[i % 2];
    film.gfx.read(out);
    const t2 = performance.now();
    inflight = fetch(`${url}?i=${i}`, { method: 'POST', body: out }).then(() => undefined);
    const t3 = performance.now();
    return { n: s.n, ms: t2 - t0, maxDisp: s.maxDisp, cpu: t1 - t0, gpuRead: t2 - t1, post: t3 - t2 };
  },
  async flush() { if (inflight) await inflight; inflight = null; },
  async hash(t) {
    await ensureFootage(t);
    film.render(t, Math.round(t * Q.fps));
    film.gfx.read(buf);
    const d = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
  },
  async seek(t) { await ensureFootage(t); film.render(t, Math.round(t * Q.fps)); },
  prof() { const p = film.prof; film.prof = p ? {} : null; return p; },
  mapShot(kind, cx, cy, z) {
    if (kind === 'digital') { A.mapD.draw({ cx, cy, z }, 0, 1); return A.mapD.canvas.toDataURL('image/png'); }
    A.mapS.draw({ cx, cy, z }, 1); return A.mapS.canvas.toDataURL('image/png');
  },
};

// ───────── vista previa (no se usa al renderizar) ─────────
if (mode === 'preview') {
  ready.then(() => {
    const ui = document.getElementById('ui')!; ui.style.display = 'flex';
    const sl = document.getElementById('t') as HTMLInputElement; const lab = document.getElementById('lab')!; const play = document.getElementById('play')!;
    sl.max = String(A.T.END); sl.step = '0.001';
    let playing = false, t0 = 0, base = 0, frames = 0, fpsT = performance.now();
    const show = async (t: number) => { await window.__casa.seek(t); frames++; const now = performance.now(); if (now - fpsT > 500) { lab.textContent = `${t.toFixed(2)} s · ${((frames * 1000) / (now - fpsT)).toFixed(0)} fps`; frames = 0; fpsT = now; } };
    sl.oninput = () => { playing = false; void show(Number(sl.value)); };
    play.onclick = () => { playing = !playing; t0 = performance.now(); base = Number(sl.value); if (playing) loop(); };
    const loop = async () => { if (!playing) return; let t = base + (performance.now() - t0) / 1000; if (t > A.T.END) { t = 0; base = 0; t0 = performance.now(); } sl.value = String(t); await show(t); requestAnimationFrame(loop); };
    void show(0);
  }).catch((e) => { document.body.insertAdjacentHTML('beforeend', `<pre style="color:#fff">${String(e)}</pre>`); });
}
