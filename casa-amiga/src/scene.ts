// ─────────────────────────────────────────────────────────────────────────────
// state(t): describe el cuadro en el instante t como listas de capas (función pura del tiempo).
// No toca la GPU: el renderizador ejecuta las listas. Así se puede evaluar en t±obturador
// para medir velocidades (blur direccional y subcuadros adaptativos) sin costo de render.
// ─────────────────────────────────────────────────────────────────────────────
import type * as THREE from 'three';
import { color as C, font, glass as G, motion, radius as RAD, stage, type RGB } from './tokens';
import { clamp, inOut, out, easeIn, k, lerp, seg, settle, sine, spring, textAnim, vanWijk } from './ease';
import type { FilmConfig, Times } from './config';
import { text, chars, measure, icon, type TextStyle } from './engine/assets';
import type { SpriteOpts, GlassOpts, AmbientOpts } from './engine/gfx';
import { DigitalMap, PLACES, type Cam } from './map/digital';
import { SketchMap, SK } from './map/sketch';

export type LayerName = 'sBase' | 'sTop' | 'foot' | 'stBase' | 'stTop';
export type TexToken = THREE.Texture | 'SCREEN' | 'FOOT';
export type Item =
  | { k: 'sprite'; L: LayerName; id?: string; o: Omit<SpriteOpts, 'tex'> & { tex?: TexToken | null; dof?: number } }
  | { k: 'glass'; L: LayerName; id?: string; o: GlassOpts }
  | { k: 'ambient'; L: LayerName; id?: undefined; o: AmbientOpts };

export interface Frame {
  t: number;
  items: Item[];
  mapD: { cam: Cam; route: number; labels: number } | null;
  mapS: { cam: Cam; route: number } | null;
  persp: { cx: number; cy: number; dolly: number };
  screenSS: number;
  footage: { clip: number; local: number }[]; // clips visibles y su tiempo local (para cargar cuadros)
}

export interface Assets {
  cfg: FilmConfig; T: Times;
  mapD: DigitalMap; mapS: SketchMap;
  pin: THREE.Texture; backdrop: THREE.Texture; logo: THREE.Texture; firma: { tex: THREE.Texture; w: number; h: number }; icono: { tex: THREE.Texture; w: number; h: number };
  photos: Record<string, { tex: THREE.Texture; w: number; h: number }>;
  ring: THREE.Texture; keyboard: THREE.Texture;
  placeholders: THREE.Texture[];
  footFrame: (clip: number, local: number) => THREE.Texture | null;
}

const SW = stage.screen.w, SH = stage.screen.h;
const SX = stage.screen.x, SY = stage.screen.y;
const ST = (style: Partial<TextStyle> & { size: number; weight: number; tracking: number }, col: RGB, alpha = 1): TextStyle => ({ lh: 1.25, ...style, color: col, alpha });

// ───────────────────────── constructor de cuadro ─────────────────────────
class B {
  items: Item[] = [];
  constructor(public t: number) {}
  sprite(L: LayerName, o: Omit<SpriteOpts, 'tex'> & { tex?: TexToken | null; dof?: number }, id?: string) {
    if ((o.opacity ?? 1) <= 0.002) return;
    this.items.push({ k: 'sprite', L, id, o });
  }
  glass(L: LayerName, o: GlassOpts, id?: string) { if ((o.opacity ?? 1) > 0.002) this.items.push({ k: 'glass', L, id, o }); }
  ambient(L: LayerName, o: AmbientOpts) { if (o.opacity > 0.002) this.items.push({ k: 'ambient', L, o }); }
  /** Texto con su caja: (x, yTop) = esquina/centro superior según align. */
  text(L: LayerName, str: string, st: TextStyle, x: number, yTop: number, o: { align?: 'left' | 'center' | 'right'; opacity?: number; blur?: number; dir?: readonly [number, number]; id?: string; dy?: number } = {}) {
    if (!str || (o.opacity ?? 1) <= 0.002) return 0;
    const tt = text(str, st);
    const lh = st.size * (st.lh ?? 1.25);
    const left = o.align === 'center' ? x - tt.adv / 2 : o.align === 'right' ? x - tt.adv : x;
    this.sprite(L, { tex: tt.tex, x: left + tt.adv / 2, y: yTop + lh / 2 + (o.dy ?? 0), w: tt.w, h: tt.h, opacity: o.opacity ?? 1, blur: o.blur ?? 0, dir: o.dir }, o.id);
    return tt.adv;
  }
  /** Título con escalonado por letra: opacidad + deriva + blur 10→0; salida con blur direccional. */
  title(L: LayerName, str: string, st: TextStyle, cx: number, yTop: number, tIn: number, tOut: number, exitDir: readonly [number, number] = [0, -12], id = '') {
    const t = this.t;
    if (t < tIn || t > tOut + motion.textOut + 0.05) return;
    const glyphs = chars(str, st);
    const total = measure(str, st);
    const lh = st.size * (st.lh ?? 1.25);
    glyphs.forEach((g, i) => {
      const a = textAnim(t, tIn + i * motion.charStagger, tOut);
      if (a.o <= 0.002) return;
      this.sprite(L, { tex: g.tex.tex, x: cx - total / 2 + g.x + g.tex.adv / 2, y: yTop + lh / 2 + a.dy, w: g.tex.w, h: g.tex.h, opacity: a.o, blur: a.blur, dir: [exitDir[0] * a.outU, exitDir[1] * a.outU] }, id ? `${id}${i}` : undefined);
    });
  }
}

// ───────────────────────── estilos de texto ─────────────────────────
const sty = {
  hero: (c: RGB) => ST(font.hero, c),
  statement: (c: RGB) => ST(font.statement, c),
  headline: (c: RGB) => ST(font.headline, c),
  caption: (c: RGB) => ST(font.caption, c),
  title: (c: RGB) => ST(font.title, c),
  body: (c: RGB, a = 1) => ST(font.body, c, a),
  ui: (c: RGB, a = 1) => ST(font.ui, c, a),
  small: (c: RGB, a = 1) => ST(font.small, c, a),
  label: (c: RGB, a = 1) => ({ ...ST(font.label, c, a), upper: true }),
};
const CREAM = C.cream, INK = C.ink, ORANGE = C.orange, WG = C.warmGray;
const SOFT_ORANGE: RGB = [0.98, 0.69, 0.42];
const INK2: RGB = [0.36, 0.32, 0.29];

const AMB_PAL = { esp: C.espresso, rust: C.rustDeep, amber: C.orange, gold: C.golden };

// ───────────────────────── cámaras de mapa ─────────────────────────
const DA: Cam = { cx: 1700, cy: 1830, z: 0.42 };
const PIN_SCREEN_Y = 560;
const DB: Cam = { cx: PLACES.casa[0], cy: PLACES.casa[1] + (SH / 2 - PIN_SCREEN_Y) / 2.6, z: 2.6 };
const flyD = vanWijk([DA.cx, DA.cy, SW / DA.z], [DB.cx, DB.cy, SW / DB.z]);
function camDigital(t: number): Cam {
  if (t < 4.15) { const u = seg(t, 1.5, 4.15); return { cx: DA.cx + 30 * u, cy: DA.cy - 16 * u, z: DA.z }; }
  const u = inOut(seg(t, 4.15, 5.0));
  const [cx, cy, w] = flyD(u);
  return { cx: cx + 30 * (1 - u), cy: cy - 16 * (1 - u), z: SW / w };
}

