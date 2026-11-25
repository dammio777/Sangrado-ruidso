import { useSyncExternalStore } from 'react';
import { CARTA, CONFIG, DESGRANADO } from '../data.js';

export function createStore(init) {
  let s = init;
  const ls = new Set();
  return {
    get: () => s,
    set: (fn) => {
      const n = typeof fn === 'function' ? fn(s) : fn;
      if (n === s) return;
      s = n;
      ls.forEach((l) => l());
    },
    sub: (l) => { ls.add(l); return () => ls.delete(l); },
  };
}
export function useStore(store, sel = (s) => s) {
  const get = () => sel(store.get());
  return useSyncExternalStore(store.sub, get, get);
}

/* ---------- almacenamiento seguro ---------- */
export const guardado = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

/* ---------- MESA (estado global único) ---------- */
const MESA_VACIA = { lineas: [], personas: 2, nombres: [], modo: 'iguales', asig: {} };
function sanear(m) {
  const base = { ...MESA_VACIA, ...(m || {}) };
  base.lineas = (base.lineas || []).filter((l) => l && (l.custom || CARTA.find((p) => p.id === l.id && p.precio)) && l.qty > 0);
  base.personas = Math.min(20, Math.max(1, Number(base.personas) || 2));
  base.nombres = (base.nombres || []).slice(0, 20).map(String);
  return base;
}
export const mesa = createStore(sanear(guardado.get('ev-mesa')));
mesa.sub(() => guardado.set('ev-mesa', mesa.get()));

export const plato = (id) => CARTA.find((p) => p.id === id);
export function precioLinea(l) { return l.custom ? l.custom.precio : (plato(l.id)?.precio || 0); }
export function nombreLinea(l) { return l.custom ? `Desgranado «${l.custom.nombre}»` : (plato(l.id)?.nombre || l.id); }
export function porcionLinea(l) { return l.custom ? l.custom.porcion : plato(l.id)?.porcion; }
export function fotoLinea(l) { return l.custom ? null : plato(l.id)?.foto; }

export const acciones = {
  agregar(id, qty = 1, nota = '', custom = null) {
    const key = custom ? `c-${custom.hash}` : nota ? `${id}~${nota}` : id;
    mesa.set((m) => {
      const i = m.lineas.findIndex((l) => l.key === key);
      const lineas = [...m.lineas];
      if (i >= 0) lineas[i] = { ...lineas[i], qty: Math.min(30, lineas[i].qty + qty) };
      else lineas.push({ key, id, qty, nota, custom });
      return { ...m, lineas };
    });
  },
  setQty(key, qty) {
    mesa.set((m) => ({ ...m, lineas: qty <= 0 ? m.lineas.filter((l) => l.key !== key) : m.lineas.map((l) => (l.key === key ? { ...l, qty: Math.min(30, qty) } : l)) }));
  },
  setNota(key, nota) { mesa.set((m) => ({ ...m, lineas: m.lineas.map((l) => (l.key === key ? { ...l, nota } : l)) })); },
  setPersonas(n) { mesa.set((m) => ({ ...m, personas: Math.min(20, Math.max(1, n)) })); },
  setNombres(nombres) { mesa.set((m) => ({ ...m, nombres, personas: Math.max(m.personas, nombres.length) })); },
  setModo(modo) { mesa.set((m) => ({ ...m, modo })); },
  asignar(unidad, persona) { mesa.set((m) => ({ ...m, asig: { ...m.asig, [unidad]: persona } })); },
  vaciar() { mesa.set((m) => ({ ...MESA_VACIA, personas: m.personas, nombres: m.nombres })); },
  cargar(obj) { mesa.set(() => sanear(obj)); },
};

export function unidades(m) {
  const out = [];
  m.lineas.forEach((l) => { for (let i = 0; i < l.qty; i++) out.push({ uid: `${l.key}#${i}`, linea: l }); });
  return out;
}
export function totales(m, costoDomicilio = 0) {
  const subtotal = m.lineas.reduce((s, l) => s + precioLinea(l) * l.qty, 0);
  const platos = m.lineas.reduce((s, l) => s + l.qty, 0);
  const total = subtotal + (subtotal > 0 ? costoDomicilio : 0);
  return { subtotal, platos, total, porPersona: Math.ceil(total / Math.max(1, m.personas) / 100) * 100 };
}
export function nombrePersona(m, i) { return m.nombres[i] || (i === 0 ? 'Tú' : `Amigo ${i + 1}`); }

/* Recomendación: platos "para 2–3" cubren 2.5 personas; 1 jarra por cada N personas. */
export function recomendacion(m) {
  const cubre = CONFIG.reglas.cubre;
  const p = m.personas;
  const compartirNecesarios = Math.max(1, Math.ceil(p / cubre['2-3']));
  const jarras = Math.max(1, Math.round(p / CONFIG.reglas.personasPorJarra) || 1);
  let cubierto = 0;
  m.lineas.forEach((l) => {
    const pr = porcionLinea(l);
    if (!l.custom && plato(l.id)?.cat === 'tragos') return;
    cubierto += (cubre[pr] || 1) * l.qty;
  });
  const falta = Math.max(0, p - cubierto);
  return {
    texto: `Para ${p} ${p === 1 ? 'persona' : 'personas'}: ${compartirNecesarios} para compartir + ${jarras} ${jarras === 1 ? 'jarra' : 'jarras'}`,
    falta,
    faltanPlatos: Math.ceil(falta / cubre['2-3']),
  };
}

/* ---------- UI global ---------- */
export const ui = createStore({
  panel: false,
  panelModo: 'domicilio',
  chat: 'oculto', // oculto | abierto | min | cerrado
  chatLugar: 'hero',
  apertura: 'corriendo',
  modales: 0,
  toast: null,
  pulso: 0,
  menu: false,
});
let opener = null;
export const uiAcc = {
  abrirPanel(modo) { opener = document.activeElement; ui.set((u) => ({ ...u, panel: true, panelModo: modo || u.panelModo, menu: false })); },
  cerrarPanel() { ui.set((u) => ({ ...u, panel: false })); setTimeout(() => opener?.focus?.(), 50); },
  modal(delta) { ui.set((u) => ({ ...u, modales: Math.max(0, u.modales + delta) })); },
  toast(texto) { ui.set((u) => ({ ...u, toast: { texto, id: Date.now() } })); },
  pulso() { ui.set((u) => ({ ...u, pulso: u.pulso + 1 })); },
  chat(estado, lugar) { ui.set((u) => ({ ...u, chat: estado, chatLugar: lugar || u.chatLugar })); },
};

export const DESG_TAMANOS = DESGRANADO.tamanos;
