// Funciones puras de tiempo: easing, resortes, interpolación. Nada de estado acumulado.
import { motion } from './tokens';

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
export const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));
export const smooth = (u: number): number => u * u * (3 - 2 * u);

/** cubic-bezier(x1,y1,x2,y2) como en CSS, resuelto con Newton + bisección. */
export function bezier(x1: number, y1: number, x2: number, y2: number): (u: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sy = (s: number) => ((ay * s + by) * s + cy) * s;
  const dx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (u: number) => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let s = u;
    for (let i = 0; i < 6; i++) {
      const e = sx(s) - u, d = dx(s);
      if (Math.abs(e) < 1e-6) return sy(s);
      if (Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    let lo = 0, hi = 1; s = u;
    for (let i = 0; i < 30; i++) { const v = sx(s); if (Math.abs(v - u) < 1e-6) break; if (v < u) lo = s; else hi = s; s = (lo + hi) / 2; }
    return sy(s);
  };
}

export const inOut = bezier(...motion.inOut);
export const out = bezier(...motion.out);
export const easeIn = bezier(...motion.in);
export const sine = (u: number): number => -(Math.cos(Math.PI * u) - 1) / 2;

/** Resorte críticamente amortiguado (sin rebote), normalizado para llegar a 1 en u = 1. */
export function spring(u: number, w: number = motion.springW): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const W = w * 0.5;
  const f = (x: number) => 1 - (1 + x) * Math.exp(-x);
  return f(u * W) / f(W);
}

/** Un único asentamiento sutil (sólo para la caída del pin). */
export function settle(u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const w = 9, z = 0.62; // subamortiguado leve: ~4 % de sobrepaso, una sola vez
  const wd = w * Math.sqrt(1 - z * z);
  const s = u * 1.2;
  return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + (z * w / wd) * Math.sin(wd * s));
}

/** Tramo animado: 0 antes de a, 1 después de b, `e` en medio. */
export const k = (t: number, a: number, b: number, e: (u: number) => number = inOut): number => e(seg(t, a, b));

/** Interpolación de zoom de van Wijk & Nuij (como d3.interpolateZoom). p = [cx, cy, anchoVisible]. */
export function vanWijk(p0: readonly [number, number, number], p1: readonly [number, number, number], rho = Math.SQRT2) {
  const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1;
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
  const rho2 = rho * rho, rho4 = rho2 * rho2;
  if (d2 < 1e-9) {
    const S = Math.log(w1 / w0) / rho;
    return (t: number): [number, number, number] => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  return (t: number): [number, number, number] => {
    const s = t * S;
    const c0 = Math.cosh(r0);
    const u = (w0 / (rho2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
    return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
  };
}

/** PRNG con semilla fija (mulberry32). */
export function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entrada de texto estilo keynote: opacidad, deriva hacia arriba, blur → 0. Salida rápida con blur direccional. */
export function textAnim(t: number, tIn: number, tOut: number, dur = motion.textIn) {
  const ui = out(seg(t, tIn, tIn + dur));
  const uo = seg(t, tOut, tOut + motion.textOut);
  const eo = easeIn(uo);
  return {
    o: ui * (1 - eo),
    dy: (1 - ui) * motion.textDrift,
    blur: (1 - ui) * motion.textBlur + eo * 6,
    outU: eo,
    visible: t >= tIn && t < tOut + motion.textOut,
  };
}
