// Ilustraciones SVG planas (viewBox 0 0 300 300). Se muestran dentro de marcos de arco
// mientras llegan las fotos reales.
import { SunRing, SunBody } from './Sun.jsx';
import { Plate, PizzaTop } from './Pizza.jsx';
import { pinePath } from './scene.js';
import { rng } from '../../lib/geometry.js';

const C = {
  naranja: '#EB7126', mandarina: '#F8A85B', durazno: '#FFDDB8', crema: '#FFF8EE', rojo: '#E6401C',
  ladrillo: '#8A2F0C', terracota: '#C24E35', teja: '#B4400F', dorado: '#F6B547', espresso: '#2A1410',
  cacao: '#3B1D17', albahaca: '#5C7A3A',
};
const LEAF = 'M0 -11 C 7 -6, 7 6, 0 11 C -7 6, -7 -6, 0 -11 Z';

const Svg = ({ children, title, className = '' }) => (
  <svg viewBox="0 0 300 300" className={`w-full h-full ${className}`} role="img" aria-label={title}>
    {children}
  </svg>
);

function pines(seed, y0, n, x0, x1, minH, maxH) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (i / (n - 1)) * (x1 - x0) + (r() - 0.5) * 8;
    const h = minH + r() * (maxH - minH);
    d += pinePath(x, y0 + Math.sin(x * 0.05) * 4, h, h * 0.27);
  }
  return d;
}

export function MountainArt() {
  return (
    <Svg title="Montañas de Santa Elena con neblina y el sol bajando">
      <g transform="translate(150 118) scale(.46)"><SunRing /><SunBody /></g>
      <path d="M0 190 C 40 160, 80 150, 120 170 C 160 190, 190 140, 230 150 C 260 158, 285 175, 300 170 L300 300 L0 300Z" fill={C.terracota} />
      <ellipse cx="150" cy="196" rx="190" ry="12" fill={C.crema} opacity=".35" />
      <path d="M0 220 C 50 200, 90 205, 140 222 C 190 238, 240 205, 300 214 L300 300 L0 300Z" fill={C.ladrillo} />
      <path d={pines(5, 222, 16, 6, 294, 14, 30)} fill={C.ladrillo} />
      <ellipse cx="120" cy="236" rx="170" ry="10" fill={C.crema} opacity=".28" />
      <path d="M0 258 C 60 244, 120 250, 170 262 C 220 274, 260 252, 300 256 L300 300 L0 300Z" fill={C.espresso} />
      <path d={pines(9, 258, 11, 10, 290, 22, 46)} fill={C.espresso} />
      <path d="M150 300 C 150 284, 120 280, 128 268 C 136 258, 168 262, 170 252" fill="none" stroke={C.dorado} strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" />
    </Svg>
  );
}

function Martini({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-58 0 L58 0 L0 66 Z" fill={C.crema} fillOpacity=".55" />
      <path d="M-48 10 L48 10 L0 62 Z" fill={C.dorado} />
      <path d="M-30 10 L-8 10 L-22 26 Z" fill={C.crema} opacity=".6" />
      <path d="M-58 0 L58 0 L0 66 Z" fill="none" stroke={C.espresso} strokeWidth="3.5" strokeLinejoin="round" />
      {Array.from({ length: 19 }, (_, i) => <circle key={i} cx={-56 + i * 6.2} cy={-1.5 + (i % 2) * 2.5} r="2.6" fill={C.crema} stroke={C.espresso} strokeWidth=".8" />)}
      <line x1="0" y1="66" x2="0" y2="140" stroke={C.espresso} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="0" cy="142" rx="34" ry="7" fill={C.espresso} />
      <g transform="translate(52 -8)">
        <circle r="20" fill={C.dorado} stroke={C.espresso} strokeWidth="3" />
        <circle r="14" fill={C.mandarina} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1="0" y1="0" x2={Math.cos((k / 8) * 6.283) * 14} y2={Math.sin((k / 8) * 6.283) * 14} stroke={C.crema} strokeWidth="1.6" />)}
      </g>
    </g>
  );
}

