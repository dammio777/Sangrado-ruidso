// Orquestador de cuadros: velocidad por elemento → subcuadros adaptativos → pasadas → acumulación → salida.
import * as THREE from 'three';
import { Gfx, Layer, Blur } from './engine/gfx';
import { render as R, stage } from './tokens';
import { state, type Assets, type Frame, type Item, type LayerName } from './scene';

export interface Quality { fps: number; subMin: number; subMax: number; pxPerSub: number; screenSS: number; mapSS: number }
export interface FrameStats { n: number; maxDisp: number; ms: number; screenRenders: number }

const SW = stage.screen.w, SH = stage.screen.h;

export class Film {
  private layers: Record<LayerName, Layer>;
  private screenRT: THREE.WebGLRenderTarget; private screenBlur: Blur; private screenDOF: Blur;
  private stageRT: THREE.WebGLRenderTarget; private stageBlur: Blur;
  private footRT: THREE.WebGLRenderTarget;
  private camScreen: THREE.OrthographicCamera; private camStage: THREE.OrthographicCamera;
  private sig = { screen: '', foot: '', dof: '' };
  private ambCache = new Map<string, { key: string; rt: THREE.WebGLRenderTarget; layer: Layer; cam: THREE.OrthographicCamera }>();
  prof: Record<string, number> | null = null;
  toCanvas = true;
  private tick(name: string, t0: number): number { if (!this.prof) return 0; this.gfx.r.getContext().finish(); const now = performance.now(); this.prof[name] = (this.prof[name] ?? 0) + now - t0; return now; }
  /** Fondo ambiental: suave por naturaleza → se rasteriza a 1/2 resolución y se reutiliza (tiempo cuantizado a 1/8 s; los orbes se mueven < 0,1 px por paso). */
  private ambientTex(L: string, o: import('./engine/gfx').AmbientOpts): THREE.Texture {
    const key = [Math.floor(o.t * 8) / 8, o.glow.toFixed(3), o.lift, o.w, o.h, o.glowX.toFixed(1), o.glowY.toFixed(1)].join('|');
    let c = this.ambCache.get(L);
    if (!c) { const w = Math.round(o.w / 2), h = Math.round(o.h / 2); c = { key: '', rt: this.gfx.makeRT(w, h), layer: new Layer(o.w, o.h), cam: this.gfx.orthoFor(o.w, o.h) }; this.ambCache.set(L, c); }
    if (c.key !== key) {
      c.key = key;
      c.layer.begin();
      c.layer.ambient({ ...o, t: Math.floor(o.t * 8) / 8, x: o.w / 2, y: o.h / 2, z: 0, opacity: 1 });
      this.gfx.draw(c.layer, c.cam, c.rt);
    }
    return c.rt.texture;
  }
  private screenRenders = 0;

  constructor(public gfx: Gfx, public A: Assets, public q: Quality) {
    const ss = q.screenSS;
    this.layers = { sBase: new Layer(SW, SH), sTop: new Layer(SW, SH), foot: new Layer(stage.w, stage.h), stBase: new Layer(stage.w, stage.h), stTop: new Layer(stage.w, stage.h) };
    this.screenRT = gfx.makeRT(SW * ss, SH * ss);
    this.screenBlur = new Blur(SW * ss, SH * ss);
    this.screenDOF = new Blur(SW * ss, SH * ss);
    this.stageRT = gfx.makeRT(stage.w, stage.h);
    this.stageBlur = new Blur(stage.w, stage.h);
    this.footRT = gfx.makeRT(stage.w, stage.h);
    this.camScreen = gfx.orthoFor(SW, SH);
    this.camStage = gfx.orthoFor(stage.w, stage.h);
  }

  get total() { return this.A.T.END; }

  /** Posiciones de cada elemento con id (para medir su desplazamiento durante el obturador). */
  private positions(f: Frame): Map<string, [number, number]> {
    const m = new Map<string, [number, number]>();
    for (const it of f.items) if (it.k !== 'ambient' && it.id) m.set(it.id, [it.o.x, it.o.y]);
    return m;
  }
  /** Desplazamiento del contenido de un mapa entre dos cámaras (centro y esquina). */
  private mapDisp(a: Frame['mapD'] | Frame['mapS'], b: Frame['mapD'] | Frame['mapS']): { dir: [number, number]; max: number } {
    if (!a || !b) return { dir: [0, 0], max: 0 };
    const ca = a.cam, cb = b.cam;
    const proj = (wx: number, wy: number): [number, number] => [(wx - ca.cx) * ca.z + SW / 2, (wy - ca.cy) * ca.z + SH / 2];
    const [px, py] = proj(cb.cx, cb.cy);
    const dir: [number, number] = [SW / 2 - px, SH / 2 - py];
    const [qx, qy] = proj(cb.cx - SW / 2 / cb.z, cb.cy - SH / 2 / cb.z);
    return { dir, max: Math.max(Math.hypot(dir[0], dir[1]), Math.hypot(qx, qy)) };
  }

