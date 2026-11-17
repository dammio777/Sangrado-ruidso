// Recursos cacheados: fuentes, imágenes, texturas de texto (2×), íconos de trazo 1.5 px, pin, anillo de texto.
import * as THREE from 'three';
import { canvasTexture } from './gfx';
import { color as C, css, font, type RGB } from '../tokens';

const S = 2; // supermuestreo de texto e íconos

export async function loadFonts(): Promise<void> {
  const faces = [
    new FontFace('Inter Display', 'url(/fonts/inter-opsz.woff2)', { weight: '100 900' }),
    new FontFace('Inter Var', 'url(/fonts/inter-wght.woff2)', { weight: '100 900' }),
  ];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  await document.fonts.ready;
}

export interface Img { tex: THREE.Texture; w: number; h: number; el: HTMLImageElement }
const imgCache = new Map<string, Promise<Img>>();
export function loadImage(url: string): Promise<Img> {
  let p = imgCache.get(url);
  if (!p) {
    p = (async () => {
      const el = new Image();
      el.src = url;
      await el.decode();
      // raster a canvas (SVG incluido) para controlar premultiplicado y mipmaps
      const w = el.naturalWidth || 800, h = el.naturalHeight || 1000;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(el, 0, 0, w, h);
      return { tex: canvasTexture(c), w, h, el };
    })();
    imgCache.set(url, p);
  }
  return p;
}

// ───────────────────────── texto ─────────────────────────
export interface TextStyle {
  size: number; weight: number; tracking: number; color: RGB; alpha?: number; upper?: boolean; lh?: number;
}
export interface TextTex { tex: THREE.Texture; w: number; h: number; pad: number; adv: number }
const textCache = new Map<string, TextTex>();
const measureCtx = document.createElement('canvas').getContext('2d')!;

