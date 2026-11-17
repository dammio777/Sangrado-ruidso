// Motor WebGL2 (Three.js como capa fina sobre WebGL2).
// Pasadas: base → blur dual-Kawase a 1/4 → vidrio (shader) + contenido → acumulación de subcuadros → salida con dither.
import * as THREE from 'three';
import { glass as G, stage } from '../tokens';

THREE.ColorManagement.enabled = false;

// ───────────────────────────── shaders ─────────────────────────────
const VS_QUAD = /* glsl */ `
varying vec2 vUv; varying vec2 vPx;
uniform vec2 uSize;
void main(){ vUv = uv; vPx = uv * uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const SDF = /* glsl */ `
float sdRound(vec2 px, vec2 size, float r){ vec2 p = px - size*0.5; vec2 q = abs(p) - size*0.5 + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }`;

// Sprite: textura o color, blur isotrópico (disco dorado de 16 taps), blur direccional (velocidad),
// máscara redondeada, mezcla con versión desenfocada (profundidad de campo), recoloreo por alfa, borde.
const FS_SPRITE = /* glsl */ `
uniform sampler2D uTex; uniform sampler2D uTex2; uniform float uHasTex; uniform float uMix;
uniform vec4 uColor; uniform float uOpacity; uniform vec2 uSize; uniform float uRadius;
uniform float uBlur; uniform vec2 uDir; uniform float uFlip; uniform vec4 uUvRect; uniform float uTintMode; uniform float uRim; uniform float uFeather;
varying vec2 vUv; varying vec2 vPx;
${SDF}
vec4 samp(vec2 uv){
  uv = uUvRect.xy + uv * uUvRect.zw;
  if (uFlip > 0.5) uv.y = 1.0 - uv.y;
  vec4 c = texture2D(uTex, uv);
  if (uMix > 0.001) c = mix(c, texture2D(uTex2, uv), uMix);
  return c;
}
void main(){
  vec4 c;
  if (uHasTex > 0.5) {
    vec2 uv0 = vUv;
    if (uBlur > 0.35 || dot(uDir,uDir) > 0.5) {
      vec2 px = 1.0 / uSize; c = vec4(0.0);
      for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float r = sqrt((fi + 0.5) / 16.0); float a = fi * 2.39996323;
        vec2 o = vec2(cos(a), sin(a)) * r * uBlur + uDir * (fi / 15.0 - 0.5);
        c += samp(uv0 + o * px);
      }
      c /= 16.0;
    } else c = samp(uv0);
    if (uTintMode > 0.5) c = vec4(uColor.rgb, 1.0) * c.a * uColor.a;
  } else c = vec4(uColor.rgb * uColor.a, uColor.a);
  if (uRadius > 0.0) {
    float d = sdRound(vPx, uSize, uRadius);
    c *= uFeather > 1.5 ? smoothstep(0.0, uFeather, -d) : clamp(0.5 - d, 0.0, 1.0);
    if (uRim > 0.0) {
      float band = clamp(d + 1.6, 0.0, 1.0) * clamp(0.5 - d, 0.0, 1.0);
      float g = clamp((vPx.x / uSize.x + vPx.y / uSize.y) * 0.5, 0.0, 1.0);
      c.rgb += vec3(1.0) * band * mix(0.35, 0.06, g) * uRim;
    }
  }
  gl_FragColor = c * uOpacity;
}`;

// Vidrio: muestrea el fondo ya desenfocado (1/4 res) en coordenadas de pantalla, satura, tiñe,
// refracción sutil en el borde, borde de 1 px en degradé y brillo especular superior.
const FS_GLASS = /* glsl */ `
uniform sampler2D uBack; uniform vec2 uTarget; uniform vec2 uSize; uniform float uRadius; uniform vec4 uTint;
uniform float uDarken; uniform float uSat; uniform float uOpacity; uniform float uRefr; uniform float uSpec; uniform vec3 uAmber; uniform float uAmberA;
varying vec2 vPx;
${SDF}
void main(){
  float d = sdRound(vPx, uSize, uRadius);
  float m = clamp(0.5 - d, 0.0, 1.0);
  if (m <= 0.0) discard;
  vec2 suv = gl_FragCoord.xy / uTarget;
  vec2 p = vPx - uSize * 0.5;
  float edge = smoothstep(-28.0, 0.0, d);
  vec2 n = p / max(length(p), 1e-3);
  suv -= vec2(n.x, -n.y) * edge * uRefr / uTarget;
  vec3 b = texture2D(uBack, suv).rgb;
  float l = dot(b, vec3(0.2126, 0.7152, 0.0722));
  b = mix(vec3(l), b, ${G.saturation.toFixed(3)} * uSat);
  b *= uDarken;
  vec3 col = mix(b, uTint.rgb, uTint.a);
  col = mix(col, uAmber, uAmberA);
  float band = clamp(d + 1.6, 0.0, 1.0) * m;
  float g = clamp((vPx.x / uSize.x + vPx.y / uSize.y) * 0.5, 0.0, 1.0);
  col = mix(col, vec3(1.0), band * mix(${G.rimTop.toFixed(3)}, ${G.rimBottom.toFixed(3)}, g));
  float spec = smoothstep(3.0, 1.2, vPx.y) * smoothstep(0.0, max(uRadius, 8.0), min(vPx.x, uSize.x - vPx.x));
  col += vec3(1.0) * spec * uSpec * 0.22 * m;
  gl_FragColor = vec4(col * m * uOpacity, m * uOpacity);
}`;

const FS_SHADOW = /* glsl */ `
uniform vec2 uSize; uniform vec2 uInner; uniform float uRadius; uniform float uSigma; uniform float uAlpha;
varying vec2 vPx;
${SDF}
void main(){
  vec2 off = (uSize - uInner) * 0.5;
  float d = sdRound(vPx - off, uInner, uRadius);
  float a = uAlpha * exp(-max(d, 0.0) * max(d, 0.0) / (2.0 * uSigma * uSigma)) * smoothstep(-uSigma * 1.5, 0.0, d + uSigma * 0.25);
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}`;

// Fondo ambiental: malla de degradé cálido con orbes que derivan con el tiempo absoluto, brillo naranja de marca y grano estático.
const FS_AMBIENT = /* glsl */ `
uniform float uT; uniform vec2 uSize; uniform float uGlow; uniform vec2 uGlowPos; uniform float uLift; uniform float uOpacity;
uniform vec3 cEsp; uniform vec3 cRust; uniform vec3 cAmber; uniform vec3 cGold; uniform float uTravel;
varying vec2 vPx;
float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
vec3 blob(vec3 c, vec2 p, vec2 q, float r, vec3 col, float s){ float d = length(p - q) / r; return mix(c, col, s * exp(-d * d)); }
void main(){
  vec2 p = vPx / uSize.y * 1920.0;
  vec2 o1 = uTravel * vec2(sin(uT * 0.21), cos(uT * 0.17));
  vec2 o2 = uTravel * vec2(cos(uT * 0.13 + 1.3), sin(uT * 0.19 + 0.4));
  vec2 o3 = uTravel * vec2(sin(uT * 0.11 + 2.1), sin(uT * 0.15 + 2.9));
  float W = uSize.x / uSize.y * 1920.0;
  vec3 c = cEsp * (0.86 + 0.14 * (1.0 - p.y / 1920.0));
  c = blob(c, p, vec2(W * 0.12, 260.0) + o1, 720.0, cRust, 0.85);
  c = blob(c, p, vec2(W * 0.18, 180.0) + o1, 420.0, cAmber, 0.20 + uLift * 0.1);
  c = blob(c, p, vec2(W * 0.92, 980.0) + o2, 640.0, cRust, 0.55);
  c = blob(c, p, vec2(W * 0.55, 1800.0) + o3, 700.0, cEsp * 0.6, 0.6);
  c = blob(c, p, vec2(W * 0.85, 120.0) + o3, 300.0, cGold, 0.07);
  c = blob(c, p, uGlowPos / uSize.y * 1920.0, 760.0, cAmber, uGlow * 0.85);
  c = blob(c, p, uGlowPos / uSize.y * 1920.0, 300.0, cGold, uGlow * 0.35);
  c *= 0.92 + uLift * 0.12;
  c += (hash(floor(vPx)) - 0.5) * 0.025;
  gl_FragColor = vec4(c * uOpacity, uOpacity);
}`;

const VS_FS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FS_DOWN = /* glsl */ `uniform sampler2D t; uniform vec2 hp; varying vec2 vUv;
void main(){ vec4 s = texture2D(t, vUv) * 4.0; s += texture2D(t, vUv - hp); s += texture2D(t, vUv + hp); s += texture2D(t, vUv + vec2(hp.x, -hp.y)); s += texture2D(t, vUv - vec2(hp.x, -hp.y)); gl_FragColor = s / 8.0; }`;
const FS_UP = /* glsl */ `uniform sampler2D t; uniform vec2 hp; varying vec2 vUv;
void main(){ vec4 s = texture2D(t, vUv + vec2(-hp.x * 2.0, 0.0)); s += texture2D(t, vUv + vec2(-hp.x, hp.y)) * 2.0; s += texture2D(t, vUv + vec2(0.0, hp.y * 2.0));
 s += texture2D(t, vUv + vec2(hp.x, hp.y)) * 2.0; s += texture2D(t, vUv + vec2(hp.x * 2.0, 0.0)); s += texture2D(t, vUv + vec2(hp.x, -hp.y)) * 2.0;
 s += texture2D(t, vUv + vec2(0.0, -hp.y * 2.0)); s += texture2D(t, vUv + vec2(-hp.x, -hp.y)) * 2.0; gl_FragColor = s / 12.0; }`;
const FS_COPY = /* glsl */ `uniform sampler2D t; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(t, vUv) * w; }`;
// Salida: acumulación → 8 bits con dither triangular determinista (evita banding en los degradés desenfocados).
const FS_OUT = /* glsl */ `uniform sampler2D t; uniform float uSeed; uniform float uDither; varying vec2 vUv;
float h(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main(){ vec3 c = texture2D(t, vUv).rgb; vec2 p = gl_FragCoord.xy + uSeed;
 float n = (h(p) + h(p + 17.31) - 1.0) * uDither / 255.0; gl_FragColor = vec4(clamp(c + n, 0.0, 1.0), 1.0); }`;

// ───────────────────────────── tipos ─────────────────────────────
export type TexRef = THREE.Texture;

export interface SpriteOpts {
  tex?: TexRef | null; tex2?: TexRef | null; mix?: number;
  color?: readonly [number, number, number]; alpha?: number;
  x: number; y: number; w: number; h: number; // centro y tamaño en px
  rot?: number; opacity?: number; blur?: number; dir?: readonly [number, number];
  radius?: number; feather?: number; tint?: boolean; flip?: boolean; uvRect?: readonly [number, number, number, number]; rim?: number;
  z?: number; rotX?: number; // sólo escena 3D
}
export interface GlassOpts {
  x: number; y: number; w: number; h: number; radius: number; kind: 'dark' | 'light';
  opacity?: number; amber?: number; shadow?: boolean;
}

function mat(fs: string, uniforms: Record<string, THREE.IUniform>, blend = true): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VS_QUAD, fragmentShader: fs, uniforms, transparent: true, depthTest: false, depthWrite: false,
    side: THREE.DoubleSide,
    blending: blend ? THREE.CustomBlending : THREE.NoBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
}

const WHITE = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
WHITE.needsUpdate = true;

/** Pila de quads reutilizables: una pasada = una escena con N mallas (sin crear objetos por cuadro). */
class QuadPool {
  scene = new THREE.Scene();
  private sprites: THREE.Mesh[] = [];
  private glasses: THREE.Mesh[] = [];
  private shadows: THREE.Mesh[] = [];
  private ambients: THREE.Mesh[] = [];
  private ns = 0; private ng = 0; private nsh = 0; private na = 0;
  private geo = new THREE.PlaneGeometry(1, 1);
  begin() { this.scene.clear(); this.ns = this.ng = this.nsh = this.na = 0; }
  private take(list: THREE.Mesh[], idx: number, make: () => THREE.ShaderMaterial): THREE.Mesh {
    let m = list[idx];
    if (!m) { m = new THREE.Mesh(this.geo, make()); m.frustumCulled = false; list[idx] = m; }
    m.renderOrder = this.scene.children.length;
    this.scene.add(m);
    return m;
  }
  sprite(): THREE.Mesh {
    return this.take(this.sprites, this.ns++, () => mat(FS_SPRITE, {
      uTex: { value: WHITE }, uTex2: { value: WHITE }, uHasTex: { value: 0 }, uMix: { value: 0 }, uColor: { value: new THREE.Vector4() },
      uOpacity: { value: 1 }, uSize: { value: new THREE.Vector2() }, uRadius: { value: 0 }, uBlur: { value: 0 }, uDir: { value: new THREE.Vector2() },
      uFlip: { value: 0 }, uUvRect: { value: new THREE.Vector4(0, 0, 1, 1) }, uTintMode: { value: 0 }, uRim: { value: 0 }, uFeather: { value: 1 },
    }));
  }
  glass(): THREE.Mesh {
    return this.take(this.glasses, this.ng++, () => mat(FS_GLASS, {
      uBack: { value: WHITE }, uTarget: { value: new THREE.Vector2() }, uSize: { value: new THREE.Vector2() }, uRadius: { value: 0 },
      uTint: { value: new THREE.Vector4() }, uDarken: { value: 1 }, uSat: { value: 1 }, uOpacity: { value: 1 }, uRefr: { value: G.refraction },
      uSpec: { value: G.specular }, uAmber: { value: new THREE.Vector3(0.95, 0.55, 0.12) }, uAmberA: { value: 0 },
    }));
  }
  shadow(): THREE.Mesh {
    return this.take(this.shadows, this.nsh++, () => mat(FS_SHADOW, {
      uSize: { value: new THREE.Vector2() }, uInner: { value: new THREE.Vector2() }, uRadius: { value: 0 }, uSigma: { value: 10 }, uAlpha: { value: 0.3 },
    }));
  }
  ambient(): THREE.Mesh {
    return this.take(this.ambients, this.na++, () => mat(FS_AMBIENT, {
      uT: { value: 0 }, uSize: { value: new THREE.Vector2() }, uGlow: { value: 0 }, uGlowPos: { value: new THREE.Vector2() }, uLift: { value: 0 }, uOpacity: { value: 1 },
      cEsp: { value: new THREE.Vector3() }, cRust: { value: new THREE.Vector3() }, cAmber: { value: new THREE.Vector3() }, cGold: { value: new THREE.Vector3() }, uTravel: { value: 40 },
    }));
  }
}

export interface AmbientOpts { x: number; y: number; w: number; h: number; t: number; glow: number; glowX: number; glowY: number; lift: number; opacity: number; z?: number; travel: number; palette: { esp: readonly number[]; rust: readonly number[]; amber: readonly number[]; gold: readonly number[] } }

export class Layer {
  pool = new QuadPool();
  constructor(public w: number, public h: number) {}
  begin() { this.pool.begin(); }
  private place(m: THREE.Mesh, o: { x: number; y: number; w: number; h: number; rot?: number; z?: number; rotX?: number }) {
    m.position.set(o.x, o.y, o.z ?? 0);
    m.scale.set(o.w, o.h, 1);
    m.rotation.set(o.rotX ?? 0, 0, o.rot ?? 0);
  }
  sprite(o: SpriteOpts) {
    if ((o.opacity ?? 1) <= 0.002 || o.w <= 0 || o.h <= 0) return;
    const m = this.pool.sprite(); const u = (m.material as THREE.ShaderMaterial).uniforms;
    this.place(m, o);
    u.uTex.value = o.tex ?? WHITE; u.uHasTex.value = o.tex ? 1 : 0;
    u.uTex2.value = o.tex2 ?? WHITE; u.uMix.value = o.tex2 ? (o.mix ?? 0) : 0;
    const c = o.color ?? [1, 1, 1];
    u.uColor.value.set(c[0], c[1], c[2], o.alpha ?? 1);
    u.uOpacity.value = o.opacity ?? 1; u.uSize.value.set(o.w, o.h); u.uRadius.value = o.radius ?? 0;
    u.uBlur.value = o.blur ?? 0; u.uDir.value.set(o.dir?.[0] ?? 0, o.dir?.[1] ?? 0);
    u.uFlip.value = o.flip ? 1 : 0; const r = o.uvRect ?? [0, 0, 1, 1]; u.uUvRect.value.set(r[0], r[1], r[2], r[3]);
    u.uTintMode.value = o.tint ? 1 : 0; u.uRim.value = o.rim ?? 0; u.uFeather.value = o.feather ?? 1;
  }
  shadow(x: number, y: number, w: number, h: number, radius: number, dy: number, sigma: number, alpha: number, z = 0) {
    if (alpha <= 0.002) return;
    const m = this.pool.shadow(); const u = (m.material as THREE.ShaderMaterial).uniforms;
    const pad = sigma * 2.6;
    this.place(m, { x, y: y + dy, w: w + pad * 2, h: h + pad * 2, z });
    u.uSize.value.set(w + pad * 2, h + pad * 2); u.uInner.value.set(w, h); u.uRadius.value = radius; u.uSigma.value = sigma; u.uAlpha.value = alpha;
  }
  glass(o: GlassOpts, back: TexRef, target: { w: number; h: number }) {
    const op = o.opacity ?? 1; if (op <= 0.002) return;
    if (o.shadow !== false && o.radius > 0 && o.w < 1000) {
      this.shadow(o.x, o.y, o.w, o.h, o.radius, G.shadow.dy, G.shadow.blur / 2, G.shadow.alpha * op);
      this.shadow(o.x, o.y, o.w, o.h, o.radius, G.contact.dy, G.contact.blur / 2, G.contact.alpha * op);
    }
    const m = this.pool.glass(); const u = (m.material as THREE.ShaderMaterial).uniforms;
    this.place(m, o);
    const k = o.kind === 'dark' ? G.dark : G.light;
    u.uBack.value = back; u.uTarget.value.set(target.w, target.h); u.uSize.value.set(o.w, o.h); u.uRadius.value = Math.min(o.radius, Math.min(o.w, o.h) / 2);
    u.uTint.value.set(k.tint[0], k.tint[1], k.tint[2], k.tint[3]); u.uDarken.value = k.darken; u.uOpacity.value = op; u.uSat.value = 1; u.uAmberA.value = o.amber ?? 0;
  }
  ambient(o: AmbientOpts) {
    if (o.opacity <= 0.002) return;
    const m = this.pool.ambient(); const u = (m.material as THREE.ShaderMaterial).uniforms;
    this.place(m, o);
    u.uT.value = o.t; u.uSize.value.set(o.w, o.h); u.uGlow.value = o.glow; u.uGlowPos.value.set(o.glowX, o.glowY); u.uLift.value = o.lift; u.uOpacity.value = o.opacity; u.uTravel.value = o.travel;
    const p = o.palette;
    u.cEsp.value.set(p.esp[0], p.esp[1], p.esp[2]); u.cRust.value.set(p.rust[0], p.rust[1], p.rust[2]);
    u.cAmber.value.set(p.amber[0], p.amber[1], p.amber[2]); u.cGold.value.set(p.gold[0], p.gold[1], p.gold[2]);
  }
}

// ───────────────────────────── renderer ─────────────────────────────
function rt(w: number, h: number, type: THREE.TextureDataType = THREE.UnsignedByteType): THREE.WebGLRenderTarget {
  const r = new THREE.WebGLRenderTarget(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), {
    type, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
  });
  r.texture.colorSpace = THREE.NoColorSpace;
  return r;
}

export class Blur {
  levels: THREE.WebGLRenderTarget[] = [];
  out: THREE.WebGLRenderTarget;
  constructor(w: number, h: number) {
    for (let i = 1; i <= 4; i++) this.levels.push(rt(w / 2 ** i, h / 2 ** i));
    this.out = rt(w / 4, h / 4);
  }
}

export class Gfx {
  r: THREE.WebGLRenderer;
  private fsScene = new THREE.Scene();
  private fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private fsMesh: THREE.Mesh;
  private mDown = new THREE.ShaderMaterial({ vertexShader: VS_FS, fragmentShader: FS_DOWN, uniforms: { t: { value: null }, hp: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false });
  private mUp = new THREE.ShaderMaterial({ vertexShader: VS_FS, fragmentShader: FS_UP, uniforms: { t: { value: null }, hp: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false });
  private mAdd = new THREE.ShaderMaterial({ vertexShader: VS_FS, fragmentShader: FS_COPY, uniforms: { t: { value: null }, w: { value: 1 } }, depthTest: false, depthWrite: false, transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
  private mOut = new THREE.ShaderMaterial({ vertexShader: VS_FS, fragmentShader: FS_OUT, uniforms: { t: { value: null }, uSeed: { value: 0 }, uDither: { value: 1 } }, depthTest: false, depthWrite: false });
  orthoStage: THREE.OrthographicCamera;
  persp: THREE.PerspectiveCamera;
  acc: THREE.WebGLRenderTarget;
  out: THREE.WebGLRenderTarget;

  constructor(canvas: HTMLCanvasElement) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.r.setPixelRatio(1);
    this.r.setSize(stage.w, stage.h, false);
    this.r.autoClear = false;
    this.r.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.fsMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mDown);
    this.fsMesh.frustumCulled = false;
    this.fsScene.add(this.fsMesh);
    this.orthoStage = new THREE.OrthographicCamera(0, stage.w, 0, stage.h, -5000, 5000);
    const D = stage.camDist;
    this.persp = new THREE.PerspectiveCamera((2 * Math.atan(stage.h / 2 / D) * 180) / Math.PI, stage.w / stage.h, 10, 20000);
    this.persp.up.set(0, -1, 0);
    this.acc = rt(stage.w, stage.h, THREE.HalfFloatType);
    this.out = rt(stage.w, stage.h);
  }
  makeRT(w: number, h: number) { return rt(w, h); }
  orthoFor(w: number, h: number) { return new THREE.OrthographicCamera(0, w, 0, h, -5000, 5000); }

  /** Cámara 2.5D: (cx, cy) es el punto de z=0 en el centro de la imagen; dolly > 0 acerca. */
  setPersp(cx: number, cy: number, dolly = 0) {
    const D = stage.camDist - dolly;
    this.persp.position.set(cx, cy, -D);
    this.persp.lookAt(cx, cy, 0);
    this.persp.updateMatrixWorld();
  }

  clear(target: THREE.WebGLRenderTarget | null, rgb: readonly number[] = [0, 0, 0], a = 1) {
    this.r.setRenderTarget(target);
    this.r.setClearColor(new THREE.Color(rgb[0], rgb[1], rgb[2]), a);
    this.r.clear(true, false, false);
  }
  draw(layer: Layer, cam: THREE.Camera, target: THREE.WebGLRenderTarget | null) {
    this.r.setRenderTarget(target);
    this.r.render(layer.pool.scene, cam);
  }
  private fs(m: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.fsMesh.material = m;
    this.r.setRenderTarget(target);
    this.r.render(this.fsScene, this.fsCam);
  }
  /** Blur dual-Kawase: completo → 1/2 → 1/4 → 1/8 → 1/16 → 1/8 → 1/4 (≈ 30–40 px efectivos). */
  blur(src: THREE.Texture, b: Blur, srcW: number, srcH: number) {
    let tex = src, w = srcW, h = srcH;
    for (const L of b.levels) {
      this.mDown.uniforms.t.value = tex; this.mDown.uniforms.hp.value.set(0.5 / w, 0.5 / h);
      this.fs(this.mDown, L); tex = L.texture; w = L.width; h = L.height;
    }
    const ups = [b.levels[2], b.out];
    for (const L of ups) {
      this.mUp.uniforms.t.value = tex; this.mUp.uniforms.hp.value.set(0.5 / w, 0.5 / h);
      this.fs(this.mUp, L); tex = L.texture; w = L.width; h = L.height;
    }
  }
  accumulate(src: THREE.Texture, weight: number, first: boolean) {
    if (first) this.clear(this.acc, [0, 0, 0], 0);
    this.mAdd.uniforms.t.value = src; this.mAdd.uniforms.w.value = weight;
    this.fs(this.mAdd, this.acc);
  }
  /** Salida con dither: desde el acumulador (varios subcuadros) o directo desde el cuadro (1 subcuadro). */
  resolve(seed: number, dither: number, src: THREE.Texture | null = null, toCanvas = true) {
    this.mOut.uniforms.t.value = src ?? this.acc.texture; this.mOut.uniforms.uSeed.value = seed; this.mOut.uniforms.uDither.value = dither;
    this.fs(this.mOut, this.out);
    if (toCanvas) this.fs(this.mOut, null); // sólo en la vista previa: en captura no se compone el canvas
  }
  /** Lectura cruda RGBA de la salida (filas de abajo hacia arriba; ffmpeg aplica vflip). */
  read(buf: Uint8Array) {
    this.r.readRenderTargetPixels(this.out, 0, 0, stage.w, stage.h, buf);
  }
}

export function canvasTexture(c: HTMLCanvasElement | OffscreenCanvas, mip = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c as HTMLCanvasElement);
  t.colorSpace = THREE.NoColorSpace;
  t.flipY = false;
  t.premultiplyAlpha = true;
  t.generateMipmaps = mip;
  t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  return t;
}
