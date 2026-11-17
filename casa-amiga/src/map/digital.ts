// Mapa digital: UN solo mapa vectorial procedimental continuo (sin teselas ni grillas).
// Mundo fijo 4000×4000; una proyección; terreno, vías, etiquetas y pin en el mismo espacio.
import * as THREE from 'three';
import { canvasTexture } from '../engine/gfx';
import { color as C, css, font } from '../tokens';
import { clamp, seg } from '../ease';
import { makeNoise, smoothPath, sampleSmooth, Polyline, type P } from './geo';

export interface Cam { cx: number; cy: number; z: number }

export const WORLD = 4000;
export const PLACES = {
  medellin: [1000, 2050] as P,
  santaElena: [2660, 1560] as P,
  placer: [2900, 1340] as P,
  sector: [2960, 1300] as P,
  casa: [3030, 1392] as P,
};

const ROAD_MAIN: P[] = [[1180, 2010], [1380, 1930], [1560, 1990], [1760, 1880], [1900, 1720], [2120, 1760], [2330, 1640], [2520, 1600], [2660, 1560], [2780, 1450], [2900, 1360], [2960, 1300], [3040, 1180], [3160, 1060]];
const LANE: P[] = [[2960, 1300], [2996, 1330], [3020, 1362], [3030, 1392]];
const SECONDARY: P[][] = [
  [[2660, 1560], [2640, 1380], [2700, 1180], [2650, 980], [2700, 760]],
  [[2660, 1560], [2800, 1700], [3000, 1780], [3240, 1760]],
  [[2330, 1640], [2280, 1880], [2350, 2120], [2300, 2400]],
  [[2900, 1360], [3100, 1420], [3300, 1380], [3500, 1460]],
  [[1900, 1720], [1980, 1480], [1920, 1240], [2040, 1000]],
  [[3040, 1180], [3220, 1240], [3420, 1180]],
];
const URBAN: P[][] = [
  [[720, 1500], [900, 1700], [1000, 2050], [1080, 2400], [1180, 2700]],
  [[700, 1900], [900, 1960], [1180, 2010]],
  [[760, 2250], [1000, 2280], [1240, 2320]],
  [[780, 1650], [980, 1690], [1200, 1740]],
  [[860, 1400], [880, 1800], [820, 2200], [860, 2600]],
  [[1150, 1500], [1120, 1900], [1160, 2300], [1220, 2650]],
];
const RIVER: P[] = [[760, 900], [820, 1400], [900, 1800], [960, 2200], [1060, 2700], [1100, 3100]];

export class DigitalMap {
  canvas = document.createElement('canvas');
  tex: THREE.CanvasTexture;
  private terrain = document.createElement('canvas');
  private contours = new Path2D();
  private main = smoothPath(ROAD_MAIN);
  private lane = smoothPath(LANE);
  private secondary = SECONDARY.map((p) => smoothPath(p));
  private urban = URBAN.map((p) => smoothPath(p));
  private river = smoothPath(RIVER);
  route: Polyline; // ruta de navegación: últimos tramos de la vía principal + el desvío a Casa Amiga
  private lastKey = '';
  constructor(public w: number, public h: number, public ss: number) {
    this.canvas.width = Math.round(w * ss); this.canvas.height = Math.round(h * ss);
    this.tex = canvasTexture(this.canvas, false);
    const mainS = sampleSmooth(ROAD_MAIN, 40);
    const cut = mainS.findIndex((p) => Math.hypot(p[0] - PLACES.sector[0], p[1] - PLACES.sector[1]) < 6);
    const tail = mainS.slice(Math.max(0, cut - 150), cut + 1);
    this.route = new Polyline([...tail, ...sampleSmooth(LANE, 30).slice(1)]);
    this.buildTerrain();
  }