function Coupe({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-46 0 Q -46 48 0 48 Q 46 48 46 0 Z" fill={C.crema} fillOpacity=".5" />
      <path d="M-40 8 Q -40 42 0 42 Q 40 42 40 8 Z" fill={C.rojo} />
      <path d="M-28 14 Q -26 30 -12 36" fill="none" stroke={C.crema} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <path d="M-46 0 Q -46 48 0 48 Q 46 48 46 0 Z" fill="none" stroke={C.espresso} strokeWidth="3.5" strokeLinejoin="round" />
      <line x1="-46" y1="0" x2="46" y2="0" stroke={C.espresso} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="0" y1="48" x2="0" y2="118" stroke={C.espresso} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="0" cy="120" rx="30" ry="6.5" fill={C.espresso} />
      <path d="M30 -2 C 40 -22, 56 -20, 60 -36" fill="none" stroke={C.naranja} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function CocktailArt() {
  return (
    <Svg title="Martini cítrico con borde escarchado y cóctel rojo en copa">
      <Coupe x={196} y={128} s={1} />
      <Martini x={112} y={92} s={1} />
      <ellipse cx="150" cy="252" rx="130" ry="8" fill={C.espresso} opacity=".12" />
    </Svg>
  );
}
export const MartiniArt = () => <Svg title="Martini cítrico"><Martini x={150} y={80} s={1.15} /></Svg>;
export const CoupeArt = () => <Svg title="Cóctel rojo en copa"><Coupe x={150} y={110} s={1.4} /></Svg>;

export function PizzaArt() {
  return (
    <Svg title="Pizza en plato de cerámica pintada a mano">
      <g transform="translate(150 155) scale(1.28)"><Plate /><PizzaTop /></g>
    </Svg>
  );
}

const chips = (() => {
  const r = rng(77); const out = [];
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, d = 24 + r() * 44;
    out.push([150 + Math.cos(a) * d, 170 + Math.sin(a) * d * 0.95, 3 + r() * 3, r() * 90]);
  }
  return out;
})();

export function CookieArt() {
  return (
    <Svg title="Galleta gigante en sartén de hierro con helado, chocolate y canela">
      {[[44, 40], [262, 58], [236, 22], [70, 84], [28, 120]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2}Z`} fill={C.dorado} />
      ))}
      <rect x="226" y="160" width="74" height="22" rx="11" fill={C.espresso} transform="rotate(-12 226 171)" />
      <circle cx="150" cy="172" r="96" fill={C.espresso} />
      <circle cx="150" cy="172" r="96" fill="none" stroke={C.crema} strokeOpacity=".22" strokeWidth="2" />
      <circle cx="150" cy="172" r="84" fill={C.cacao} />
      <circle cx="150" cy="172" r="78" fill="#D9883A" />
      <circle cx="150" cy="172" r="78" fill="none" stroke={C.teja} strokeWidth="5" />
      {chips.map(([x, y, s, r], i) => <rect key={i} x={x - s} y={y - s} width={s * 2} height={s * 1.6} rx="1.5" fill={C.espresso} transform={`rotate(${r} ${x} ${y})`} />)}
      <path d="M118 150 C 112 122, 136 104, 158 110 C 182 104, 196 132, 186 152 C 190 166, 176 174, 168 168 C 164 180, 150 182, 146 170 C 136 178, 120 170, 118 150 Z" fill={C.crema} />
      <path d="M132 124 C 140 116, 150 116, 156 120" fill="none" stroke={C.durazno} strokeWidth="5" strokeLinecap="round" />
      <path d="M120 140 C 135 132, 140 150, 154 140 C 166 132, 172 152, 186 142" fill="none" stroke={C.espresso} strokeWidth="5" strokeLinecap="round" />
      <path d="M128 158 C 140 152, 150 166, 166 156" fill="none" stroke={C.espresso} strokeWidth="4" strokeLinecap="round" />
      <g transform="rotate(-24 100 222)">
        <rect x="70" y="214" width="66" height="13" rx="6.5" fill={C.teja} />
        <rect x="70" y="214" width="66" height="13" rx="6.5" fill="none" stroke={C.ladrillo} strokeWidth="2" />
        <line x1="78" y1="220.5" x2="128" y2="220.5" stroke={C.ladrillo} strokeWidth="1.5" />
      </g>
      <g fill={C.ladrillo} opacity=".7">{[[190, 208], [200, 196], [178, 220], [210, 212]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" />)}</g>
    </Svg>
  );
}

const rigatoni = (() => {
  const r = rng(13); const out = [];
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2, d = r() * 52;
    out.push([150 + Math.cos(a) * d, 155 + Math.sin(a) * d, r() * 180]);
  }
  return out;
})();

export function PastaArt() {
  return (
    <Svg title="Rigatoni con salsa de tomate en plato pintado">
      <g transform="translate(150 155) scale(1.28)"><Plate /></g>
      <path d="M86 150 C 84 104, 132 86, 160 92 C 206 96, 222 134, 216 166 C 210 206, 168 222, 136 216 C 100 210, 88 186, 86 150Z" fill={C.rojo} />
      {rigatoni.map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <rect x={x - 15} y={y - 6.5} width="30" height="13" rx="5" fill={C.dorado} stroke={C.teja} strokeWidth="1.4" />
          <line x1={x - 7} y1={y - 6} x2={x - 7} y2={y + 6} stroke={C.teja} strokeWidth="1" opacity=".6" />
          <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={C.teja} strokeWidth="1" opacity=".6" />
          <line x1={x + 7} y1={y - 6} x2={x + 7} y2={y + 6} stroke={C.teja} strokeWidth="1" opacity=".6" />
        </g>
      ))}
      {[[130, 120, 30], [178, 182, 120], [190, 128, -40]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(1.4)`}><path d={LEAF} fill={C.albahaca} /><path d="M0 -9 L0 9" stroke="#3E5526" strokeWidth="1" /></g>
      ))}
      {[[146, 140], [166, 160], [122, 170], [156, 196], [182, 150]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l7 -3 l3 6 l-8 2z`} fill={C.crema} />)}
    </Svg>
  );
}

export function BruschettaArt() {
  const bread = (x, y, r) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M-62 -26 C -60 -40, 56 -42, 62 -26 C 70 -4, 64 26, 52 30 C 10 38, -40 38, -58 28 C -70 18, -68 -10, -62 -26Z" fill={C.teja} />
      <path d="M-54 -20 C -50 -32, 48 -34, 54 -20 C 60 -2, 56 20, 46 22 C 8 30, -36 30, -50 20 C -60 12, -58 -6, -54 -20Z" fill={C.dorado} />
      {[[-34, -10], [-14, 4], [8, -12], [26, 6], [-30, 14], [40, -6], [2, 16]].map(([a, b], i) => (
        <rect key={i} x={a - 7} y={b - 6} width="14" height="12" rx="3" fill={i % 2 ? C.rojo : C.terracota} transform={`rotate(${i * 23} ${a} ${b})`} />
      ))}
      {[[-18, -14, 20], [20, -2, -30], [-4, 10, 80]].map(([a, b, rr], i) => <g key={i} transform={`translate(${a} ${b}) rotate(${rr})`}><path d={LEAF} fill={C.albahaca} /></g>)}
    </g>
  );
  return (
    <Svg title="Bruschetta al pomodoro">
      <ellipse cx="150" cy="232" rx="120" ry="12" fill={C.espresso} opacity=".12" />
      {bread(140, 128, -8)}
      {bread(160, 196, 6)}
    </Svg>
  );
}

export function BurrataArt() {
  return (
    <Svg title="Burrata con tomates asados y pesto">
      <g transform="translate(150 155) scale(1.28)"><Plate /></g>
      {[[96, 120], [204, 116], [212, 190], [100, 196], [150, 222], [150, 90]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="15" fill={C.rojo} /><circle cx={x - 4} cy={y - 4} r="4" fill={C.crema} opacity=".5" /></g>
      ))}
      <path d="M92 150 C 120 136, 140 170, 170 150 C 190 138, 210 160, 214 152" fill="none" stroke={C.albahaca} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="156" r="42" fill={C.crema} />
      <circle cx="150" cy="156" r="42" fill="none" stroke={C.durazno} strokeWidth="4" />
      <path d="M140 122 C 146 112, 156 112, 160 122 C 156 128, 144 128, 140 122Z" fill={C.durazno} />
      <path d="M134 146 C 140 138, 150 136, 158 140" fill="none" stroke={C.durazno} strokeWidth="4" strokeLinecap="round" />
      {[[120, 172], [178, 140], [168, 180]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={C.dorado} />)}
    </Svg>
  );
}

export function FocacciaArt() {
  const r = rng(21);
  const dimples = Array.from({ length: 26 }, () => [62 + r() * 176, 92 + r() * 126]);
  return (
    <Svg title="Focaccia del horno con romero">
      <rect x="40" y="76" width="220" height="160" rx="26" fill={C.teja} />
      <rect x="48" y="84" width="204" height="144" rx="22" fill={C.dorado} />
      {dimples.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="5" ry="4" fill={C.teja} opacity=".55" />)}
      {[[90, 120, 20], [190, 110, -30], [140, 180, 60], [210, 190, 10], [80, 196, -50]].map(([x, y, rr], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rr})`} stroke={C.albahaca} strokeWidth="2.6" strokeLinecap="round">
          <line x1="-16" y1="0" x2="16" y2="0" />
          {[-12, -6, 0, 6, 12].map((k) => <g key={k}><line x1={k} y1="0" x2={k + 4} y2="-6" /><line x1={k} y1="0" x2={k + 4} y2="6" /></g>)}
        </g>
      ))}
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={60 + r() * 180} y={96 + r() * 120} width="2.4" height="2.4" fill={C.crema} />)}
    </Svg>
  );
}

