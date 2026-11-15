/* Ícono del logo redibujado como trazos continuos: hojas → manos → casa.
   Cada path usa pathLength="1" para animarse con stroke-dashoffset (clase .draw). */
export const HOJAS = [
  'M20 70 C10 60 8 42 16 28 C26 40 28 58 20 70',
  'M20 70 C26 58 34 46 46 36',
  'M46 36 C58 14 88 4 112 6 C104 32 84 54 50 56 C47 50 46 42 46 36',
  'M54 50 L88 26',
]
export const MANOS = [
  'M20 70 C8 94 6 124 20 146 C36 172 68 184 100 176',
  'M128 10 C152 18 176 36 188 62 C192 72 184 78 174 74 C164 70 158 60 146 60 C136 60 128 52 122 44',
  'M150 66 C156 82 168 88 186 84 C194 106 190 136 172 158 C152 178 122 184 100 176',
]
export const CASA = [
  'M42 114 L96 66 C99 63 103 63 106 66 L160 114',
  'M42 114 C40 118 43 121 47 121 L54 121 L54 152',
  'M160 114 C162 118 159 121 155 121 L148 121 L148 152',
  'M100 176 C90 167 85 157 87 147 C89 135 113 135 115 147 C117 157 112 167 100 176',
]

export default function LogoIcon({ className = '', strokeWidth = 4, title }) {
  const P = ({ d }) => <path d={d} pathLength="1" className="draw" />
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g className="logo-hojas">{HOJAS.map((d) => <P key={d} d={d} />)}</g>
      <g className="logo-manos">{MANOS.map((d) => <P key={d} d={d} />)}</g>
      <g className="logo-casa">{CASA.map((d) => <P key={d} d={d} />)}</g>
    </svg>
  )
}

/** Casita sola (separador de la cinta, pasos del formulario, pin final). */
export function Casita({ className = '', strokeWidth = 10 }) {
  return (
    <svg viewBox="30 55 140 130" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {CASA.slice(0, 3).map((d) => <path key={d} d={d} pathLength="1" className="draw" />)}
      <path d="M100 162 C92 156 88 150 89 144 C91 134 111 134 113 144 C114 150 110 156 100 162" pathLength="1" className="draw" />
      <path d="M54 152 C70 168 130 168 148 152" pathLength="1" className="draw" />
    </svg>
  )
}
