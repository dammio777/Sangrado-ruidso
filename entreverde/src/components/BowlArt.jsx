import { memo } from 'react';
import { rng } from '../lib/util.js';

/* Dibujo procedural de cada ingrediente. Determinista (semilla por ingrediente), así el bowl
   no "baila" al agregar o quitar algo: cada ingrediente siempre cae en el mismo lugar. */

function punto(r, R, margen = 0.92) {
  const a = r() * Math.PI * 2;
  const d = Math.sqrt(r()) * R * margen;
  return [Math.cos(a) * d, Math.sin(a) * d];
}
const deg = (r) => Math.round(r() * 360);

function pieza(forma, c, r, x, y, k, i) {
  const rot = deg(r);
  const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${k})`;
  switch (forma) {
    case 'shred': {
      const l = 10 + r() * 9;
      return (
        <g key={i} transform={t}>
          <path d={`M${-l} 0 q ${l * 0.6} ${-4 - r() * 4} ${l * 2} ${r() * 4 - 2}`} stroke={c[0]} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d={`M${-l + 3} 1.2 q ${l * 0.5} -3 ${l * 1.5} 0`} stroke={c[1]} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity=".8" />
        </g>
      );
    }
    case 'chunk': {
      const n = 7, pts = [];
      for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2; const rr = 6 + r() * 4; pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr * 0.8).toFixed(1)}`); }
      return (
        <g key={i} transform={t}>
          <polygon points={pts.join(' ')} fill={c[0]} stroke={c[0]} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="-2" cy="-2" rx="3.4" ry="2" fill={c[1]} opacity=".75" />
        </g>
      );
    }
    case 'bacon':
      return (
        <g key={i} transform={t}>
          <path d="M-14 0 q 3.5 -5 7 0 t 7 0 t 7 0 t 7 0" stroke={c[0]} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M-13 0.5 q 3.5 -5 7 0 t 7 0 t 7 0 t 7 0" stroke={c[1]} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".9" />
        </g>
      );
    case 'cube':
      return (
        <g key={i} transform={t}>
          <rect x="-5.5" y="-5.5" width="11" height="11" rx="2.4" fill={c[0]} />
          <rect x="-4.6" y="-4.6" width="5.5" height="5.5" rx="1.6" fill={c[1]} opacity=".85" />
        </g>
      );
    case 'tomato':
      return (
        <g key={i} transform={t}>
          <circle r="7.2" fill={c[0]} />
          <circle r="4.6" fill={c[1]} />
          <path d="M-2.6 -1 l 1.6 1.2 M2.2 -1.4 l -1.2 1.6 M0 2.6 l 0.2 -1.8" stroke="#F8D9C6" strokeWidth="1" strokeLinecap="round" />
        </g>
      );
    case 'ring': {
      const rr = 7.5 + r() * 4;
      return (
        <g key={i} transform={t}>
          <ellipse rx={rr} ry={rr * 0.82} fill="none" stroke={c[0]} strokeWidth="2.6" />
          <ellipse rx={rr - 3.2} ry={(rr - 3.2) * 0.82} fill="none" stroke={c[1]} strokeWidth="1.1" />
        </g>
      );
    }
    case 'mushroom':
      return (
        <g key={i} transform={t}>
          <path d="M-8 1 a 8 7 0 0 1 16 0 z" fill={c[1]} stroke={c[0]} strokeWidth="1.4" />
          <rect x="-2.4" y="0.4" width="4.8" height="7" rx="1.6" fill={c[1]} stroke={c[0]} strokeWidth="1.2" />
        </g>
      );
    case 'zucchini':
      return (
        <g key={i} transform={t}>
          <circle r="7.6" fill={c[1]} stroke={c[0]} strokeWidth="2.6" />
          <circle cx="-1.6" cy="-1" r=".9" fill="#B9C88A" /><circle cx="1.8" cy=".6" r=".9" fill="#B9C88A" /><circle cx="-.2" cy="2.4" r=".9" fill="#B9C88A" />
        </g>
      );
    case 'strip':
      return (
        <g key={i} transform={t}>
          <path d="M-10 2 q 10 -8 20 0" stroke={c[0]} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M-7 0.6 q 7 -5 14 0" stroke={c[1]} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".9" />
        </g>
      );
    case 'grate':
      return (
        <g key={i} transform={t}>
          <path d={`M${-6 - r() * 3} 0 q 6 ${r() * 3 - 1.5} ${12 + r() * 4} 0`} stroke={c[0]} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M-3 0.8 l 6 0" stroke={c[1]} strokeWidth="1" strokeLinecap="round" />
        </g>
      );
    case 'blob':
      return <circle key={i} transform={t} r={5.5 + r() * 2.5} fill={c[0]} stroke={c[1]} strokeWidth="1.3" />;
    case 'crumble': {
      const pts = [];
      for (let j = 0; j < 5; j++) { const a = (j / 5) * Math.PI * 2; const rr = 2.6 + r() * 2.6; pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`); }
      return <polygon key={i} transform={t} points={pts.join(' ')} fill={c[0]} stroke={c[1]} strokeWidth=".9" strokeLinejoin="round" />;
    }
    case 'string': {
      const l = 13 + r() * 10;
      return <path key={i} transform={t} d={`M${-l} 0 q ${l} ${r() * 6 - 3} ${l * 2} ${r() * 4 - 2}`} stroke={i % 3 ? c[0] : c[1]} strokeWidth="1.9" fill="none" strokeLinecap="round" />;
    }
    case 'sliver':
      return <ellipse key={i} transform={t} rx="6.4" ry="2.4" fill={c[0]} stroke={c[1]} strokeWidth=".9" />;
    case 'leaf':
      return (
        <g key={i} transform={t}>
          <path d="M-6 0 q 6 -6 12 0 q -6 6 -12 0 z" fill={i % 2 ? c[0] : c[1]} />
          <path d="M-5 0 l 10 0" stroke="#2C5A26" strokeWidth=".7" />
        </g>
      );
    case 'dice':
      return <rect key={i} transform={t} x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1.1" fill={c[i % c.length]} />;
    case 'egg':
      return (
        <g key={i} transform={t}>
          <ellipse rx="11" ry="8.6" fill={c[0]} />
          <ellipse cx="3" cy="2.6" rx="6" ry="3.6" fill={c[1]} opacity=".7" />
          <ellipse cx="-4" cy="-3" rx="2.6" ry="1.4" fill="#fff" opacity=".9" />
        </g>
      );
    case 'pineapple':
      return (
        <g key={i} transform={t}>
          <rect x="-6" y="-6" width="12" height="12" rx="2.6" fill={c[0]} />
          <path d="M-5 -2 l 10 4 M-5 2.6 l 10 4" stroke={c[1]} strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
        </g>
      );
    default:
      return null;
  }
}

function drizzle(c, r, R) {
  const hilos = [];
  const n = 5;
  for (let j = 0; j < n; j++) {
    const y0 = -R * 0.62 + (j / (n - 1)) * R * 1.24 + (r() * 10 - 5);
    const half = Math.sqrt(Math.max(0, (R * 0.84) ** 2 - y0 * y0)) * (0.7 + r() * 0.25);
    const fase = r() * 6;
    let d = '';
    for (let x = -half; x <= half; x += 5) d += `${d ? ' L' : 'M'}${x.toFixed(1)} ${(y0 + Math.sin(x / 8 + fase) * 5.5).toFixed(1)}`;
    hilos.push(d);
  }
  const motas = [];
  for (let j = 0; j < 16; j++) { const [x, y] = punto(r, R, 0.78); motas.push(<circle key={j} cx={x} cy={y} r={1.4} fill={c[1]} opacity=".9" />); }
  return (
    <g transform={`rotate(${deg(r)})`}>
      {hilos.map((d, i) => <path key={`s${i}`} d={d} stroke="rgba(0,0,0,.2)" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(1 1.6)" />)}
      {hilos.map((d, i) => <path key={i} d={d} stroke={c[0]} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      {motas}
    </g>
  );
}

export const IngredienteArte = memo(function IngredienteArte({ ing, R = 128, densidad = 1, k = 1.3 }) {
  const r = rng(ing.id + '-arte');
  const { forma, c, n = 10 } = ing.arte;
  if (forma === 'drizzle') return drizzle(c, r, R);
  const cant = Math.max(3, Math.round(n * densidad));
  const piezas = [];
  for (let i = 0; i < cant; i++) {
    const [x, y] = punto(r, R, forma === 'egg' ? 0.62 : 0.9);
    piezas.push(pieza(forma, c, r, x, y, k, i));
  }
  return <g>{piezas}</g>;
});

export const BaseMaiz = memo(function BaseMaiz({ R = 128, densidad = 1 }) {
  const r = rng('maiz-base');
  const cant = Math.round(240 * densidad);
  const out = [
    <circle key="base" r={R * 1.02} fill="url(#maiz-grad)" />,
    <defs key="d"><radialGradient id="maiz-grad" cx="45%" cy="40%" r="65%"><stop offset="0" stopColor="#EDBE4C" /><stop offset=".8" stopColor="#D49A2E" /><stop offset="1" stopColor="#9C6A1C" /></radialGradient></defs>,
  ];
  for (let i = 0; i < cant; i++) {
    const [x, y] = punto(r, R, 0.97);
    const tono = r() > 0.75 ? '#E2A834' : '#F2C451';
    out.push(
      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg(r)})`}>
        <ellipse rx="5.2" ry="6.4" fill={tono} stroke="rgba(120,80,20,.35)" strokeWidth=".8" />
        <ellipse cx="-1.4" cy="-1.9" rx="1.9" ry="2.3" fill="#FBE39A" opacity=".85" />
      </g>,
    );
  }
  return <g>{out}</g>;
});

