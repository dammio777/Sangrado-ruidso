// ─────────────────────────────────────────────────────────────────────────────
// Casa Amiga · DESIGN TOKENS
// Único lugar con valores de estilo: color, vidrio, radios, sombras, tipografía,
// easing, duraciones y parámetros de render. Todo el resto del código los lee de aquí.
// ─────────────────────────────────────────────────────────────────────────────

export type RGB = readonly [number, number, number];
export type RGBA = readonly [number, number, number, number];

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const color = {
  // paleta de marca (valores del brief + logo)
  espresso: hex('#2A1A14'),
  rustDeep: hex('#5A2410'),
  rustLogo: hex('#7D2E12'),
  orange: hex('#F28C1E'),
  orangeLogo: hex('#F29021'),
  golden: hex('#FFC874'),
  cream: hex('#F6EFE6'),
  ink: hex('#16110E'),
  warmGray: hex('#A89A90'),
  // mapa
  mapSand: hex('#E8DDCB'),
  mapSandLight: hex('#F6F0E6'),
  mapSage: hex('#D3D6BC'),
  mapUrban: hex('#E6DCCD'),
  mapRiver: hex('#CBD3C3'),
  mapContour: [0.42, 0.38, 0.3] as RGB,
  paper: hex('#F3EBDD'),
  inkLine: hex('#2B1D17'),
} as const;

export const css = (c: RGB, a = 1) =>
  `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

/** Un único material de vidrio, en dos tintes (sobre fondo oscuro / sobre fondo claro). */
export const glass = {
  blurPx: 34, // radio efectivo del blur dual-Kawase (28–40 px)
  saturation: 1.55, // 140–170 %
  refraction: 2.0, // px de desplazamiento cerca del borde
  rimTop: 0.35, // borde 1 px: blanco 35 % arriba-izquierda…
  rimBottom: 0.06, // …a 6 % abajo-derecha
  specular: 0.55, // brillo interior de 1 px en el borde superior
  dark: { tint: [1.0, 0.957, 0.91, 0.1] as RGBA, darken: 0.34 }, // rgba(255,244,232,.10) + capa oscura para el texto
  light: { tint: [1.0, 0.982, 0.958, 0.6] as RGBA, darken: 1.0 },
  shadow: { dy: 24, blur: 60, alpha: 0.35 },
  contact: { dy: 2, blur: 6, alpha: 0.16 },
} as const;

export const radius = { panel: 28, card: 20, button: 14, chip: 14, phone: 72 } as const;
export const grid = 8;

/** Escena: lienzo, teléfono y cámara 2.5D. Todo alineado a la grilla de 8 px. */
export const stage = {
  w: 1080,
  h: 1920,
  camDist: 2400, // distancia de la cámara al plano z=0 (1 unidad = 1 px en z=0)
  bgDepth: 1400, // profundidad del fondo ambiental (parallax)
  screen: { x: 112, y: 256, w: 856, h: 1472 }, // pantalla del teléfono (~79 % del ancho)
  frame: 8, // grosor del marco
} as const;

export const font = {
  family: '"Inter Display", "Inter Var", system-ui, sans-serif',
  // escala tipográfica (≈18 % menor que el borrador v1)
  hero: { size: 108, weight: 600, tracking: -0.028, lh: 1.14 },
  statement: { size: 96, weight: 600, tracking: -0.026, lh: 1.14 },
  headline: { size: 60, weight: 600, tracking: -0.022, lh: 1.16 },
  caption: { size: 56, weight: 600, tracking: -0.02, lh: 1.12 },
  title: { size: 44, weight: 600, tracking: -0.015, lh: 1.2 },
  body: { size: 30, weight: 500, tracking: -0.005, lh: 1.3 },
  ui: { size: 30, weight: 500, tracking: -0.005, lh: 1.25 },
  small: { size: 26, weight: 450, tracking: 0, lh: 1.3 },
  label: { size: 22, weight: 560, tracking: 0.08, lh: 1.2 }, // etiquetas en mayúsculas +8 %
} as const;

export const motion = {
  // easing (cubic-bezier) — rápido en el medio, suave en los extremos: el blur llega a su pico a mitad del movimiento
  inOut: [0.65, 0.0, 0.35, 1.0] as const,
  out: [0.16, 1.0, 0.3, 1.0] as const,
  in: [0.55, 0.0, 0.9, 0.4] as const,
  springW: 14, // resorte críticamente amortiguado (ω)
  textIn: 0.55, // entrada de línea
  textStagger: 0.08, // entre líneas
  charStagger: 0.012, // entre caracteres de títulos
  textDrift: 10, // px hacia arriba
  textBlur: 10, // px → 0
  textOut: 0.2,
  panelIn: 0.5,
  orbTravel: 40, // px máximos de deriva de los orbes en toda la película
} as const;

export const render = {
  shutterDeg: 180,
  draft: { fps: 30, subMin: 6, subMax: 8, pxPerSub: 14, screenSS: 1.0, mapSS: 1.0, preset: 'veryfast', crf: 20 },
  final: { fps: 60, subMin: 8, subMax: 16, pxPerSub: 6, screenSS: 1.5, mapSS: 1.5, preset: 'slow', crf: 15 },
  preview: { fps: 60, subMin: 1, subMax: 1, pxPerSub: 99, screenSS: 1.0, mapSS: 1.0 },
  motionThresholdPx: 0.75, // por debajo: nítido (sin blur)
  fastMovePx: 10, // desplazamiento durante el obturador a partir del cual se usan subcuadros; debajo, 1 subcuadro + blur direccional
  dither: 1.0, // LSB de ruido antes de codificar (evita banding en gradientes)
  backdropScale: 0.25, // blur del vidrio a 1/4 de resolución
} as const;

/** Línea de tiempo base (s). Las secciones con metraje se calculan desde clips.json. */
export const timing = {
  handoff: 15.6, // la ventana de video se abre aquí; el intro "termina" a las 16.5
  introEnd: 16.5,
  closing: 3.0,
  wipe: 0.36, // transición entre clips
} as const;
