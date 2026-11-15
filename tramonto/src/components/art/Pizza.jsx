import { rng } from '../../lib/geometry.js';
import { SunRing } from './Sun.jsx';

const f = (n) => Math.round(n * 100) / 100;

/** Mancha orgánica (queso derretido) con curvas suaves. */
function blob(cx, cy, r, rand, points = 7) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (0.72 + rand() * 0.5);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = '';
  for (let i = 0; i < points; i++) {
    const p = pts[i], n = pts[(i + 1) % points];
    const mid = [(p[0] + n[0]) / 2, (p[1] + n[1]) / 2];
    d += i === 0 ? `M${f(mid[0])} ${f(mid[1])}` : '';
    const nn = pts[(i + 2) % points];
    const mid2 = [(n[0] + nn[0]) / 2, (n[1] + nn[1]) / 2];
    d += `Q${f(n[0])} ${f(n[1])} ${f(mid2[0])} ${f(mid2[1])}`;
  }
  return d + 'Z';
}

const rand = rng(42);
const CHEESE = [
  [-22, -30, 15], [18, -36, 13], [36, -6, 14], [-38, 4, 13], [-6, 4, 16], [22, 28, 15], [-24, 34, 13], [4, -14, 9], [42, 24, 8],
].map(([x, y, r]) => blob(x, y, r, rand));
const SPOTS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + rand() * 0.2;
  const r = 64 + rand() * 4;
  return { x: f(Math.cos(a) * r), y: f(Math.sin(a) * r), rx: f(2 + rand() * 3), ry: f(1.2 + rand() * 1.6), rot: f((a * 180) / Math.PI + 90) };
});
const TOMATOES = [[-34, -18], [10, -48], [40, 10], [-14, 40], [16, 12], [-46, 26]];
const BASIL = [[-10, -40, 30], [30, -24, -40], [-30, 14, 120], [6, 46, 70], [48, -8, 200], [-2, -12, 160]];
const LEAF = 'M0 -11 C 7 -6, 7 6, 0 11 C -7 6, -7 -6, 0 -11 Z';

/** Pizza vista desde arriba en coordenadas -100..100 (sin plato). Los 64 rayos del sol → 8 cortes. */
export function PizzaTop({ cuts = true }) {
  return (
    <g>
      {/* borde */}
      <circle r="71" fill="#F6B547" />
      <circle r="71" fill="none" stroke="#B4400F" strokeOpacity=".35" strokeWidth="2" />
      {SPOTS.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill="#8A2F0C" opacity=".55" transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
      ))}
      {/* salsa */}
      <circle r="60" fill="#E6401C" />
      <circle r="60" fill="none" stroke="#8A2F0C" strokeOpacity=".25" strokeWidth="3" />
      {/* queso */}
      {CHEESE.map((d, i) => <path key={i} d={d} fill={i % 3 === 0 ? '#FFF8EE' : '#FFDDB8'} />)}
      {/* rodajas de tomate */}
      {TOMATOES.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="9.5" fill="#C24E35" />
          <circle r="7" fill="#E6401C" />
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2;
            return <ellipse key={k} cx={f(Math.cos(a) * 4)} cy={f(Math.sin(a) * 4)} rx="1.6" ry="1" fill="#FFDDB8" transform={`rotate(${(a * 180) / Math.PI} ${f(Math.cos(a) * 4)} ${f(Math.sin(a) * 4)})`} />;
          })}
        </g>
      ))}
      {/* albahaca */}
      {BASIL.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d={LEAF} fill="#5C7A3A" />
          <path d="M0 -9 L0 9" stroke="#3E5526" strokeWidth="1" />
        </g>
      ))}
      {/* cortes: los rayos del sol */}
      {cuts && (
        <g stroke="#8A2F0C" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round">
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="0" y1="-70" x2="0" y2="70" transform={`rotate(${a})`} />
          ))}
        </g>
      )}
    </g>
  );
}

/** Plato de cerámica pintada (crema) — el borde en zigzag es el anillo del logo. */
export function Plate() {
  return (
    <g>
      <SunRing />
      <circle r="81" fill="#FFF8EE" />
      <circle r="77" fill="none" stroke="#F6B547" strokeWidth="2.5" />
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return <circle key={i} cx={f(Math.cos(a) * 77)} cy={f(Math.sin(a) * 77)} r="1.7" fill="#E6401C" />;
      })}
    </g>
  );
}

/** Pizza completa en su plato. */
export default function Pizza({ className = '', title }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  return (
    <svg viewBox="-100 -100 200 200" className={className} {...a11y}>
      <Plate />
      <PizzaTop />
    </svg>
  );
}