  /** Renderiza el cuadro del instante t en gfx.out (y en el canvas). */
  render(t: number, seedFrame: number): FrameStats {
    const t0 = performance.now();
    this.screenRenders = 0;
    const shutter = (R.shutterDeg / 360) / this.q.fps;
    // dos evaluaciones en seco (sin GPU): apertura y cierre del obturador
    const fa = state(t - shutter / 2, this.A, { screenSS: this.q.screenSS, footT: t });
    const fb = state(t + shutter / 2, this.A, { screenSS: this.q.screenSS, footT: t });
    const pa = this.positions(fa), pb = this.positions(fb);
    const disp = new Map<string, [number, number]>();
    let maxDisp = 0;
    for (const [id, p] of pb) { const o = pa.get(id); if (!o) continue; const d: [number, number] = [p[0] - o[0], p[1] - o[1]]; disp.set(id, d); maxDisp = Math.max(maxDisp, Math.hypot(d[0], d[1])); }
    const md = this.mapDisp(fa.mapD, fb.mapD), ms = this.mapDisp(fa.mapS, fb.mapS);
    disp.set('mapD', md.dir); disp.set('mapS', ms.dir);
    maxDisp = Math.max(maxDisp, md.max, ms.max);
    const dp = Math.abs(fa.persp.dolly - fb.persp.dolly) + Math.abs(fa.persp.cy - fb.persp.cy);
    maxDisp = Math.max(maxDisp, dp);
    // subcuadros adaptativos: 1 en cuadros quietos, 6–16 en movimientos rápidos
    let n = 1;
    if (maxDisp > R.fastMovePx && this.q.subMax > 1) n = Math.min(this.q.subMax, Math.max(this.q.subMin, Math.ceil(maxDisp / this.q.pxPerSub)));
    for (let i = 0; i < n; i++) {
      const ti = n === 1 ? t : t - shutter / 2 + (shutter * (i + 0.5)) / n;
      const f = n === 1 ? state(t, this.A, { screenSS: this.q.screenSS, footT: t }) : state(ti, this.A, { screenSS: this.q.screenSS, footT: t });
      this.drawFrame(f, disp, n);
      if (n > 1) this.gfx.accumulate(this.stageRT.texture, 1 / n, i === 0);
    }
    let tq = this.prof ? performance.now() : 0;
    this.gfx.resolve(seedFrame % 4096, R.dither, n > 1 ? null : this.stageRT.texture, this.toCanvas);
    tq = this.tick('resolve', tq);
    return { n, maxDisp, ms: performance.now() - t0, screenRenders: this.screenRenders };
  }