export function BoardArt() {
  return (
    <Svg title="Tabla de embutidos y quesos">
      <path d="M30 110 C 30 96, 40 90, 54 90 L 236 90 C 250 90, 256 100, 256 112 L 256 124 L 290 124 C 296 124, 296 146, 290 146 L 256 146 L 256 214 C 256 226, 248 232, 236 232 L 54 232 C 40 232, 30 224, 30 212 Z" fill={C.durazno} />
      <path d="M40 112 C 40 104, 46 100, 56 100 L 234 100 C 242 100, 246 106, 246 114 L 246 210 C 246 218, 240 222, 232 222 L 56 222 C 46 222, 40 216, 40 208 Z" fill={C.mandarina} />
      {[[86, 140], [118, 128], [102, 176], [140, 196]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="22" fill={C.rojo} /><circle cx={x} cy={y} r="22" fill="none" stroke={C.ladrillo} strokeWidth="2.5" />
          {[[-8, -6], [6, -10], [8, 6], [-6, 9], [0, 0]].map(([a, b], k) => <circle key={k} cx={x + a} cy={y + b} r="2.4" fill={C.durazno} />)}</g>
      ))}
      <path d="M170 120 L 230 136 L 176 168 Z" fill={C.dorado} stroke={C.teja} strokeWidth="2" />
      <path d="M176 176 L 232 176 L 214 210 L 170 206 Z" fill={C.crema} stroke={C.teja} strokeWidth="2" />
      {[[196, 192], [214, 196]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={C.durazno} />)}
      {[[150, 130], [160, 146], [146, 154], [166, 126]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="9" fill={C.albahaca} />)}
    </Svg>
  );
}

