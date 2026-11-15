// Geometría del sol del logo (viewBox -100 -100 200 200, centro en 0,0).
// Medido sobre el logo: anillo zigzag rojo → línea blanca en zigzag → cuerpo naranja
// con ~64 rayos blancos en cuña y un centro blanco.

const TAU = Math.PI * 2;
const f = (n) => Math.round(n * 100) / 100;

/** Polígono de estrella (zigzag) con `teeth` puntas. */
export function starPoints(teeth, rOuter, rInner, phase = 0) {
  const pts = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = phase + (i / (teeth * 2)) * TAU - Math.PI / 2;
    pts.push(`${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}`);
  }
  return pts.join(' ');
}

/** Un rayo en cuña: punta fina hacia el centro, base ancha hacia afuera. */
export function rayPath(i, n, r0, r1, widthFactor = 0.56) {
  const a = (i / n) * TAU - Math.PI / 2;
  const w = (Math.PI / n) * widthFactor;
  const p0 = [Math.cos(a) * r0, Math.sin(a) * r0];
  const p1 = [Math.cos(a - w) * r1, Math.sin(a - w) * r1];
  const p2 = [Math.cos(a + w) * r1, Math.sin(a + w) * r1];
  return `M${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}Z`;
}

export function raysPath(n, r0, r1, widthFactor) {
  let d = '';
  for (let i = 0; i < n; i++) d += rayPath(i, n, r0, r1, widthFactor);
  return d;
}

export const SUN = {
  teeth: 40,
  rays: 64,
  ringOuter: starPoints(40, 99, 90.5),
  ringWhite: starPoints(40, 94, 85.5),
  ringOrange: starPoints(40, 89.5, 81),
  rays: raysPath(64, 22, 73, 0.56),
  rayList: Array.from({ length: 64 }, (_, i) => rayPath(i, 64, 22, 73, 0.56)),
  centerR: 30,
};

/** Generador pseudoaleatorio determinista (mismas montañas en cada carga). */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Data URI de una tira en zigzag repetible (tile 24×14). */
export function zigzagUri({ fill = 'none', stroke = 'none', strokeWidth = 2.2, flip = false } = {}) {
  const body = fill !== 'none'
    ? `<path d='M-6 14 L-6 13 L6 1 L18 13 L30 1 L30 14 Z' fill='${fill}'/>`
    : '';
  const line = stroke !== 'none'
    ? `<path d='M-6 13 L6 1 L18 13 L30 1' fill='none' stroke='${stroke}' stroke-width='${strokeWidth}' stroke-linejoin='miter'/>`
    : '';
  const t = flip ? ` transform='translate(0 14) scale(1 -1)'` : '';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='14' viewBox='0 0 24 14'><g${t}>${body}${line}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Zigzag vertical (para bordes laterales en el scroll horizontal). Tile 14×24, dientes hacia la izquierda. */
export function zigzagUriV({ fill = 'none', stroke = 'none' } = {}) {
  const body = fill !== 'none' ? `<path d='M14 -6 L13 -6 L1 6 L13 18 L1 30 L14 30 Z' fill='${fill}'/>` : '';
  const line = stroke !== 'none' ? `<path d='M13 -6 L1 6 L13 18 L1 30' fill='none' stroke='${stroke}' stroke-width='2.2'/>` : '';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='24' viewBox='0 0 14 24'>${body}${line}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