  private texSig(v: unknown): string {
    return JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && (x as { isTexture?: boolean }).isTexture ? (x as THREE.Texture).uuid + (x as THREE.Texture).version : typeof x === 'number' ? Math.round(x * 100) / 100 : x));
  }

  private drawFrame(f: Frame, disp: Map<string, [number, number]>, n: number) {
    const g = this.gfx, A = this.A;
    const dirOf = (id: string | undefined): [number, number] | undefined => {
      if (!id) return undefined;
      const d = disp.get(id); if (!d) return undefined;
      const m = Math.hypot(d[0], d[1]);
      if (m < R.motionThresholdPx) return undefined; // cuadros quietos: nítidos
      return [d[0] / n, d[1] / n];
    };
    const by = (L: LayerName) => f.items.filter((it) => it.L === L);

    let tp = this.prof ? performance.now() : 0;
    // mapas (re-rasterizados sólo si cambió la cámara o la ruta)
    if (f.mapD) A.mapD.draw(f.mapD.cam, f.mapD.route, f.mapD.labels);
    if (f.mapS) A.mapS.draw(f.mapS.cam, f.mapS.route);
    tp = this.tick('maps', tp);

    // ── pantalla del teléfono ──
    const sItems = [...by('sBase'), ...by('sTop')];
    const screenUsed = f.items.some((it) => it.k === 'sprite' && it.o.tex === 'SCREEN');
    let dofMix = 0;
    for (const it of f.items) if (it.k === 'sprite' && it.o.tex === 'SCREEN') dofMix = Math.max(dofMix, it.o.dof ?? 0);
    if (screenUsed) {
      const sig = this.texSig({ sItems: sItems.map((it) => [it.k, it.id, it.o, it.id ? dirOf(it.id) : 0]), d: f.mapD, s: f.mapS });
      if (sig !== this.sig.screen) {
        this.sig.screen = sig; this.sig.dof = '';
        this.screenRenders++;
        const ss = this.q.screenSS, tw = SW * ss, th = SH * ss;
        g.clear(this.screenRT, [0.94, 0.9, 0.85], 1);
        this.fill(this.layers.sBase, by('sBase'), dirOf, null, { w: tw, h: th });
        g.draw(this.layers.sBase, this.camScreen, this.screenRT);
        const top = by('sTop');
        if (top.some((it) => it.k === 'glass')) g.blur(this.screenRT.texture, this.screenBlur, tw, th);
        this.fill(this.layers.sTop, top, dirOf, this.screenBlur.out.texture, { w: tw, h: th });
        g.draw(this.layers.sTop, this.camScreen, this.screenRT);
      }
      if (dofMix > 0.002 && this.sig.dof !== this.sig.screen) {
        g.blur(this.screenRT.texture, this.screenDOF, SW * this.q.screenSS, SH * this.q.screenSS);
        this.sig.dof = this.sig.screen;
      }
    }
    tp = this.tick('screen', tp);
    // ── metraje (o tarjetas de reemplazo) ──
    const fItems = by('foot');
    if (fItems.length) {
      const sig = this.texSig(fItems.map((it) => [it.id, it.o]));
      if (sig !== this.sig.foot) {
        this.sig.foot = sig;
        g.clear(this.footRT, [0, 0, 0], 1);
        this.fill(this.layers.foot, fItems, () => undefined, null, { w: stage.w, h: stage.h });
        g.draw(this.layers.foot, this.camStage, this.footRT);
      }
    }
    tp = this.tick('foot', tp);
    // ── escena 3D (fondo, teléfono, plano de video) ──
    g.setPersp(f.persp.cx, f.persp.cy, f.persp.dolly);
    g.clear(this.stageRT, [0.12, 0.075, 0.055], 1);
    this.fill(this.layers.stBase, by('stBase'), dirOf, null, { w: stage.w, h: stage.h });
    g.draw(this.layers.stBase, g.persp, this.stageRT);
    const top = by('stTop');
    if (top.length) {
      if (top.some((it) => it.k === 'glass')) g.blur(this.stageRT.texture, this.stageBlur, stage.w, stage.h);
      this.fill(this.layers.stTop, top, dirOf, this.stageBlur.out.texture, { w: stage.w, h: stage.h });
      g.draw(this.layers.stTop, this.camStage, this.stageRT);
    }
    this.tick('stage', tp);
  }

  private fill(layer: Layer, items: Item[], dirOf: (id?: string) => [number, number] | undefined, back: THREE.Texture | null, target: { w: number; h: number }) {
    layer.begin();
    for (const it of items) {
      if (it.k === 'ambient') { const tex = this.ambientTex(it.L, it.o); layer.sprite({ tex, flip: true, x: it.o.x, y: it.o.y, z: it.o.z, w: it.o.w, h: it.o.h, opacity: it.o.opacity }); continue; }
      if (it.k === 'glass') { if (back) layer.glass(it.o, back, target); continue; }
      const o = it.o;
      let tex: THREE.Texture | null = null, tex2: THREE.Texture | null = null, mix = 0, flip = o.flip;
      if (o.tex === 'SCREEN') { tex = this.screenRT.texture; flip = true; if ((o.dof ?? 0) > 0.002) { tex2 = this.screenDOF.out.texture; mix = o.dof ?? 0; } }
      else if (o.tex === 'FOOT') { tex = this.footRT.texture; flip = true; }
      else tex = o.tex ?? null;
      const d = o.dir ?? dirOf(it.id);
      layer.sprite({ ...o, tex, tex2, mix, flip, dir: d });
    }
  }
}