  private height = makeNoise(1907);
  private field(x: number, y: number): number {
    // montañas al oriente, valle de Medellín al occidente, todo de un mismo campo de ruido
    const east = clamp((x - 1300) / 1900);
    const valley = Math.exp(-(((x - 950) / 520) ** 2));
    return clamp(0.18 + 0.55 * east * east * (3 - 2 * east) + 0.3 * (this.height(x / 1150, y / 1150) - 0.5) - 0.12 * valley + 0.05);
  }
  private buildTerrain() {
    const R = 1024, img = new ImageData(R, R), d = img.data;
    const f = new Float32Array((R + 1) * (R + 1));
    for (let j = 0; j <= R; j++) for (let i = 0; i <= R; i++) f[j * (R + 1) + i] = this.field((i / R) * WORLD, (j / R) * WORLD);
    const sand = C.mapSand, sage = C.mapSage, urb = C.mapUrban;
    for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
      const h = f[j * (R + 1) + i];
      const gx = f[j * (R + 1) + i + 1] - h, gy = f[(j + 1) * (R + 1) + i] - h;
      const shade = clamp(1 + (-gx * 0.7 - gy * 0.7) * 11, 0.93, 1.035); // luz desde el noroeste
      const veg = clamp((h - 0.32) / 0.4);
      const wx = (i / R) * WORLD, wy = (j / R) * WORLD;
      const u = clamp(1 - Math.hypot((wx - 980) / 420, (wy - 2050) / 820)) ** 0.6 * 0.85;
      for (let c = 0; c < 3; c++) {
        let v = sand[c] + (sage[c] - sand[c]) * veg * 0.85;
        v = v + (urb[c] - v) * u;
        d[(j * R + i) * 4 + c] = clamp(v * shade) * 255;
      }
      d[(j * R + i) * 4 + 3] = 255;
    }
    this.terrain.width = this.terrain.height = R;
    this.terrain.getContext('2d')!.putImageData(img, 0, 0);
    // curvas de nivel (marching squares) del MISMO campo, en coordenadas de mundo
    const G = 320, cell = WORLD / G, gf = new Float32Array((G + 1) * (G + 1));
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) gf[j * (G + 1) + i] = this.field(i * cell, j * cell);
    for (const lv of [0.42, 0.52, 0.62, 0.72, 0.82]) {
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const a = gf[j * (G + 1) + i], b = gf[j * (G + 1) + i + 1], c = gf[(j + 1) * (G + 1) + i + 1], dd = gf[(j + 1) * (G + 1) + i];
        const pts: [number, number][] = [];
        const e = (v1: number, v2: number, x1: number, y1: number, x2: number, y2: number) => { if ((v1 < lv) !== (v2 < lv)) { const t = (lv - v1) / (v2 - v1); pts.push([(x1 + (x2 - x1) * t) * cell, (y1 + (y2 - y1) * t) * cell]); } };
        e(a, b, i, j, i + 1, j); e(b, c, i + 1, j, i + 1, j + 1); e(c, dd, i + 1, j + 1, i, j + 1); e(dd, a, i, j + 1, i, j);
        if (pts.length >= 2) { this.contours.moveTo(pts[0][0], pts[0][1]); this.contours.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { this.contours.moveTo(pts[2][0], pts[2][1]); this.contours.lineTo(pts[3][0], pts[3][1]); }
      }
    }
  }

  project(cam: Cam, p: P): [number, number] { return [(p[0] - cam.cx) * cam.z + this.w / 2, (p[1] - cam.cy) * cam.z + this.h / 2]; }

  /** Dibuja el mapa para la cámara dada (re-rasteriza sólo si cambia algo). */
  draw(cam: Cam, routeF: number, labelAlpha: number): void {
    const key = `${cam.cx.toFixed(2)},${cam.cy.toFixed(2)},${cam.z.toFixed(5)},${routeF.toFixed(4)},${labelAlpha.toFixed(3)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    const g = this.canvas.getContext('2d')!;
    const s = this.ss, z = cam.z;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = css(C.mapSand); g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const world = () => g.setTransform(z * s, 0, 0, z * s, (this.w / 2 - cam.cx * z) * s, (this.h / 2 - cam.cy * z) * s);
    world();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(this.terrain, 0, 0, WORLD, WORLD);
    const px = (v: number) => v / z; // ancho constante en pantalla
    const grow = 1 + 0.3 * clamp(Math.log2(z / 1.2), 0, 1.5); // ligero engrosamiento sólo con mucho zoom
    g.lineCap = 'round'; g.lineJoin = 'round';
    // curvas de nivel: aparecen suavemente con el zoom
    const ca = seg(z, 0.42, 0.75) * 0.16;
    if (ca > 0.003) { g.strokeStyle = css(C.mapContour, ca); g.lineWidth = px(1.1); g.stroke(this.contours); }
    // río (verde salvia, nunca azul)
    g.strokeStyle = css(C.mapRiver, 0.9); g.lineWidth = px(4.5 * grow); g.stroke(this.river);
    // calles urbanas (nivel de detalle con fundido)
    const ua = seg(z, 0.38, 0.7);
    if (ua > 0.003) { g.strokeStyle = `rgba(255,255,255,${0.85 * ua})`; g.lineWidth = px(2.6); for (const p of this.urban) g.stroke(p); }
    // vías secundarias
    g.strokeStyle = 'rgba(150,128,100,0.32)'; g.lineWidth = px(5.6 * grow); for (const p of this.secondary) g.stroke(p);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = px(3.4 * grow); for (const p of this.secondary) g.stroke(p);
    // vía principal y desvío
    g.strokeStyle = 'rgba(140,115,85,0.38)'; g.lineWidth = px(9.5 * grow); g.stroke(this.main);
    g.strokeStyle = '#FFFDF9'; g.lineWidth = px(6.4 * grow); g.stroke(this.main);
    const la = seg(z, 1.3, 1.9);
    if (la > 0.003) {
      g.strokeStyle = `rgba(150,125,95,${0.25 * la})`; g.lineWidth = px(6 * grow); g.stroke(this.lane);
      g.strokeStyle = `rgba(255,253,249,${la})`; g.lineWidth = px(4 * grow); g.stroke(this.lane);
    }
    // ruta naranja (navegación)
    if (routeF > 0.001) {
      g.strokeStyle = 'rgba(242,140,30,0.25)'; g.lineWidth = px(14 * grow); g.stroke(this.route.partial(routeF));
      g.strokeStyle = css(C.orange); g.lineWidth = px(7 * grow); g.stroke(this.route.partial(routeF));
    }
    // etiquetas: derechas, tamaño fijo en pantalla, con prevención de choques
    g.setTransform(s, 0, 0, s, 0, 0);
    const placed: [number, number, number, number][] = [];
    const label = (txt: string, p: P, size: number, weight: number, alpha: number, upper = false, track = 0) => {
      if (alpha * labelAlpha <= 0.01) return;
      const [x, y] = this.project(cam, p);
      g.font = `${weight} ${size}px ${font.family}`;
      (g as unknown as { letterSpacing: string }).letterSpacing = `${track * size}px`;
      const t = upper ? txt.toUpperCase() : txt;
      const w = g.measureText(t).width;
      const box: [number, number, number, number] = [x - w / 2 - 6, y - size, w + 12, size * 1.4];
      if (box[0] < 8 || box[0] + box[2] > this.w - 8 || box[1] < 220 || box[1] + box[3] > this.h - 40) return;
      if (placed.some((b) => !(box[0] > b[0] + b[2] || b[0] > box[0] + box[2] || box[1] > b[1] + b[3] || b[1] > box[1] + box[3]))) return;
      placed.push(box);
      g.textAlign = 'center'; g.lineJoin = 'round';
      g.strokeStyle = `rgba(246,240,230,${0.9 * alpha * labelAlpha})`; g.lineWidth = 5; g.strokeText(t, x, y);
      g.fillStyle = css([0.36, 0.32, 0.28], alpha * labelAlpha); g.fillText(t, x, y);
    };
    label('Medellín', [960, 1880], 30, 600, 1 - seg(z, 0.9, 1.3), true, 0.12);
    label('Santa Elena', [PLACES.santaElena[0] - 40, PLACES.santaElena[1] + 90], 26, 600, seg(z, 0.45, 0.6) * (1 - seg(z, 2.0, 2.4)));
    label('Vereda El Placer', [PLACES.placer[0] - 150, PLACES.placer[1] - 40], 24, 560, seg(z, 1.6, 2.1));
    (g as unknown as { letterSpacing: string }).letterSpacing = '0px';
    this.tex.needsUpdate = true;
  }
}