export function TiramisuArt() {
  return (
    <Svg title="Tiramisù en copa">
      <path d="M86 92 L 214 92 L 202 236 C 200 248, 190 254, 178 254 L 122 254 C 110 254, 100 248, 98 236 Z" fill={C.crema} fillOpacity=".5" />
      <path d="M92 150 L 208 150 L 206 176 L 94 176 Z" fill={C.cacao} />
      <path d="M94 176 L 206 176 L 204 204 L 96 204 Z" fill={C.durazno} />
      <path d="M96 204 L 204 204 L 202 232 C 200 242, 192 246, 180 246 L 120 246 C 108 246, 100 242, 98 232 Z" fill={C.cacao} />
      <path d="M88 108 L 212 108 L 208 150 L 92 150 Z" fill={C.durazno} />
      <path d="M88 108 C 110 96, 130 116, 150 104 C 170 94, 190 114, 212 104 L 212 112 L 88 112 Z" fill={C.ladrillo} />
      {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={96 + i * 6.4} cy={104 + (i % 3) * 3} r="1.6" fill={C.espresso} />)}
      <path d="M86 92 L 214 92 L 202 236 C 200 248, 190 254, 178 254 L 122 254 C 110 254, 100 248, 98 236 Z" fill="none" stroke={C.espresso} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M196 60 L 168 120" stroke={C.espresso} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="200" cy="54" rx="9" ry="13" transform="rotate(25 200 54)" fill={C.espresso} />
    </Svg>
  );
}