/* Bowl negro de la casa con el monograma, sobre el papel con hojas (como su empaque). */
export function BowlBase({ children, papel = true, id = 'b' }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bowl`} cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor="#3A3D3B" />
          <stop offset="1" stopColor="#151716" />
        </radialGradient>
        <radialGradient id={`${id}-fondo`} cx="50%" cy="50%" r="50%">
          <stop offset="0.75" stopColor="#1A1C1B" />
          <stop offset="1" stopColor="#0E100F" />
        </radialGradient>
        <clipPath id={`${id}-comida`}><circle cx="200" cy="200" r="140" /></clipPath>
      </defs>
      {papel && (
        <g transform="rotate(12 200 200)">
          <rect x="30" y="30" width="340" height="340" rx="10" fill="#EFE7D3" />
          <path d="M44 330 q 30 -34 62 -8 q -30 34 -62 8z M330 46 q -6 40 -40 44 q 4 -40 40 -44z" fill="var(--c-oliva)" opacity=".85" />
          <path d="M322 352 q -36 -6 -40 -40 q 38 6 40 40z" fill="var(--c-oliva-profundo)" opacity=".6" />
        </g>
      )}
      <ellipse cx="206" cy="214" rx="176" ry="174" fill="rgba(20,22,18,.35)" />
      <circle cx="200" cy="200" r="174" fill={`url(#${id}-bowl)`} />
      <circle cx="200" cy="200" r="171" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="3" />
      <circle cx="200" cy="200" r="146" fill={`url(#${id}-fondo)`} />
      <g clipPath={`url(#${id}-comida)`}>
        <g transform="translate(200 200)">{children}</g>
      </g>
      <g transform="translate(200 366)" fill="none" stroke="#F4F1E8" strokeWidth="1.6" strokeLinecap="round" opacity=".9">
        <path d="M-6 0 h12 c0 -4.6 -2.8 -7.4 -6.4 -7.4 c-3.9 0 -6.6 3.1 -6.6 7.4 c0 4.3 2.9 7.4 6.8 7.4 c2.5 0 4.3 -1 5.6 -2.9" />
        <path d="M-1.2 -13 c2.6 .4 4.3 2 4.8 4.4 c-2.6 -.2 -4.3 -1.9 -4.8 -4.4z" fill="#F4F1E8" stroke="none" />
      </g>
    </>
  );
}

/* Bowl completo a partir de una selección (para la mesa y miniaturas) */
export function BowlMini({ ings, size = 64, id }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} aria-hidden="true">
      <BowlBase papel={false} id={id}>
        <BaseMaiz densidad={0.6} />
        {ings.map((ing) => <IngredienteArte key={ing.id} ing={ing} densidad={0.7} />)}
      </BowlBase>
    </svg>
  );
}

export function Muestra({ ing, size = 40 }) {
  return (
    <svg viewBox="-34 -34 68 68" width={size} height={size} aria-hidden="true" className="muestra">
      <circle r="33" fill="#1C1F1D" />
      <circle r="30" fill="#25292A" />
      {ing.arte.forma === 'drizzle' ? (
        <g transform="scale(.26)">{drizzle(ing.arte.c, rng(ing.id + '-arte'), 110)}</g>
      ) : (
        <IngredienteArte ing={ing} R={26} densidad={0.28} k={0.85} />
      )}
    </svg>
  );
}
