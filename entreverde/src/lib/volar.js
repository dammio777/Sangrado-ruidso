import { uiAcc } from './store.js';
import { reducido } from './util.js';

function objetivo() {
  const nav = document.querySelector('[data-mesa-target="nav"]');
  const navOk = nav && !nav.closest('.nav')?.classList.contains('oculta') && nav.getBoundingClientRect().width > 0;
  return navOk ? nav : document.querySelector('[data-mesa-target="fab"]');
}

/* El plato "vuela" en arco (500 ms) hasta "Tu mesa", que hace un pulso. Solo transform/opacity. */
export function volar(desde, contenido) {
  const dest = objetivo();
  if (!desde || !dest || reducido()) { uiAcc.pulso(); return; }
  const a = desde.getBoundingClientRect();
  const b = dest.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'volador';
  if (typeof contenido === 'string') { const img = new Image(); img.src = contenido; img.alt = ''; el.appendChild(img); }
  else if (contenido) { const c = contenido.cloneNode(true); c.setAttribute('width', '64'); c.setAttribute('height', '64'); el.style.background = 'transparent'; el.appendChild(c); }
  document.body.appendChild(el);
  const x0 = a.left + a.width / 2 - 32, y0 = a.top + a.height / 2 - 32;
  const x1 = b.left + b.width / 2 - 32, y1 = b.top + b.height / 2 - 32;
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 140;
  const frames = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const s = 1 - 0.62 * t;
    frames.push({ transform: `translate(${x}px, ${y}px) scale(${s})`, opacity: t > 0.92 ? 0.3 : 1 });
  }
  el.style.willChange = 'transform';
  const anim = el.animate(frames, { duration: 520, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
  anim.onfinish = () => { el.remove(); uiAcc.pulso(); };
}