/** Perro sentado junto a la mesa. [PEDIR FOTO REAL MÁS ADELANTE] */
export function DogArt() {
  return (
    <Svg title="Un perro sentado junto a la mesa, esperando su agua">
      {/* mesa */}
      <ellipse cx="226" cy="278" rx="40" ry="7" fill={C.espresso} opacity=".18" />
      <rect x="221" y="178" width="10" height="96" rx="4" fill={C.espresso} />
      <ellipse cx="226" cy="276" rx="30" ry="6" fill={C.espresso} />
      <rect x="160" y="168" width="134" height="13" rx="6.5" fill={C.teja} />
      <rect x="160" y="168" width="134" height="13" rx="6.5" fill="none" stroke={C.espresso} strokeWidth="2.5" />
      <ellipse cx="204" cy="164" rx="34" ry="7" fill={C.crema} stroke={C.espresso} strokeWidth="2" />
      <ellipse cx="204" cy="161" rx="25" ry="5" fill={C.dorado} />
      <ellipse cx="204" cy="160.5" rx="20" ry="3.6" fill={C.rojo} />
      <path d="M256 126 Q 256 146 266 146 Q 276 146 276 126 Z" fill={C.rojo} />
      <path d="M256 126 Q 256 146 266 146 Q 276 146 276 126 Z" fill="none" stroke={C.espresso} strokeWidth="2.5" />
      <line x1="266" y1="146" x2="266" y2="166" stroke={C.espresso} strokeWidth="2.5" />
      <ellipse cx="266" cy="167" rx="9" ry="2.4" fill={C.espresso} />
      {/* plato de agua */}
      <path d="M134 270 L 166 270 L 160 282 L 140 282 Z" fill={C.naranja} stroke={C.espresso} strokeWidth="2" />
      <ellipse cx="150" cy="270" rx="16" ry="3.4" fill="#9fc4d6" opacity=".0" />
      {/* cola */}
      <path d="M62 262 C 36 258, 22 236, 30 214" fill="none" stroke={C.ladrillo} strokeWidth="11" strokeLinecap="round" />
      {/* cuerpo sentado */}
      <path d="M96 142 C 70 150, 50 190, 50 232 C 50 262, 64 282, 90 282 L 132 282 C 134 250, 132 200, 124 168 C 120 152, 110 140, 96 142 Z" fill={C.ladrillo} />
      {/* muslo */}
      <path d="M58 236 C 58 208, 84 196, 100 214 C 112 228, 108 262, 96 276 C 80 282, 58 270, 58 236 Z" fill={C.terracota} />
      <ellipse cx="84" cy="281" rx="22" ry="6" fill={C.ladrillo} />
      {/* patas delanteras */}
      <rect x="104" y="196" width="15" height="86" rx="7" fill={C.terracota} />
      <rect x="116" y="192" width="16" height="90" rx="7.5" fill={C.ladrillo} />
      <ellipse cx="126" cy="281" rx="12" ry="5" fill={C.ladrillo} />
      {/* pañoleta con zigzag */}
      <path d="M92 150 L 140 146 L 118 184 Z" fill={C.rojo} />
      <path d="M94 151 L 100 157 L 106 150 L 112 156 L 118 149 L 124 155 L 130 148 L 136 154" fill="none" stroke={C.crema} strokeWidth="2" strokeLinejoin="round" />
      {/* cabeza */}
      <circle cx="120" cy="122" r="28" fill={C.ladrillo} />
      <path d="M132 112 C 150 108, 166 116, 168 126 C 170 138, 156 144, 136 142 Z" fill={C.terracota} />
      <circle cx="166" cy="124" r="5.5" fill={C.espresso} />
      <path d="M150 140 C 154 146, 160 146, 162 140" fill="none" stroke={C.espresso} strokeWidth="2" strokeLinecap="round" />
      <circle cx="132" cy="114" r="3.6" fill={C.espresso} />
      <circle cx="133.3" cy="112.8" r="1.1" fill={C.crema} />
      {/* oreja caída */}
      <path d="M104 100 C 92 104, 88 126, 94 142 C 98 150, 108 148, 110 138 C 112 124, 114 110, 104 100 Z" fill={C.cacao} />
      {/* huellas */}
      {[[24, 292, -20], [52, 296, 10]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(.32)`} fill={C.espresso} opacity=".35"><PawShape /></g>
      ))}
    </Svg>
  );
}

export function PawShape() {
  return (
    <g>
      <path d="M0 2 C 9 2, 15 9, 15 15 C 15 21, 9 22, 0 20 C -9 22, -15 21, -15 15 C -15 9, -9 2, 0 2 Z" />
      <ellipse cx="-13" cy="-7" rx="5" ry="6.5" transform="rotate(-20 -13 -7)" />
      <ellipse cx="-5" cy="-15" rx="5" ry="6.8" transform="rotate(-6 -5 -15)" />
      <ellipse cx="5" cy="-15" rx="5" ry="6.8" transform="rotate(6 5 -15)" />
      <ellipse cx="13" cy="-7" rx="5" ry="6.5" transform="rotate(20 13 -7)" />
    </g>
  );
}

export const Paw = ({ className = '', color = 'currentColor', style }) => (
  <svg viewBox="-20 -24 40 48" className={className} style={style} aria-hidden="true" fill={color}><PawShape /></svg>
);

export const Leaf = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="-12 -12 24 24" className={className} aria-hidden="true">
    <g transform="rotate(35)"><path d={LEAF} fill={C.albahaca} /><path d="M0 -9 L0 10" stroke={C.crema} strokeWidth="1.2" /></g>
  </svg>
);

export const WhatsAppIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);

export const ART = {
  mountain: MountainArt,
  cocktail: CocktailArt,
  martini: MartiniArt,
  coupe: CoupeArt,
  pizza: PizzaArt,
  cookie: CookieArt,
  pasta: PastaArt,
  bruschetta: BruschettaArt,
  burrata: BurrataArt,
  focaccia: FocacciaArt,
  board: BoardArt,
  tiramisu: TiramisuArt,
  dog: DogArt,
};
