// Siluetas de las montañas de Santa Elena: crestas suaves, pinos y cipreses.
import { rng } from '../../lib/geometry.js';

export const W = 1440;
export const H = 440;
const f = (n) => Math.round(n * 10) / 10;

function ridgeFn(base, waves) {
  return (x) => base - waves.reduce((s, [a, fr, ph]) => s + a * Math.sin(x * fr + ph), 0);
}

/** Pino tipo ciprés con tres pisos. */
export function pinePath(x, baseY, h, w) {
  const t1 = baseY - h, y1 = baseY - h * 0.55, y2 = baseY - h * 0.25;
  const w1 = w * 0.42, w2 = w * 0.72, w3 = w;
  const tr = Math.max(1.5, w * 0.1);
  return (
    `M${f(x)} ${f(t1)}` +
    `L${f(x + w1)} ${f(y1)}L${f(x + w1 * 0.45)} ${f(y1)}` +
    `L${f(x + w2)} ${f(y2)}L${f(x + w2 * 0.45)} ${f(y2)}` +
    `L${f(x + w3)} ${f(baseY - h * 0.02)}L${f(x + tr)} ${f(baseY - h * 0.02)}L${f(x + tr)} ${f(baseY + 6)}` +
    `L${f(x - tr)} ${f(baseY + 6)}L${f(x - tr)} ${f(baseY - h * 0.02)}L${f(x - w3)} ${f(baseY - h * 0.02)}` +
    `L${f(x - w2 * 0.45)} ${f(y2)}L${f(x - w2)} ${f(y2)}` +
    `L${f(x - w1 * 0.45)} ${f(y1)}L${f(x - w1)} ${f(y1)}Z`
  );
}

function layer({ base, waves, pines, seed }) {
  const y = ridgeFn(base, waves);
  let d = `M0 ${H} L0 ${f(y(0))}`;
  for (let x = 12; x <= W; x += 12) d += ` L${x} ${f(y(x))}`;
  d += ` L${W} ${H} Z`;
  if (pines) {
    const r = rng(seed);
    let x = pines.start ?? 0;
    while (x < W) {
      const skip = pines.skip?.some(([a, b]) => x > a && x < b);
      if (!skip && r() > pines.gap) {
        const h = pines.minH + r() * (pines.maxH - pines.minH);
        d += ' ' + pinePath(x, y(x) + 3, h, h * pines.ratio);
      }
      x += pines.step * (0.6 + r() * 0.8);
    }
  }
  return { d, y };
}

export const far = layer({
  base: 220,
  waves: [[48, 0.0042, 1.2], [26, 0.011, 0.3], [10, 0.031, 2]],
  pines: { step: 22, minH: 10, maxH: 20, ratio: 0.28, gap: 0.55, seed: 3 },
  seed: 3,
});

export const mid = layer({
  base: 292,
  waves: [[34, 0.0051, 3.6], [18, 0.0133, 1.1], [7, 0.04, 0.4]],
  pines: { step: 18, minH: 18, maxH: 36, ratio: 0.27, gap: 0.35, seed: 11 },
});

export const CABIN_X = 870;
const nearWaves = [[16, 0.0047, 0.4], [10, 0.016, 2.2], [4, 0.05, 1]];
export const near = layer({
  base: 372,
  waves: nearWaves,
  pines: { step: 16, minH: 34, maxH: 74, ratio: 0.26, gap: 0.22, seed: 29, skip: [[CABIN_X - 120, CABIN_X + 100]] },
});

/** Cabaña A-frame de madera con ventanas. */
const gy = near.y(CABIN_X) + 6;
const cx = CABIN_X;
export const cabin = {
  ground: gy,
  body: `M${cx - 78} ${gy} L${cx - 78} ${gy - 52} L${cx + 58} ${gy - 52} L${cx + 58} ${gy} Z`,
  roof: `M${cx - 96} ${gy - 46} L${cx - 10} ${gy - 132} L${cx + 76} ${gy - 46} L${cx + 66} ${gy - 46} L${cx - 10} ${gy - 120} L${cx - 86} ${gy - 46} Z`,
  gable: `M${cx - 86} ${gy - 46} L${cx - 10} ${gy - 120} L${cx + 66} ${gy - 46} Z`,
  chimney: `M${cx + 26} ${gy - 104} L${cx + 26} ${gy - 130} L${cx + 40} ${gy - 130} L${cx + 40} ${gy - 90} Z`,
  smoke: { x: cx + 33, y: gy - 136 },
  windows: [
    { kind: 'rect', x: cx - 64, y: gy - 40, w: 18, h: 24 },
    { kind: 'rect', x: cx - 38, y: gy - 40, w: 18, h: 24 },
    { kind: 'door', x: cx - 8, y: gy - 42, w: 20, h: 42 },
    { kind: 'rect', x: cx + 24, y: gy - 40, w: 22, h: 24 },
    { kind: 'tri', x: cx - 10, y: gy - 100 },
  ],
};