function sketchCams(mapS: SketchMap) {
  const S0: Cam = { cx: SK.casa[0], cy: SK.casa[1] + (SH / 2 - PIN_SCREEN_Y) / 2.6, z: 2.6 };
  const SO: Cam = { cx: 520, cy: 960, z: 1.0 };
  const ZF = 2.3;
  const follow = (p: number): Cam => {
    const [hx, hy] = mapS.route.at(p);
    const z = lerp(SO.z, ZF, Math.pow(p, 1.8));
    const m = sine(clamp(p * 1.1));
    return { cx: lerp(SO.cx, hx, m), cy: lerp(SO.cy, hy + (SH / 2 - 640) / z, m), z };
  };
  const SC: Cam = { cx: SK.casa[0], cy: SK.casa[1] + (SH / 2 - 820) / 1.5, z: 1.5 };
  return { S0, SO, follow, SC };
}

// ───────────────────────── state(t) ─────────────────────────
export function state(t: number, A: Assets, opts: { screenSS: number; footT?: number }): Frame {
  const { T, cfg } = A;
  const b = new B(t);
  const f: Frame = { t, items: b.items, mapD: null, mapS: null, persp: { cx: stage.w / 2, cy: stage.h / 2, dolly: 0 }, screenSS: opts.screenSS, footage: [] };
  const sk = sketchCams(A.mapS);
  const dat = cfg.datos;
  const glassOn = (L: LayerName, x: number, y: number, w: number, h: number, r: number, kind: 'dark' | 'light', o = 1, id?: string, amber = 0) =>
    b.glass(L, { x, y, w, h, radius: r, kind, opacity: o, amber }, id);

  // ═════════ fondo ambiental (escena 3D, plano lejano → parallax) ═════════
  const D = stage.camDist, depth = stage.bgDepth, sc = ((D + depth) / D) * 1.12;
  const brand = k(t, 7.5, 7.9) * (1 - k(t, 8.18, 8.42));
  const coveredByFootage = t >= T.HO + 0.9 && t < T.C0; // el video cubre todo el cuadro: no se dibuja lo que queda debajo
  if (!coveredByFootage) b.sprite('stBase', { tex: A.backdrop, x: stage.w / 2, y: stage.h / 2, z: depth, w: stage.w * sc, h: stage.h * sc });
  if (!coveredByFootage) b.ambient('stBase', { x: stage.w / 2, y: stage.h / 2, z: depth, w: stage.w * sc, h: stage.h * sc, t, glow: 0.18 + brand * 0.35, glowX: stage.w * sc * 0.5, glowY: stage.h * sc * 0.36, lift: 0, opacity: 0.62, travel: motion.orbTravel, palette: AMB_PAL });

  // ═════════ cámara 2.5D ═════════
  const push = k(t, 2.4, 2.95) * (1 - k(t, 4.1, 4.75));
  f.persp = { cx: stage.w / 2, cy: stage.h / 2 - 150 * push, dolly: 190 * push };

  // ═════════ teléfono ═════════
  const rise = t < 1.45 ? 0 : spring(seg(t, 1.45, 2.45), 11);
  const handPush = inOut(seg(t, T.HO + 0.38, T.HO + 0.9));
  const handBack = inOut(seg(t, T.C0, T.C0 + 0.48));
  const inFoot = t >= T.HO + 0.9 && t < T.C0;
  const phoneY = (1 - rise) * 1700;
  const phoneRot = (1 - rise) * 0.32;
  const phoneScale = 1 + 0.16 * handPush * (1 - handBack);
  const dofPhone = clamp(0.55 * k(t, T.HO, T.HO + 0.3) + 0.45 * handPush) * (1 - handBack);
  const phoneOp = inFoot ? 0 : 1 - 0.0 * handPush;
  if (rise > 0 && phoneOp > 0) {
    const pcx = SX + SW / 2, pcy = SY + SH / 2 + phoneY;
    const W = SW * phoneScale, H = SH * phoneScale;
    b.sprite('stBase', { color: [0, 0, 0], alpha: 0.42, x: pcx, y: pcy + 48, w: W + 200, h: H + 200, radius: RAD.phone + 100, feather: 150, rotX: phoneRot, opacity: phoneOp }, 'phoneShadow');
    b.sprite('stBase', { color: [0.055, 0.04, 0.035], alpha: 0.96, x: pcx, y: pcy, w: W + stage.frame * 2, h: H + stage.frame * 2, radius: RAD.phone + stage.frame, rim: 1, rotX: phoneRot, opacity: phoneOp }, 'phoneFrame');
    b.sprite('stBase', { tex: 'SCREEN', flip: true, x: pcx, y: pcy, w: W, h: H, radius: RAD.phone, rotX: phoneRot, opacity: phoneOp, dof: dofPhone }, 'phone');
  }

  // ═════════ intro: pin en círculo de vidrio + "¿Quieres llegar / a Casa Amiga?" ═════════
  if (t < 1.75) {
    const grow = spring(seg(t, 0, 0.62), 12);
    const up = inOut(seg(t, 0.6, 1.02));
    const leave = easeIn(seg(t, 1.38, 1.62));
    const cy = lerp(lerp(840, 600, up), 360, leave);
    const s = lerp(0.62, 1, grow) * lerp(1, 0.74, up);
    const o = clamp(grow * 1.6) * (1 - leave);
    const D0 = 236 * s;
    glassOn('stTop', 540, cy, D0, D0, D0 / 2, 'light', o * 0.32, 'introGlass');
    glassOn('stTop', 540, cy, D0, D0, D0 / 2, 'dark', o, 'introGlass2', 0.18);
    b.sprite('stTop', { color: C.orange, alpha: 0.18, x: 540, y: cy, w: D0 * 1.9, h: D0 * 1.9, radius: D0 * 0.95, feather: D0 * 0.8, opacity: o }, 'introGlow');
    b.sprite('stTop', { tex: A.pin, x: 540, y: cy - 4 * s, w: 104 * s, h: 133 * s, opacity: o, blur: (1 - grow) * 12 }, 'introPin');
    b.title('stTop', '¿Quieres llegar', sty.hero(CREAM), 540, 772, 0.72, 1.36, [0, -16], 'it1');
    b.title('stTop', 'a Casa Amiga?', sty.hero(ORANGE), 540, 772 + 123, 0.8, 1.4, [0, -16], 'it2');
  }

  // ═════════ PANTALLA ═════════
  const amb = (() => {
    if (t >= T.C1 + 0.4) return k(t, T.C1 + 0.45, T.C1 + 0.85);
    if (t >= T.C0) return 0;
    const a1 = k(t, 6.62, 6.98) * (1 - k(t, 8.22, 8.45));
    const a2 = k(t, 9.8, 10.14) * (1 - k(t, 15.14, 15.46));
    return Math.max(a1, a2);
  })();
  const sketchOn = (t >= 8.38 && t < 10.2) || (t >= T.C0 - 0.05 && t < T.C1 + 1.0);
  const mapDOn = amb < 0.999 && (t < 8.95 || (t >= 15.05 && t < T.C0));

  // mapa digital
  const camD = camDigital(t);
  if (mapDOn) {
    const routeF = inOut(seg(t, 15.4, 15.86));
    const labels = 1;
    f.mapD = { cam: camD, route: routeF, labels };
    b.sprite('sBase', { tex: A.mapD.tex, x: SW / 2, y: SH / 2, w: SW, h: SH, blur: 9 * amb }, 'mapD');
  }
  // mapa dibujado (transformación radial desde el pin)
  let camS: Cam = sk.S0;
  let routeS = 0;
  if (sketchOn) {
    if (t >= T.C0 - 0.05) { camS = sk.SC; routeS = 1; }
    else if (t < 8.9) camS = sk.S0;
    else if (t < 9.12) { const u = inOut(seg(t, 8.9, 9.12)); camS = { cx: lerp(sk.S0.cx, sk.SO.cx, u), cy: lerp(sk.S0.cy, sk.SO.cy, u), z: Math.exp(lerp(Math.log(sk.S0.z), Math.log(sk.SO.z), u)) }; }
    else { routeS = inOut(seg(t, 9.12, 9.86)); camS = sk.follow(routeS); }
    f.mapS = { cam: camS, route: routeS };
    const Rr = t >= T.C0 - 0.05 ? 4400 : lerp(0, 4400, inOut(seg(t, 8.38, 8.95)));
    const cxp = SW / 2, cyp = PIN_SCREEN_Y;
    const bl = t < T.C0 ? 9 * k(t, 9.8, 10.12) : 9 * k(t, T.C1 + 0.45, T.C1 + 0.85);
    b.sprite('sBase', { tex: A.mapS.tex, x: cxp, y: cyp, w: Rr, h: Rr, radius: Rr / 2, feather: 520, uvRect: [(cxp - Rr / 2) / SW, (cyp - Rr / 2) / SH, Rr / SW, Rr / SH], blur: bl }, 'mapS');
  }
  // capa ambiental oscura dentro de la pantalla (misma luz que el fondo)
  const pinBrand = { x: SW / 2, y: 430 };
  b.ambient('sBase', { x: SW / 2, y: SH / 2, w: SW, h: SH, t, glow: brand, glowX: pinBrand.x, glowY: pinBrand.y, lift: 0.35, opacity: amb, travel: motion.orbTravel * 0.6, palette: AMB_PAL });

  // ── barra de estado ──
  const stCol = (a: number, col: RGB) => { b.text('sTop', '5:48', sty.ui(col, a), 64, 18, {}); };
  const dark = clamp(amb + (inFoot ? 1 : 0));
  stCol(1 - dark, INK); stCol(dark, CREAM);
  b.sprite('sTop', { color: [0.04, 0.03, 0.025], alpha: 1, x: SW / 2, y: 38, w: 132, h: 38, radius: 19 });

  // ── buscador ──
  const searchIn = spring(seg(t, 1.8, 2.3));
  const searchOut = Math.max(k(t, 6.6, 6.85), 1 - k(t, 15.2, 15.5)) * (t > 6.6 ? 1 : 0) + (t >= 15.55 ? k(t, 15.55, 15.72) : 0);
  const sOp = searchIn * clamp(1 - searchOut);
  if (sOp > 0.002 && t < T.C0) {
    const s = lerp(0.96, 1, searchIn);
    glassOn('sTop', SW / 2, 148, 792 * s, 104 * s, 52, 'light', sOp, 'search');
    const sheet = k(t, 2.66, 2.9) * (1 - k(t, 4.12, 4.34));
    b.sprite('sTop', { tex: A.pin, x: 76, y: 148, w: 30, h: 38, opacity: sOp * (1 - sheet) });
    b.sprite('sTop', { tex: icon('chevronL', 30, INK, 1.6), x: 74, y: 148, w: 30, h: 30, opacity: sOp * sheet });
    b.sprite('sTop', { tex: icon('mic', 30, INK2, 1.5), x: 782, y: 148, w: 30, h: 30, opacity: sOp });
    const QUERY = 'Casa Amiga Santa Elena';
    const n = Math.floor(seg(t, 3.12, 3.82) * QUERY.length + 1e-6);
    let typed = QUERY.slice(0, n);
    if (t >= 4.1) typed = 'Casa Amiga';
    if (t < 2.68) b.text('sTop', 'Busca aquí', sty.ui(INK2, 0.85), 112, 129, { opacity: sOp });
    const tw = typed ? b.text('sTop', typed, sty.ui(INK), 112, 129, { opacity: sOp }) : 0;
    const blink = Math.floor((t - 2.7) / 0.5) % 2 === 0 || (t > 3.12 && t < 3.86);
    if (t >= 2.7 && t < 4.05 && blink) b.sprite('sTop', { color: ORANGE, alpha: 1, x: 112 + tw + 3, y: 148, w: 2.5, h: 36, radius: 1.2, opacity: sOp });
  }
  // chips de categorías (genéricas, sin negocios)
  const chipsOp = spring(seg(t, 1.9, 2.4)) * (1 - k(t, 2.62, 2.78)) * (t < 6 ? 1 : 0);
  if (chipsOp > 0.002) {
    const list: [Parameters<typeof icon>[0], string][] = [['gallery', 'Galerías'], ['cup', 'Cafés'], ['mountain', 'Miradores'], ['brush', 'Talleres']];
    let x = 32;
    list.forEach(([ic, lbl], i) => {
      const w = 26 + 10 + measure(lbl, sty.small(INK)) + 40;
      const o = chipsOp * spring(seg(t, 1.9 + i * 0.05, 2.4 + i * 0.05));
      glassOn('sTop', x + w / 2, 256, w, 64, RAD.chip, 'light', o, 'chip' + i);
      b.sprite('sTop', { tex: icon(ic, 26, i === 0 ? ORANGE : INK2, 1.5), x: x + 20 + 13, y: 256, w: 26, h: 26, opacity: o });
      b.text('sTop', lbl, sty.small(INK), x + 20 + 26 + 10, 256 - 17, { opacity: o });
      x += w + 8;
    });
  }
  // hoja de búsqueda + sugerencias + teclado
  const sheet = k(t, 2.66, 2.92) * (1 - k(t, 4.12, 4.34));
  if (sheet > 0.002) {
    glassOn('sTop', SW / 2, SH / 2, SW, SH, 0, 'light', sheet, 'sheet');
    const rows: [string, string, 'brand' | 'search' | 'pin'][] = [
      ['Casa Amiga', 'Galería de arte y diseño · Santa Elena', 'brand'],
      ['Casa Amiga · Talleres', 'Vereda El Placer, Santa Elena', 'search'],
      ['Sector Amor y Amistad', 'Vereda El Placer, Santa Elena', 'pin'],
      ['Santa Elena', 'Medellín, Antioquia', 'pin'],
    ];
    rows.forEach(([t1, t2, ic], i) => {
      const u = out(seg(t, 3.42 + i * 0.06, 3.9 + i * 0.06));
      const o = u * (1 - k(t, 4.1, 4.28));
      if (o <= 0.002) return;
      const y0 = 232 + i * 128 + (1 - u) * 12;
      if (i === 0) b.sprite('sTop', { color: ORANGE, alpha: 0.1 * k(t, 4.0, 4.08), x: SW / 2, y: y0 + 64, w: SW, h: 128, opacity: o });
      if (ic === 'brand') b.sprite('sTop', { tex: A.pin, x: 72, y: y0 + 64, w: 34, h: 44, opacity: o });
      else b.sprite('sTop', { tex: icon(ic === 'search' ? 'search' : 'pinOutline', 30, INK2, 1.5), x: 72, y: y0 + 64, w: 30, h: 30, opacity: o });
      b.text('sTop', t1, ST(font.ui, INK), 116, y0 + 26, { opacity: o, blur: (1 - u) * 6 });
      b.text('sTop', t2, sty.small(INK2), 116, y0 + 68, { opacity: o, blur: (1 - u) * 6 });
      b.sprite('sTop', { tex: icon('arrowNE', 26, INK2, 1.5), x: 790, y: y0 + 64, w: 26, h: 26, opacity: o });
      b.sprite('sTop', { color: INK, alpha: 0.08, x: SW / 2 + 40, y: y0 + 127, w: SW - 80, h: 1, opacity: o });
    });
    const kIn = spring(seg(t, 2.74, 3.25)), kOut = easeIn(seg(t, 4.08, 4.34));
    const ky = 904 + 284 + (1 - kIn) * 600 + kOut * 600;
    glassOn('sTop', SW / 2, ky, SW, 568, 0, 'light', 1, 'kbd');
    b.sprite('sTop', { tex: A.keyboard, x: SW / 2, y: ky, w: SW, h: 568 }, 'kbdKeys');
  }

  // ── pin en el mapa ──
  const projD = A.mapD.project(camD, PLACES.casa);
  const projS = A.mapS.project(camS, SK.casa);
  const drawPin = (x: number, y: number, s: number, o: number, dropY = 0, sh = 1, id = 'pin', L: LayerName = 'sTop') => {
    if (o <= 0.002) return;
    b.sprite(L, { color: [0.1, 0.05, 0.02], alpha: 0.35 * sh, x, y: y + 4, w: 74 * s * (0.5 + 0.5 * sh), h: 20 * s * (0.5 + 0.5 * sh), radius: 10 * s, feather: 12 * s, opacity: o }, id + 'S');
    b.sprite(L, { color: ORANGE, alpha: 0.22, x, y: y - 100 * s + dropY, w: 190 * s, h: 190 * s, radius: 95 * s, feather: 80 * s, opacity: o }, id + 'G');
    b.sprite(L, { tex: A.pin, x, y: y - 81 * s + dropY, w: 130 * s, h: 166 * s, opacity: o }, id);
  };
  if (t >= 5.0 && t < 8.45) {
    const u = settle(seg(t, 5.0, 5.62));
    const o = clamp(seg(t, 5.0, 5.06) * 3) * (1 - k(t, 6.62, 6.86));
    drawPin(projD[0], projD[1], 1, o, (1 - u) * -300, clamp(u * 1.2));
    const lo = out(seg(t, 5.3, 5.7)) * (1 - k(t, 5.72, 5.9));
    if (lo > 0.002) {
      const w = measure('Casa Amiga', sty.small(INK)) + 40;
      glassOn('sTop', projD[0] + 72 + w / 2, projD[1] - 140, w, 52, RAD.chip, 'light', lo, 'pinLabel');
      b.text('sTop', 'Casa Amiga', ST({ ...font.small, weight: 600 }, INK), projD[0] + 92, projD[1] - 140 - 17, { opacity: lo, blur: (1 - lo) * 6 });
    }
  }
  if (t >= 8.3 && t < 10.15) {
    const s = t < 8.9 ? 1 : camS.z / 2.6;
    const [x, y] = t < 8.9 ? projD : projS;
    drawPin(x, y, clamp(s, 0.45, 1.25), k(t, 8.3, 8.45) * (1 - k(t, 9.8, 10.05)));
    // chip de vidrio "Sector Amor y Amistad" (única etiqueta de la ruta)
    if (t >= 9.0) {
      const cu = spring(seg(t, 9.12 + (A.mapS.sectorF * 0.74) - 0.04, 9.12 + A.mapS.sectorF * 0.74 + 0.4));
      const co = cu * (1 - k(t, 9.8, 10.0));
      if (co > 0.002) {
        const [sx, sy] = A.mapS.project(camS, SK.sector);
        const lbl = cfg.etapas[0]?.nombre ?? 'Sector Amor y Amistad';
        const w = measure(lbl, ST({ ...font.small, weight: 600 }, INK)) + 44;
        glassOn('sTop', sx - 24 - w / 2, sy - 6, w * lerp(0.96, 1, cu), 54, RAD.chip, 'light', co, 'sectorChip');
        b.text('sTop', lbl, ST({ ...font.small, weight: 600 }, INK), sx - 24 - w + 22, sy - 6 - 17, { opacity: co, blur: (1 - cu) * 6 });
        b.sprite('sTop', { color: ORANGE, alpha: 1, x: sx, y: sy, w: 14, h: 14, radius: 7, opacity: co });
      }
    }
  }

  // ── hoja del lugar ──
  const sheetIn = spring(seg(t, 5.8, 6.4)), sheetOut = easeIn(seg(t, 6.62, 7.0));
  const sheetIn2 = spring(seg(t, 15.22, 15.7)), sheetOut2 = 0;
  let Ty = 9999, placeOp = 0;
  if (t >= 5.8 && t < 7.0) { Ty = lerp(SH + 40, 760, sheetIn) + sheetOut * 760; placeOp = 1 - sheetOut * 0.6; }
  if (t >= 15.22 && t < T.C0) { Ty = lerp(SH + 40, 760, sheetIn2) + sheetOut2; placeOp = 1; }
  const heroAtSheet = { x: SW / 2, y: Ty + 40 + 132, w: 792, h: 264, r: RAD.card };
  if (placeOp > 0.002 && Ty < SH) {
    glassOn('sTop', SW / 2, Ty + 400, SW, 800, RAD.panel, 'light', placeOp, 'place');
    b.sprite('sTop', { color: INK, alpha: 0.16, x: SW / 2, y: Ty + 16, w: 64, h: 6, radius: 3, opacity: placeOp }, 'grab');
    b.text('sTop', dat.nombre || 'Casa Amiga', ST(font.title, INK), 36, Ty + 322, { opacity: placeOp, id: 'pt1' });
    b.text('sTop', dat.tipo || '', sty.small(INK2), 36, Ty + 382, { opacity: placeOp, id: 'pt2' });
    b.sprite('sTop', { tex: icon('pinOutline', 26, ORANGE, 1.6), x: 49, y: Ty + 444, w: 26, h: 26, opacity: placeOp }, 'pt3i');
    b.text('sTop', dat.lugar || '', ST({ ...font.small, weight: 560 }, INK), 72, Ty + 427, { opacity: placeOp, id: 'pt3' });
    const by = Ty + 540;
    const ini = k(t, 15.5, 15.62);
    // "Cómo llegar": único elemento de color sólido
    b.sprite('sTop', { color: ORANGE, alpha: 1, x: 36 + 120, y: by, w: 240, h: 80, radius: RAD.button, opacity: placeOp }, 'b1');
    b.sprite('sTop', { tex: icon('route', 26, [1, 1, 1], 1.7), x: 36 + 34, y: by, w: 26, h: 26, opacity: placeOp }, 'b1i');
    b.text('sTop', 'Cómo llegar', ST({ ...font.small, weight: 600 }, [1, 1, 1]), 36 + 56, by - 17, { opacity: placeOp, id: 'b1t' });
    const btn = (x: number, w: number, ic: Parameters<typeof icon>[0], lbl: string, id: string, active = 0) => {
      glassOn('sTop', x + w / 2, by, w, 80, RAD.button, 'light', placeOp, id);
      if (active > 0) b.sprite('sTop', { color: ORANGE, alpha: 1, x: x + w / 2, y: by, w, h: 80, radius: RAD.button, opacity: placeOp * active }, id + 'a');
      const lw = measure(lbl, ST({ ...font.small, weight: 560 }, INK));
      const x0 = x + (w - (26 + 8 + lw)) / 2;
      b.sprite('sTop', { tex: icon(ic, 24, ORANGE, 1.6), x: x0 + 12, y: by, w: 24, h: 24, opacity: placeOp * (1 - active) }, id + 'i');
      b.sprite('sTop', { tex: icon(ic, 24, [1, 1, 1], 1.6), x: x0 + 12, y: by, w: 24, h: 24, opacity: placeOp * active }, id + 'iw');
      b.text('sTop', lbl, ST({ ...font.small, weight: 560 }, INK), x0 + 34, by - 17, { opacity: placeOp * (1 - active), id: id + 't' });
      b.text('sTop', lbl, ST({ ...font.small, weight: 560 }, [1, 1, 1]), x0 + 34, by - 17, { opacity: placeOp * active, id: id + 'tw' });
    };
    btn(284, 160, 'nav', 'Iniciar', 'b2', ini);
    btn(452, 176, 'bookmark', 'Guardar', 'b3');
    btn(636, 184, 'share', 'Compartir', 'b4');
  }

  // ── foto principal (letrero): tarjeta → mosaico → marco de vidrio en el momento de marca ──
  const hero = A.photos.letrero;
  const heroDraw = (x: number, y: number, w: number, h: number, r: number, o: number, frame = 0, amber = 0, blur = 0) => {
    if (o <= 0.002) return;
    if (frame > 0) glassOn('sTop', x, y, w + 20, h + 20, r + 10, 'dark', o * frame, 'heroFrame', amber);
    // recorte "cover" centrado en el letrero
    const ar = w / h, ia = hero.w / hero.h;
    const uw = ar > ia ? 1 : ar / ia, uh = ar > ia ? ia / ar : 1;
    b.sprite('sTop', { tex: hero.tex, x, y, w, h, radius: r, uvRect: [(1 - uw) / 2, (1 - uh) * 0.1, uw, uh], opacity: o, blur }, 'hero');
  };
  if (t >= 5.8 && t < 6.62 && Ty < SH) heroDraw(heroAtSheet.x, heroAtSheet.y, heroAtSheet.w, heroAtSheet.h, RAD.card, placeOp);
  if (t >= 6.62 && t < 8.45) {
    const e = inOut(seg(t, 6.62, 7.22));
    const e2 = inOut(seg(t, 7.52, 8.02));
    const from = { x: SW / 2, y: 760 + 172, w: 792, h: 264 };
    const tile = { x: SW / 2, y: 452, w: 560, h: 560 };
    const small = { x: SW / 2, y: 420, w: 272, h: 272 };
    let x = lerp(from.x, tile.x, e), y = lerp(from.y, tile.y, e), w = lerp(from.w, tile.w, e), h = lerp(from.h, tile.h, e);
    x = lerp(x, small.x, e2); y = lerp(y, small.y, e2); w = lerp(w, small.w, e2); h = lerp(h, small.h, e2);
    const ex = easeIn(seg(t, 8.18, 8.42));
    heroDraw(x, y - ex * 30, w * (1 + 0.06 * ex), h * (1 + 0.06 * ex), RAD.card, 1 - ex, k(t, 6.8, 7.1), brand * 0.35, ex * 10);
  }
  // marca: firma (crema), etiqueta, titular
  if (t >= 6.9 && t < 7.8) {
    const a = textAnim(t, 6.98, 7.48);
    const fw = 420, fh = (fw * A.firma.h) / A.firma.w;
    b.sprite('sTop', { tex: A.firma.tex, tint: true, color: CREAM, alpha: 1, x: SW / 2, y: 820 + a.dy, w: fw, h: fh, opacity: a.o, blur: a.blur, dir: [0, -10 * a.outU] }, 'firma');
    const e = textAnim(t, 7.08, 7.5);
    b.text('sTop', dat.eyebrow || '', sty.label(SOFT_ORANGE), SW / 2, 914, { align: 'center', opacity: e.o, blur: e.blur, dy: e.dy, dir: [0, -10 * e.outU] });
    const lema = (dat.lema || 'Arte que se siente en Casa Amiga.').split(' ');
    // la frase enfatizada en naranja: "Casa Amiga." completo si el lema termina así
    const last = lema.length >= 2 && /^casa$/i.test(lema[lema.length - 2]) ? lema.splice(-2).join(' ') : lema.pop() ?? '';
    const l1 = lema.slice(0, Math.max(1, lema.length - 1)).join(' ');
    const l2pre = lema.slice(Math.max(1, lema.length - 1)).join(' ');
    b.title('sTop', l1, sty.headline(CREAM), SW / 2, 960, 7.14, 7.5, [0, -10], 'h1');
    // segunda línea: una sola palabra enfatizada en naranja
    const st2 = sty.headline(CREAM), st3 = sty.headline(ORANGE);
    const w2 = measure(l2pre + ' ', st2), w3 = measure(last, st3), x0 = SW / 2 - (w2 + w3) / 2;
    b.title('sTop', l2pre, st2, x0 + measure(l2pre, st2) / 2, 960 + 70, 7.22, 7.52, [0, -10], 'h2');
    b.title('sTop', last, st3, x0 + w2 + w3 / 2, 960 + 70, 7.26, 7.52, [0, -10], 'h3');
  }
  // insignia giratoria (texto blanco fino) + disco de vidrio con el ícono
  if (t >= 7.7 && t < 8.45) {
    const u = spring(seg(t, 7.78, 8.3));
    const ex = easeIn(seg(t, 8.18, 8.42));
    const o = u * (1 - ex), s = lerp(0.92, 1, u) * (1 + 0.06 * ex);
    b.sprite('sTop', { tex: A.ring, x: SW / 2, y: 860, w: 460 * s, h: 460 * s, rot: t * 0.32, opacity: o, blur: ex * 10 }, 'ring');
    glassOn('sTop', SW / 2, 860, 300 * s, 300 * s, 150 * s, 'dark', o, 'disc', 0.25 + brand * 0.25);
    b.sprite('sTop', { tex: A.icono.tex, tint: true, color: CREAM, alpha: 1, x: SW / 2, y: 860, w: 190 * s, h: (190 * s * A.icono.h) / A.icono.w, opacity: o, blur: ex * 10 }, 'discIcon');
  }

  // ── barra persistente ──
  const pIn = spring(seg(t, 6.85, 7.3)) * (1 - k(t, 7.55, 7.8)) + spring(seg(t, 8.6, 9.05)) * (t >= 8.6 ? 1 : 0);
  const pOut = k(t, 15.1, 15.32);
  const pOp = clamp(pIn) * (1 - pOut) * (t < T.C0 ? 1 : 0);
  if (pOp > 0.002) {
    const y = 1400 + (1 - pOp) * 40;
    glassOn('sTop', SW / 2, y, 792, 96, 48, 'dark', pOp, 'persist');
    const th = 64;
    b.sprite('sTop', { tex: hero.tex, x: 80, y, w: th, h: th, radius: th / 2, uvRect: [0.18, 0.08, 0.64, 0.64], opacity: pOp }, 'persistTh');
    b.text('sTop', dat.nombre || 'Casa Amiga', ST({ ...font.small, weight: 600 }, CREAM), 128, y - 34, { opacity: pOp, id: 'pp1' });
    b.text('sTop', 'Santa Elena', ST({ ...font.small, size: 22 }, WG), 128, y - 2, { opacity: pOp, id: 'pp2' });
    if (dat.tiempo) {
      b.sprite('sTop', { tex: icon('car', 26, CREAM, 1.5), x: 620, y, w: 26, h: 26, opacity: pOp });
      b.text('sTop', dat.tiempo, ST({ ...font.small, weight: 600 }, CREAM), 640, y - 17, { opacity: pOp });
    }
    b.sprite('sTop', { color: ORANGE, alpha: 1, x: 776, y, w: 64, h: 64, radius: 32, opacity: pOp }, 'pNav');
    b.sprite('sTop', { tex: icon('nav', 26, [1, 1, 1], 1.5), x: 776, y, w: 26, h: 26, opacity: pOp }, 'pNavI');
    const prog = 0.04 + 0.96 * seg(t, 6.6, 15.15);
    b.sprite('sTop', { color: ORANGE, alpha: 1, x: 72 + (680 * prog) / 2, y: y + 44, w: 680 * prog, h: 3, radius: 1.5, opacity: pOp }, 'pProg');
  }

  // ── "Esta también es tu / Casa Amiga." ──
  b.title('sTop', 'Esta también es tu', ST({ ...font.statement, size: 80 }, CREAM), SW / 2, 548, 10.0, 10.98, [0, -14], 'st1');
  b.title('sTop', 'Casa Amiga.', sty.statement(ORANGE), SW / 2, 548 + 100, 10.08, 11.02, [0, -14], 'st2');

  // ── galería: imágenes en marcos de vidrio con profundidad ──
  if (t >= 11.15 && t < 14.6) {
    const e = textAnim(t, 11.2, 12.46);
    b.text('sTop', 'ADENTRO TE ESPERA', sty.label(SOFT_ORANGE), SW / 2, 196, { align: 'center', opacity: e.o, blur: e.blur, dy: e.dy, dir: [0, -10 * e.outU] });
    const ph = A.photos;
    const tiles: { key: string; img: { tex: THREE.Texture; w: number; h: number } }[] = [
      { key: 'obra', img: ph.obra }, { key: 'letrero', img: ph.letrero }, { key: 'ceramica', img: ph.ceramica },
      { key: 'cabana', img: ph.cabana }, { key: 'taller', img: ph.taller }, { key: 'hongo', img: ph.hongo },
    ];
    // A: tres imágenes; B: seis en grilla; C: cuatro flotando con parallax; D: convergencia al pin
    const A3: Record<string, [number, number, number]> = { obra: [172, 600, 0.96], letrero: [428, 560, 1.0], ceramica: [684, 600, 0.96] };
    const G6: Record<string, [number, number]> = { cabana: [160, 520], obra: [428, 520], hongo: [696, 520], ceramica: [160, 856], letrero: [428, 856], taller: [696, 856] };
    const C4: Record<string, [number, number, number, number]> = { obra: [252, 500, 0.94, 14], cabana: [604, 470, 0.98, 26], ceramica: [244, 900, 0.9, 10], letrero: [584, 870, 1.06, 34] };
    const conv = easeIn(seg(t, 14.0, 14.46));
    tiles.forEach((T6, i) => {
      let x = 0, y = 0, w = 232, h = 288, o = 0, bl = 0;
      const a3 = A3[T6.key], g6 = G6[T6.key], c4 = C4[T6.key];
      if (a3) {
        const u = out(seg(t, 11.3 + (i % 3) * 0.07, 11.95 + (i % 3) * 0.07));
        x = a3[0]; y = a3[1] + (1 - u) * 160 * (1 + i * 0.1); w = 256 * a3[2] * lerp(0.9, 1, u); h = 320 * a3[2] * lerp(0.9, 1, u); o = u; bl = (1 - u) * 8;
      }
      const ub = inOut(seg(t, 11.9, 12.42));
      if (g6) {
        if (!a3) { const u = out(seg(t, 11.98 + i * 0.03, 12.5 + i * 0.03)); x = g6[0]; y = g6[1] + (1 - u) * 50; w = 232 * lerp(0.94, 1, u); h = 288 * lerp(0.94, 1, u); o = u; bl = (1 - u) * 8; }
        else { x = lerp(x, g6[0], ub); y = lerp(y, g6[1], ub); w = lerp(w, 232, ub); h = lerp(h, 288, ub); }
      }
      const uc = inOut(seg(t, 12.5, 13.15));
      if (c4) {
        const drift = (t - 12.5) * c4[3] * (t > 12.5 ? 1 : 0);
        x = lerp(x, c4[0], uc); y = lerp(y, c4[1] - drift, uc); w = lerp(w, 272 * c4[2], uc); h = lerp(h, 340 * c4[2], uc);
      } else o *= 1 - k(t, 12.48, 12.75);
      if (conv > 0) { x = lerp(x, SW / 2, conv); y = lerp(y, 740, conv); w *= lerp(1, 0.18, conv); h *= lerp(1, 0.18, conv); o *= 1 - conv; }
      if (o <= 0.002) return;
      glassOn('sTop', x, y, w + 16, h + 16, RAD.card + 8, 'dark', o, 'tf' + T6.key);
      const ar = w / h, ia = T6.img.w / T6.img.h, uw = ar > ia ? 1 : ar / ia, uh = ar > ia ? ia / ar : 1;
      b.sprite('sTop', { tex: T6.img.tex, x, y, w, h, radius: RAD.card, uvRect: [(1 - uw) / 2, (1 - uh) / 2, uw, uh], opacity: o, blur: bl }, 't' + T6.key);
    });
    const sp = textAnim(t, 12.0, 12.44);
    b.text('sTop', 'Obras, objetos y talleres', ST(font.body, CREAM), SW / 2, 1080, { align: 'center', opacity: sp.o, blur: sp.blur, dy: sp.dy });
    b.text('sTop', 'de artistas locales', ST(font.body, CREAM), SW / 2, 1080 + 40, { align: 'center', opacity: sp.o, blur: sp.blur, dy: sp.dy });
  }
  // pin que emerge de la convergencia y vuelve al mapa
  if (t >= 14.38 && t < T.C0) {
    const e = out(seg(t, 14.4, 14.9));
    const back = inOut(seg(t, 15.15, 15.5));
    const x = lerp(SW / 2, projD[0], back), y = lerp(780, projD[1], back);
    const s = lerp(0.2, 1.3, e) * lerp(1, 1 / 1.3, back);
    drawPin(x, y, s, seg(t, 14.4, 14.48), 0, back);
    const c = spring(seg(t, 14.66, 15.06)) * (1 - k(t, 15.06, 15.22));
    if (c > 0.002) {
      const lbl = dat.sector || 'Vereda El Placer · Sector Amor y Amistad';
      const w = measure(lbl, ST({ ...font.small, weight: 600 }, CREAM)) + 48;
      glassOn('sTop', SW / 2, 900, w * lerp(0.96, 1, c), 60, RAD.chip, 'dark', c, 'sectorChip2');
      b.text('sTop', lbl, ST({ ...font.small, weight: 600 }, CREAM), SW / 2, 900 - 17, { align: 'center', opacity: c, blur: (1 - c) * 6 });
    }
  }
  // banner de navegación dentro del teléfono
  const navIn = spring(seg(t, 15.55, 16.0)) * (t < T.C0 ? 1 : 0);
  if (navIn > 0.002) {
    glassOn('sTop', SW / 2, 148, 792 * lerp(0.96, 1, navIn), 112, RAD.panel, 'dark', navIn, 'navIn');
    b.sprite('sTop', { tex: icon('turnRight', 44, ORANGE, 2), x: 84, y: 148, w: 44, h: 44, opacity: navIn });
    b.text('sTop', 'EN RUTA', sty.label(SOFT_ORANGE), 130, 108, { opacity: navIn });
    b.text('sTop', cfg.clips[0]?.navegacion || 'Hacia Sector Amor y Amistad', ST({ ...font.ui, weight: 600 }, CREAM), 130, 138, { opacity: navIn });
  }
  // indicador de toque: círculo de vidrio pequeño + una sola onda
  const tap = (x: number, y: number, at: number) => {
    const u = seg(t, at, at + 0.42);
    if (u <= 0 || u >= 1) return;
    const o = Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
    glassOn('sTop', x, y, 60, 60, 30, 'light', o * 0.9, 'tapG', 0);
    const r = lerp(30, 70, out(u));
    b.sprite('sTop', { color: [1, 1, 1], alpha: 0.35 * (1 - u), x, y, w: r * 2, h: r * 2, radius: r, feather: 14 });
  };
  tap(240, 148, 2.55); tap(300, 296, 3.98); tap(364, 1300, 15.46);

  // ── cierre dentro del teléfono ──
  if (t >= T.C1 - 0.02) {
    const u = settle(seg(t, T.C1 + 0.02, T.C1 + 0.62));
    const mv = inOut(seg(t, T.C1 + 1.1, T.C1 + 1.5));
    const [sx, sy] = projS;
    const lx = SW / 2, ly = 820;
    drawPin(lerp(sx, lx, mv), lerp(sy, ly + 118, mv), lerp(1.05, 1.5, mv), clamp(seg(t, T.C1 + 0.02, T.C1 + 0.06) * 3) * (1 - k(t, T.C1 + 1.3, T.C1 + 1.5)), (1 - u) * -320 * (1 - mv), clamp(u * 1.2) * (1 - mv), 'cpin');
    b.title('sTop', 'Llegaste a', sty.statement(CREAM), SW / 2, 290, T.C1 + 0.8, 1e9, [0, -10], 'c1');
    b.title('sTop', 'Casa Amiga.', sty.statement(ORANGE), SW / 2, 290 + 110, T.C1 + 0.9, 1e9, [0, -10], 'c2');
    const lg = out(seg(t, T.C1 + 1.28, T.C1 + 1.8));
    b.sprite('sTop', { color: ORANGE, alpha: 0.3, x: lx, y: ly, w: 520, h: 520, radius: 260, feather: 220, opacity: lg }, 'logoGlow');
    b.sprite('sTop', { tex: A.logo, x: lx, y: ly, w: 280 * lerp(0.9, 1, lg), h: 280 * lerp(0.9, 1, lg), opacity: lg, blur: (1 - lg) * 10 }, 'logo');
    const h1 = textAnim(t, T.C1 + 1.5, 1e9);
    b.text('sTop', dat.usuario || '', ST({ ...font.body, weight: 500 }, WG), SW / 2, 1000, { align: 'center', opacity: h1.o, blur: h1.blur, dy: h1.dy });
    const h2 = textAnim(t, T.C1 + 1.6, 1e9);
    b.text('sTop', dat.cierre_etiqueta || '', sty.label(SOFT_ORANGE, 0.9), SW / 2, 1052, { align: 'center', opacity: h2.o, blur: h2.blur, dy: h2.dy });
  }

  // ═════════ VENTANA DE VIDEO + METRAJE ═════════
  const footStart = T.HO, footEnd = T.C1;
  if (t >= footStart && t < footEnd) {
    // cuál(es) clip(s) se ven, con la transición de "caída" entre clips
    const local = t - T.HO;
    const fl = (opts.footT ?? t) - T.HO;
    const clips = cfg.clips;
    let ci = clips.length - 1;
    for (let i = 0; i < clips.length; i++) if (local < clips[i].start + clips[i].dur) { ci = i; break; }
    const items: { i: number; dy: number }[] = [];
    const drop = (i: number) => (i > 0 ? inOut(seg(local, clips[i].start, clips[i].start + 0.38)) : 1);
    const dI = drop(ci);
    if (ci > 0 && dI < 1) items.push({ i: ci - 1, dy: -dI * stage.h * 0.9 });
    items.push({ i: ci, dy: (1 - dI) * stage.h });
    for (const it of items) {
      const c = clips[it.i];
      f.footage.push({ clip: it.i, local: fl - c.start });
      const tex = A.footFrame(it.i, fl - c.start) ?? A.placeholders[it.i];
      b.sprite('foot', { tex, x: stage.w / 2, y: stage.h / 2 + it.dy, w: stage.w, h: stage.h }, 'foot' + it.i);
      if (!c.existe) {
        // tarjeta de reemplazo: líneas de carretera que avanzan + barra de progreso
        const u = clamp((fl - c.start) / c.dur);
        for (let j = 0; j < 7; j++) {
          const ph = ((fl - c.start) * 0.9 + j / 7) % 1;
          const yy = 1190 + ph * ph * 760, ww = 4 + ph * 14, hh = 18 + ph * 70;
          b.sprite('foot', { color: C.golden, alpha: 0.55, x: stage.w / 2, y: yy + it.dy, w: ww, h: hh, radius: ww / 2 });
        }
        b.sprite('foot', { color: [1, 1, 1], alpha: 0.12, x: 540, y: 1130 + it.dy, w: 520, h: 4, radius: 2 });
        b.sprite('foot', { color: ORANGE, alpha: 1, x: 280 + 260 * u, y: 1130 + it.dy, w: 520 * u, h: 4, radius: 2 });
      }
    }
    // rectángulo del plano de video: ventana → pantalla completa → ventana → iris al pin
    const POP = { x: 540, y: 648 + 1067 / 2, w: 600, h: 1067 };
    const pop = spring(seg(t, T.HO, T.HO + 0.42));
    const origin = { x: SX + 364, y: SY + 1300 };
    let x = lerp(origin.x, POP.x, pop), y = lerp(origin.y, POP.y, pop), w = POP.w * lerp(0.2, 1, pop), h = POP.h * lerp(0.2, 1, pop), r = lerp(20, 28, pop);
    x = lerp(x, stage.w / 2, handPush); y = lerp(y, stage.h / 2, handPush); w = lerp(w, stage.w, handPush); h = lerp(h, stage.h, handPush); r = lerp(r, 0, handPush);
    x = lerp(x, POP.x, handBack); y = lerp(y, POP.y, handBack); w = lerp(w, POP.w, handBack); h = lerp(h, POP.h, handBack); r = lerp(r, 28, handBack);
    const irisU = easeIn(seg(t, T.C0 + 0.46, T.C1));
    const iris = { x: SX + SW / 2, y: SY + 820 };
    if (irisU > 0) {
      const Rr = lerp(Math.hypot(w, h), 0, irisU);
      const fx = (iris.x - (x - w / 2)) / w, fy = (iris.y - (y - h / 2)) / h;
      b.sprite('stBase', { tex: 'FOOT', flip: true, x: iris.x, y: iris.y, w: Rr, h: Rr, radius: Rr / 2, feather: 2, uvRect: [fx - Rr / w / 2, fy - Rr / h / 2, Rr / w, Rr / h] }, 'footPlane');
    } else {
      // velo que separa la ventana del teléfono desenfocado
      const veil = k(t, T.HO, T.HO + 0.3) * (1 - handPush) + 0;
      b.sprite('stBase', { color: [0.03, 0.02, 0.015], alpha: 0.35, x: stage.w / 2, y: stage.h / 2, w: stage.w, h: stage.h, opacity: veil });
      b.sprite('stBase', { color: [0, 0, 0], alpha: 0.4, x, y: y + 24, w: w + 20, h: h + 20, radius: r + 10, feather: 60, opacity: pop * (1 - handPush) + handBack * 0.6 });
      b.sprite('stBase', { tex: 'FOOT', flip: true, x, y, w, h, radius: r, opacity: clamp(pop * 1.5) }, 'footPlane');
    }
    // encabezado de la ventana emergente
    const hd = pop * (1 - easeIn(seg(t, T.HO + 0.38, T.HO + 0.66)));
    if (hd > 0.002) {
      const hy = lerp(origin.y, 600, pop) - easeIn(seg(t, T.HO + 0.38, T.HO + 0.66)) * 80;
      const hx = lerp(origin.x, 540, pop);
      glassOn('stTop', hx, hy, 600 * lerp(0.2, 1, pop), 96, RAD.panel, 'dark', hd, 'popHead');
      b.sprite('stTop', { tex: A.pin, x: hx - 250, y: hy, w: 30, h: 38, opacity: hd });
      b.text('stTop', 'Cómo llegar a Casa Amiga', ST({ ...font.small, weight: 600 }, CREAM), hx - 222, hy - 32, { opacity: hd, blur: (1 - hd) * 8 });
      b.text('stTop', `VIDEO · ${clips.length} ${clips.length === 1 ? 'TRAMO' : 'TRAMOS'}`, sty.label(SOFT_ORANGE), hx - 222, hy + 2, { opacity: hd });
      b.sprite('stTop', { tex: icon('close', 22, CREAM, 1.6), x: hx + 254, y: hy, w: 22, h: 22, opacity: hd });
    }
    // capas sobre el video (vidrio oscuro, nunca en el tercio inferior)
    const hudOp = spring(seg(t, T.HO + 0.88, T.HO + 1.35)) * (1 - k(t, T.C0 - 0.28, T.C0 - 0.02));
    if (hudOp > 0.002) {
      // banner de navegación: cambia de texto al empezar el clip 2
      const bx = 540, by = 232;
      glassOn('stTop', bx, by, 1000, 112, RAD.panel, 'dark', hudOp, 'hudNav');
      for (let i = 0; i < clips.length; i++) {
        const tin = i === 0 ? -1 : clips[i].start, tout = i === clips.length - 1 ? 1e9 : clips[i + 1].start;
        const a = i === 0 ? { o: 1 - easeIn(seg(local, tout, tout + 0.2)), blur: 6 * seg(local, tout, tout + 0.2), dy: -10 * seg(local, tout, tout + 0.2) } : (() => { const q = textAnim(local, tin + 0.12, tout); return { o: q.o, blur: q.blur, dy: q.dy }; })();
        if (a.o <= 0.002) continue;
        b.sprite('stTop', { tex: icon(i === 0 ? 'turnRight' : 'turnDown', 46, ORANGE, 2), x: 104, y: by + a.dy, w: 46, h: 46, opacity: hudOp * a.o, blur: a.blur });
        b.text('stTop', clips[i].navegacion, ST({ ...font.ui, size: 36, weight: 600 }, CREAM), 152, by - 6 + a.dy, { opacity: hudOp * a.o, blur: a.blur });
      }
      b.text('stTop', 'EN RUTA', sty.label(SOFT_ORANGE), 152, by - 40, { opacity: hudOp });
      // progreso por tramo
      clips.forEach((c, i) => {
        const segW = (1000 - 64 - 8 * (clips.length - 1)) / clips.length;
        const x0 = 72 + i * (segW + 8);
        const u = seg(local, c.start, c.start + c.dur);
        b.sprite('stTop', { color: [1, 1, 1], alpha: 0.18, x: x0 + segW / 2, y: by + 44, w: segW, h: 4, radius: 2, opacity: hudOp });
        if (u > 0) b.sprite('stTop', { color: ORANGE, alpha: 1, x: x0 + (segW * u) / 2, y: by + 44, w: segW * u, h: 4, radius: 2, opacity: hudOp });
      });
      // mini-mapa: sólo "Amor y Amistad" y el pin de Casa Amiga
      const mx = 908, my = 500, mw = 264, mh = 336;
      glassOn('stTop', mx, my, mw, mh, RAD.card, 'dark', hudOp, 'mini');
      const P0: [number, number] = [mx - 60, my + 120], P1: [number, number] = [mx - 8, my + 10], P2: [number, number] = [mx + 52, my - 92];
      const bez = (u: number): [number, number] => {
        if (u < 0.45) { const v = u / 0.45; return [lerp(P0[0], P1[0], v) + Math.sin(v * Math.PI) * 26, lerp(P0[1], P1[1], v)]; }
        const v = (u - 0.45) / 0.55; return [lerp(P1[0], P2[0], v) - Math.sin(v * Math.PI) * 22, lerp(P1[1], P2[1], v)];
      };
      for (let j = 0; j <= 40; j++) { const [px, py] = bez(j / 40); b.sprite('stTop', { color: CREAM, alpha: 0.55, x: px, y: py, w: 4, h: 4, radius: 2, opacity: hudOp }); }
      // el puntito llega a "Amor y Amistad" al final del clip 1 y a Casa Amiga al final del clip 2
      const c0 = clips[0], cl = clips[clips.length - 1];
      const dp = local < c0.start + c0.dur ? 0.45 * inOut(seg(local, c0.start, c0.start + c0.dur)) : 0.45 + 0.55 * inOut(seg(local, cl.start, cl.start + cl.dur));
      for (let j = 0; j <= Math.floor(dp * 40); j++) { const [px, py] = bez(j / 40); b.sprite('stTop', { color: ORANGE, alpha: 1, x: px, y: py, w: 5, h: 5, radius: 2.5, opacity: hudOp }); }
      b.sprite('stTop', { color: CREAM, alpha: 1, x: P1[0], y: P1[1], w: 14, h: 14, radius: 7, opacity: hudOp });
      b.text('stTop', cfg.etapas[0]?.corto || 'Amor y Amistad', ST({ ...font.label, size: 20, weight: 560, tracking: 0.02 }, CREAM), P1[0] - 16, P1[1] + 12, { align: 'right', opacity: hudOp });
      b.sprite('stTop', { tex: A.pin, x: P2[0], y: P2[1] - 20, w: 34, h: 44, opacity: hudOp });
      const [dx, dy] = bez(dp);
      b.sprite('stTop', { color: ORANGE, alpha: 0.35, x: dx, y: dy, w: 34, h: 34, radius: 17, feather: 10, opacity: hudOp }, 'miniDotG');
      b.sprite('stTop', { color: [1, 1, 1], alpha: 1, x: dx, y: dy, w: 14, h: 14, radius: 7, opacity: hudOp }, 'miniDot');
      b.text('stTop', 'TU RUTA', sty.label(SOFT_ORANGE), mx, my - mh / 2 + 18, { align: 'center', opacity: hudOp });
      // titulares por tramo (vidrio, parte superior)
      clips.forEach((c, i) => {
        const caps: { e: string; l: string; tin: number; tout: number }[] = [];
        const tin = c.start + (i === 0 ? Math.max(1.05, c.texto_en) : c.texto_en + 0.3);
        const fin = c.final;
        const finIn = fin ? c.start + c.dur - fin.segundos_antes_del_fin : 1e9;
        caps.push({ e: c.antetitulo, l: c.titulo, tin, tout: Math.min(tin + 2.6, finIn - 0.45, c.start + c.dur - 0.5) });
        if (fin) caps.push({ e: fin.antetitulo, l: fin.titulo, tin: finIn, tout: c.start + c.dur - 0.95 });
        for (const cp of caps) {
          if (local < cp.tin - 0.05 || local > cp.tout + 0.3) continue;
          const q = spring(seg(local, cp.tin, cp.tin + 0.5)), qo = easeIn(seg(local, cp.tout, cp.tout + 0.22));
          const o = q * (1 - qo) * hudOp;
          if (o <= 0.002) continue;
          const stE = sty.label(SOFT_ORANGE), stL = ST({ ...font.caption }, CREAM);
          const w = Math.max(measure(cp.e.toUpperCase(), stE), measure(cp.l, stL)) + 64;
          const cx = 40 + w / 2, cy = 328 + 76;
          glassOn('stTop', cx - (1 - q) * 24, cy, w * lerp(0.96, 1, q), 152, RAD.card, 'dark', o, 'cap' + i);
          b.text('stTop', cp.e, stE, 72 - (1 - q) * 24, cy - 56, { opacity: o, blur: (1 - q) * 8 + qo * 6, dir: [-14 * qo, 0] });
          b.text('stTop', cp.l, stL, 72 - (1 - q) * 24, cy - 26, { opacity: o, blur: (1 - q) * 10 + qo * 6, dir: [-14 * qo, 0] });
        }
      });
    }
  }
  return f;
}

export const _internal = { camDigital, PIN_SCREEN_Y, G };
