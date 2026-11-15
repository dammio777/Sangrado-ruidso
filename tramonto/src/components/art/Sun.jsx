import { SUN } from '../../lib/geometry.js';

/** Anillo en zigzag del logo (rojo · blanco · naranja). */
export function SunRing({ red = '#E6401C', white = '#FFFFFF', orange = '#EB7126' }) {
  return (
    <g>
      <polygon points={SUN.ringOuter} fill={red} />
      <polygon points={SUN.ringWhite} fill={white} />
      <polygon points={SUN.ringOrange} fill={orange} />
    </g>
  );
}

/** Cuerpo del sol: disco naranja, 64 rayos blancos y centro blanco. */
export function SunBody({ orange = '#EB7126', ray = '#FFFFFF', center = true }) {
  return (
    <g>
      <circle r="82" fill={orange} />
      <path d={SUN.rays} fill={ray} />
      {center && <circle r={SUN.centerR} fill={ray} />}
    </g>
  );
}

/**
 * El sol del logo como SVG.
 * variant: 'color' | 'mono' (un color, para marcas de agua) | 'line'
 */
export default function Sun({ className = '', variant = 'color', color = '#2A1410', spin = false, title, style }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  if (variant === 'mono') {
    return (
      <svg viewBox="-100 -100 200 200" className={className} style={style} {...a11y}>
        <g className={spin ? 'spin-slow' : ''} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <polygon points={SUN.ringOuter} fill={color} />
          <polygon points={SUN.ringWhite} fill="none" />
          <path d={SUN.rays} fill={color} />
          <circle r="24" fill={color} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} {...a11y}>
      <g className={spin ? 'spin-slow' : ''} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
        <SunRing />
        <SunBody />
      </g>
    </svg>
  );
}

/** Mini sol para íconos de botones (rayos simples). */
export function SunIcon({ className = 'w-5 h-5', color = 'currentColor' }) {
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays.push(
      <line key={i} x1={Math.cos(a) * 6.5} y1={Math.sin(a) * 6.5} x2={Math.cos(a) * 10.5} y2={Math.sin(a) * 10.5}
        stroke={color} strokeWidth="1.8" strokeLinecap="round" />,
    );
  }
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden="true">
      <g className="btn-sun" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
        {rays}
        <circle r="4.2" fill={color} />
      </g>
    </svg>
  );
}