const fontStr = (s: TextStyle) => `${s.weight} ${s.size}px ${font.family}`;
function setFont(ctx: CanvasRenderingContext2D, s: TextStyle, scale: number) {
  ctx.font = `${s.weight} ${s.size * scale}px ${font.family}`;
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${s.tracking * s.size * scale}px`;
}
export function measure(str: string, s: TextStyle): number {
  setFont(measureCtx, s, 1);
  return measureCtx.measureText(s.upper ? str.toUpperCase() : str).width;
}

export function text(str: string, s: TextStyle): TextTex {
  const key = str + '|' + fontStr(s) + '|' + s.tracking + '|' + s.color.join(',') + '|' + (s.alpha ?? 1) + '|' + (s.upper ? 1 : 0);
  const hit = textCache.get(key);
  if (hit) return hit;
  const t = s.upper ? str.toUpperCase() : str;
  const adv = Math.max(1, measure(t, { ...s, upper: false }));
  const pad = 16;
  const lh = s.size * (s.lh ?? 1.25);
  const c = document.createElement('canvas');
  c.width = Math.ceil((adv + pad * 2) * S); c.height = Math.ceil((lh + pad * 2) * S);
  const ctx = c.getContext('2d')!;
  setFont(ctx, s, S);
  ctx.fillStyle = css(s.color, s.alpha ?? 1);
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(t, pad * S, (pad + lh * 0.5 + s.size * 0.36) * S);
  const r: TextTex = { tex: canvasTexture(c), w: adv + pad * 2, h: lh + pad * 2, pad, adv };
  textCache.set(key, r);
  return r;
}

/** Caracteres individuales con sus avances reales (para el escalonado por letra de los títulos). */
export function chars(str: string, s: TextStyle): { tex: TextTex; x: number }[] {
  const out: { tex: TextTex; x: number }[] = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    out.push({ tex: text(ch, s), x: measure(str.slice(0, i), s) });
  }
  return out;
}

// ───────────────────────── íconos (estilo SF Symbols: trazo redondeado 1.5 px) ─────────────────────────
type IconName = 'search' | 'mic' | 'arrowNE' | 'chevronL' | 'pinOutline' | 'gallery' | 'cup' | 'mountain' | 'brush' | 'route' | 'nav' | 'bookmark' | 'share' | 'close' | 'turnRight' | 'turnDown' | 'play' | 'car';
const iconCache = new Map<string, THREE.Texture>();
export function icon(name: IconName, size: number, col: RGB, stroke = 1.5, alpha = 1): THREE.Texture {
  const key = `${name}|${size}|${col.join(',')}|${stroke}|${alpha}`;
  const hit = iconCache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(size * S);
  const g = c.getContext('2d')!;
  g.scale((size * S) / 24, (size * S) / 24);
  g.strokeStyle = css(col, alpha); g.fillStyle = css(col, alpha);
  g.lineWidth = (stroke * 24) / size * 1.0; g.lineCap = 'round'; g.lineJoin = 'round';
  const P = (d: string, fill = false) => { const p = new Path2D(d); if (fill) g.fill(p); else g.stroke(p); };
  switch (name) {
    case 'search': P('M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z M15.3 15.3 L20 20'); break;
    case 'mic': P('M12 3.5a2.6 2.6 0 0 1 2.6 2.6v5a2.6 2.6 0 0 1-5.2 0v-5A2.6 2.6 0 0 1 12 3.5z M6.5 11a5.5 5.5 0 0 0 11 0 M12 16.5v3.5'); break;
    case 'arrowNE': P('M7 17 L17 7 M9 7 H17 V15'); break;
    case 'chevronL': P('M15 5 L8 12 L15 19'); break;
    case 'pinOutline': P('M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z M12 7.6a2.4 2.4 0 1 1 0 4.8a2.4 2.4 0 1 1 0-4.8z'); break;
    case 'gallery': P('M4 5.5h16v13H4z M6.5 16l4-4.5 3 3 2-2 2.5 3.5'); break;
    case 'cup': P('M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16'); break;
    case 'mountain': P('M3 19 L9.5 8.5 L13 14 L15.5 10.5 L21 19 Z'); break;
    case 'brush': P('M5 19 L14 10 M13 5.5l5.5 5.5-3 3-5.5-5.5z'); break;
    case 'route': P('M7 17 V11 a3 3 0 0 1 3 -3 H17 M14 5 l3 3 -3 3'); break;
    case 'nav': P('M12 3 L19.5 20 L12 15.5 L4.5 20 Z', true); break;
    case 'bookmark': P('M7 4h10v16l-5-3.5L7 20z'); break;
    case 'share': P('M12 15V4 M8 7.5 12 3.5 16 7.5 M6 11v8h12v-8'); break;
    case 'close': P('M7 7 L17 17 M17 7 L7 17'); break;
    case 'turnRight': P('M7 20 V12 a4 4 0 0 1 4 -4 H18 M14.5 4.5 L18 8 L14.5 11.5'); break;
    case 'turnDown': P('M12 4 V19 M7 14 L12 19 L17 14'); break;
    case 'play': P('M9 6.5 L18 12 L9 17.5 Z', true); break;
    case 'car': P('M5 15.5 l1.6-4.8a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4l1.6 4.8v3h-2.5v-1.5h-9v1.5H5z'); break;
  }
  const t = canvasTexture(c); iconCache.set(key, t); return t;
}

// ───────────────────────── pin de marca ─────────────────────────
export function pinTexture(iconImg: HTMLImageElement): THREE.Texture {
  const W = 130, H = 166, s = 3;
  const c = document.createElement('canvas'); c.width = W * s; c.height = H * s;
  const g = c.getContext('2d')!; g.scale(s, s);
  const path = new Path2D('M65 162 C65 162 10 101 10 63 A55 55 0 1 1 120 63 C120 101 65 162 65 162Z');
  const grd = g.createLinearGradient(0, 6, 0, 162);
  grd.addColorStop(0, '#FFB25A'); grd.addColorStop(0.45, css(C.orange)); grd.addColorStop(1, '#D9700F');
  g.fillStyle = grd; g.fill(path);
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.stroke(path);
  g.beginPath(); g.arc(65, 63, 43, 0, Math.PI * 2); g.fillStyle = '#FFF8EF'; g.fill();
  const iw = 74, ih = (iw * iconImg.naturalHeight) / iconImg.naturalWidth;
  g.drawImage(iconImg, 65 - iw / 2, 63 - ih / 2, iw, ih);
  return canvasTexture(c);
}

/** Texto circular "AMOR Y AMISTAD · ARTE · DISEÑO ·" en blanco fino. */
export function ringTexture(str: string, radius: number, col: RGB): THREE.Texture {
  const size = Math.ceil((radius + 40) * 2), s = 2;
  const c = document.createElement('canvas'); c.width = c.height = size * s;
  const g = c.getContext('2d')!; g.scale(s, s);
  const st: TextStyle = { size: 22, weight: 500, tracking: 0.08, color: col };
  g.font = `${st.weight} ${st.size}px ${font.family}`;
  g.fillStyle = css(col, 0.92); g.textAlign = 'center'; g.textBaseline = 'middle';
  const full = (str + ' ').repeat(2);
  const total = full.split('').reduce((a, ch) => a + g.measureText(ch).width + st.size * st.tracking, 0);
  const scale = (Math.PI * 2 * radius) / total;
  let acc = 0;
  for (const ch of full) {
    const w = (g.measureText(ch).width + st.size * st.tracking) * scale;
    const a = ((acc + w / 2) / (Math.PI * 2 * radius)) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(size / 2 + Math.cos(a) * radius, size / 2 + Math.sin(a) * radius); g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0); g.restore(); acc += w;
  }
  return canvasTexture(c);
}

/** Tarjeta de reemplazo para un video que todavía no llegó. */
export function placeholderTexture(label: string, dur: number, file: string): THREE.Texture {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const bg = g.createRadialGradient(W * 0.25, H * 0.12, 0, W * 0.25, H * 0.12, H * 0.95);
  bg.addColorStop(0, '#4A2B1E'); bg.addColorStop(0.55, css(C.espresso)); bg.addColorStop(1, '#170F0B');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // carretera en perspectiva (las líneas centrales se animan aparte)
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.beginPath(); g.moveTo(476, 1180); g.lineTo(604, 1180); g.lineTo(1080, 1920); g.lineTo(0, 1920); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(242,140,30,0.22)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(476, 1180); g.lineTo(0, 1920); g.moveTo(604, 1180); g.lineTo(1080, 1920); g.stroke();
  // marco fino naranja
  g.strokeStyle = css(C.orange, 0.9); g.lineWidth = 3;
  g.beginPath(); g.roundRect(56, 56, W - 112, H - 112, 28); g.stroke();
  // play
  g.beginPath(); g.arc(540, 700, 92, 0, Math.PI * 2); g.lineWidth = 3; g.stroke();
  g.fillStyle = css(C.orange); g.beginPath(); g.moveTo(516, 650); g.lineTo(584, 700); g.lineTo(516, 750); g.closePath(); g.fill();
  g.textAlign = 'center';
  g.font = `560 30px ${font.family}`; (g as unknown as { letterSpacing: string }).letterSpacing = '2.4px';
  g.fillStyle = css(C.cream, 0.92); g.fillText(label.toUpperCase(), 540, 900);
  (g as unknown as { letterSpacing: string }).letterSpacing = '-2px';
  g.font = `600 84px ${font.family}`; g.fillStyle = css(C.orange);
  g.fillText(dur.toFixed(1).replace('.', ',') + ' s', 540, 1010);
  (g as unknown as { letterSpacing: string }).letterSpacing = '0px';
  g.font = `450 26px ${font.family}`; g.fillStyle = css(C.warmGray); g.fillText(file, 540, 1070);
  return canvasTexture(c, false);
}

/** Teclado de vidrio esmerilado: sólo las teclas (el panel de vidrio se dibuja en el shader). */
export function keyboardTexture(w: number, h: number): THREE.Texture {
  const c = document.createElement('canvas'); c.width = w * S; c.height = h * S;
  const g = c.getContext('2d')!; g.scale(S, S);
  const rows = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];
  const kw = 74, kh = 92, gap = 10;
  g.font = `450 34px ${font.family}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  rows.forEach((r, i) => {
    const n = r.length + (i === 2 ? 2 : 0);
    const total = n * kw + (n - 1) * gap + (i === 2 ? 2 * 34 : 0);
    let x = (w - total) / 2; const y = 26 + i * (kh + 16);
    const keys = i === 2 ? ['⇧', ...r.split(''), '⌫'] : r.split('');
    keys.forEach((k) => {
      const ww = k === '⇧' || k === '⌫' ? kw + 34 : kw;
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.roundRect(x, y, ww, kh, 12); g.fill();
      g.fillStyle = css(C.ink, 0.72); g.fillText(k, x + ww / 2, y + kh / 2 + 1);
      x += ww + gap;
    });
  });
  const y = 26 + 3 * (kh + 16);
  const bottom: [string, number, boolean][] = [['123', 120, false], ['espacio', 420, false], ['Buscar', 196, true]];
  let x = (w - (120 + 420 + 196 + 2 * gap)) / 2;
  for (const [lbl, ww, pri] of bottom) {
    g.fillStyle = pri ? css(C.orange) : 'rgba(255,255,255,0.4)'; g.beginPath(); g.roundRect(x, y, ww, kh, 12); g.fill();
    g.fillStyle = pri ? '#fff' : css(C.ink, 0.55); g.font = `${pri ? 600 : 450} 28px ${font.family}`; g.fillText(lbl, x + ww / 2, y + kh / 2 + 1);
    x += ww + gap;
  }
  return canvasTexture(c);
}
