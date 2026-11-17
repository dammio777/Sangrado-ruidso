// Mapa dibujado a mano, versión mínima: tinta fina de un solo grosor (1.25 px), sólo montañas esenciales,
// la vía, el desvío que baja a Casa Amiga y la ruta naranja con brillo en la punta. Sin nombres de otros lugares.
import * as THREE from 'three';
import { canvasTexture } from '../engine/gfx';
import { color as C, css } from '../tokens';
import { smoothPath, sampleSmooth, Polyline, type P } from './geo';
import type { Cam } from './digital';

const ROAD: P[] = [[200, 1660], [330, 1480], [440, 1330], [330, 1170], [420, 1010], [560, 860], [600, 720], [690, 560], [660, 380], [720, 180]];
const LANE: P[] = [[600, 720], [700, 770], [770, 860], [790, 980]];
export const SK = { start: ROAD[0], sector: [600, 720] as P, casa: LANE[LANE.length - 1] };

const MOUNTAINS: P[][] = [
  [[-80, 300], [60, 170], [150, 250], [250, 120], [380, 260]],
  [[760, 260], [870, 130], [960, 210], [1080, 90]],
  [[-60, 900], [60, 780], [150, 860]],
  [[880, 1240], [960, 1130], [1060, 1220]],
  [[20, 1460], [110, 1370], [190, 1440]],
];
const TREES: P[] = [[150, 1050], [210, 1090], [880, 700], [930, 760], [520, 1500], [580, 1540], [880, 1520], [240, 560], [300, 600]];

export class SketchMap {
  canvas = document.createElement('canvas');
  tex: THREE.CanvasTexture;
  route: Polyline;
  sectorF: number;
  private lane = smoothPath(LANE);
  private mountains = MOUNTAINS.map((m) => smoothPath(m));
  private roadL = new Path2D(); private roadR = new Path2D();
  private lastKey = '';
  constructor(public w: number, public h: number, public ss: number) {
    this.canvas.width = Math.round(w * ss); this.canvas.height = Math.round(h * ss);
    this.tex = canvasTexture(this.canvas, false);
    const roadS = sampleSmooth(ROAD, 40);
    const cut = roadS.findIndex((p) => Math.hypot(p[0] - SK.sector[0], p[1] - SK.sector[1]) < 4);
    const first = roadS.slice(0, cut + 1);
    this.route = new Polyline([...first, ...sampleSmooth(LANE, 40).slice(1)]);
    this.sectorF = this.route.fractionOf(SK.sector);
    // bordes de la vía: dos líneas paralelas (desplazamiento por la normal)
    const off = 9;
    roadS.forEach((p, i) => {
      const a = roadS[Math.max(0, i - 1)], b = roadS[Math.min(roadS.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      if (i === 0) { this.roadL.moveTo(p[0] + nx * off, p[1] + ny * off); this.roadR.moveTo(p[0] - nx * off, p[1] - ny * off); }
      else { this.roadL.lineTo(p[0] + nx * off, p[1] + ny * off); this.roadR.lineTo(p[0] - nx * off, p[1] - ny * off); }
    });
  }
  project(cam: Cam, p: P): [number, number] { return [(p[0] - cam.cx) * cam.z + this.w / 2, (p[1] - cam.cy) * cam.z + this.h / 2]; }

  draw(cam: Cam, routeF: number, laneAlpha = 1): void {
    const key = `${cam.cx.toFixed(2)},${cam.cy.toFixed(2)},${cam.z.toFixed(5)},${routeF.toFixed(4)},${laneAlpha.toFixed(3)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    const g = this.canvas.getContext('2d')!;
    const s = this.ss, z = cam.z;
    g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, this.canvas.height);
    bg.addColorStop(0, '#F6EFE3'); bg.addColorStop(1, css(C.paper));
    g.fillStyle = bg; g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    g.setTransform(z * s, 0, 0, z * s, (this.w / 2 - cam.cx * z) * s, (this.h / 2 - cam.cy * z) * s);
    const px = (v: number) => v / z;
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = css(C.inkLine, 0.92); g.lineWidth = px(1.6);
    for (const m of this.mountains) g.stroke(m);
    for (const [x, y] of TREES) {
      const t = new Path2D(`M${x} ${y} V${y - 34} M${x} ${y - 32} L${x - 10} ${y - 18} M${x} ${y - 32} L${x + 10} ${y - 18} M${x} ${y - 22} L${x - 14} ${y - 6} M${x} ${y - 22} L${x + 14} ${y - 6}`);
      g.stroke(t);
    }
    g.stroke(this.roadL); g.stroke(this.roadR);
    g.save(); g.setLineDash([px(6), px(8)]); g.strokeStyle = css(C.inkLine, 0.5 * laneAlpha); g.stroke(this.lane); g.restore();
    if (routeF > 0.001) {
      const part = this.route.partial(routeF);
      g.strokeStyle = 'rgba(242,140,30,0.22)'; g.lineWidth = px(12); g.stroke(part);
      g.strokeStyle = css(C.orange); g.lineWidth = px(4.5); g.stroke(part);
      const [hx, hy] = this.route.at(routeF);
      if (routeF < 0.999) {
        g.setTransform(s, 0, 0, s, 0, 0);
        const [sx, sy] = this.project(cam, [hx, hy]);
        const r = g.createRadialGradient(sx, sy, 0, sx, sy, 34);
        r.addColorStop(0, 'rgba(255,200,116,0.95)'); r.addColorStop(0.25, 'rgba(242,140,30,0.55)'); r.addColorStop(1, 'rgba(242,140,30,0)');
        g.fillStyle = r; g.beginPath(); g.arc(sx, sy, 34, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#FFF6EA'; g.beginPath(); g.arc(sx, sy, 5, 0, Math.PI * 2); g.fill();
      }
    }
    this.tex.needsUpdate = true;
  }
}
