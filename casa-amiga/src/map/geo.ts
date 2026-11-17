// Geometría compartida: curvas Catmull-Rom → Bézier cúbicas, muestreo por longitud, campo de ruido con semilla.
import { mulberry32, clamp } from '../ease';

export type P = readonly [number, number];

/** Path2D suave (Bézier cúbicas) que pasa por todos los puntos. */
export function smoothPath(pts: readonly P[], path = new Path2D()): Path2D {
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    path.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  return path;
}

/** Muestreo denso de la misma curva (para longitud, trazado progresivo y cámara que la sigue). */
export function sampleSmooth(pts: readonly P[], perSeg = 40): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg, mt = 1 - t;
      out.push([
        mt * mt * mt * p1[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * p2[0],
        mt * mt * mt * p1[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
  return out;
}

export class Polyline {
  L: number[] = [0];
  total: number;
  constructor(public pts: [number, number][]) {
    for (let i = 1; i < pts.length; i++) this.L.push(this.L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    this.total = this.L[this.L.length - 1];
  }
  at(f: number): [number, number, number] {
    const d = clamp(f) * this.total;
    let lo = 0, hi = this.L.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.L[m] < d) lo = m; else hi = m; }
    const a = this.pts[lo], b = this.pts[hi];
    const u = (d - this.L[lo]) / Math.max(1e-6, this.L[hi] - this.L[lo]);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  /** Fracción de longitud del punto más cercano a p. */
  fractionOf(p: P): number {
    let best = 0, bd = Infinity;
    for (let i = 0; i < this.pts.length; i++) { const d = Math.hypot(this.pts[i][0] - p[0], this.pts[i][1] - p[1]); if (d < bd) { bd = d; best = i; } }
    return this.L[best] / this.total;
  }
  /** Path2D hasta la fracción f (para la ruta que se dibuja sola). */
  partial(f: number): Path2D {
    const p = new Path2D(); const d = clamp(f) * this.total;
    p.moveTo(this.pts[0][0], this.pts[0][1]);
    for (let i = 1; i < this.pts.length; i++) {
      if (this.L[i] >= d) { const [x, y] = this.at(f); p.lineTo(x, y); break; }
      p.lineTo(this.pts[i][0], this.pts[i][1]);
    }
    return p;
  }
}

/** Ruido de valor suave (fbm) con semilla fija: un solo campo para sombreado y curvas de nivel. */
export function makeNoise(seed: number) {
  const rnd = mulberry32(seed);
  const N = 256, perm = new Uint16Array(N * 2), val = new Float32Array(N);
  for (let i = 0; i < N; i++) { perm[i] = i; val[i] = rnd(); }
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  for (let i = 0; i < N; i++) perm[N + i] = perm[i];
  const v = (x: number, y: number) => val[perm[(perm[x & 255] + y) & 511]];
  const q = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = q(xf), w = q(yf);
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
  return (x: number, y: number) => {
    let s = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++) { s += amp * noise(x * f, y * f); amp *= 0.5; f *= 2.03; }
    return s;
  };
}
