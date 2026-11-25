import { DESGRANADO } from '../data.js';
import { hashStr } from './util.js';

export const ING = {};
DESGRANADO.pasos.forEach((p) => p.items.forEach((it) => (ING[it.id] = { ...it, paso: p.id })));

export const vacio = () => Object.fromEntries(DESGRANADO.pasos.map((p) => [p.id, []]));

export function faltantes(sel) {
  return DESGRANADO.pasos.filter((p) => (sel[p.id] || []).length < p.min).map((p) => p.nombre.toLowerCase());
}
export function ingsOrdenados(sel) {
  // orden de capas: proteína, vegetales, quesos, salsa, extras (la papa cabuya va encima)
  const orden = ['proteina', 'vegetales', 'quesos', 'salsas', 'extras'];
  return orden.flatMap((p) => (sel[p] || []).map((id) => ING[id]).filter(Boolean));
}
export function armarCustom(nombre, tamanoId, sel) {
  const tam = DESGRANADO.tamanos.find((t) => t.id === tamanoId) || DESGRANADO.tamanos[1];
  const lista = DESGRANADO.pasos.map((p) => ({ paso: p.nombre, items: (sel[p.id] || []).map((id) => ING[id]?.nombre).filter(Boolean) })).filter((g) => g.items.length);
  const limpio = Object.fromEntries(Object.entries(sel).map(([k, v]) => [k, [...v]]));
  const hash = hashStr(`${nombre}|${tam.id}|${JSON.stringify(limpio)}`);
  return { nombre: nombre || 'Mi desgranado', tamano: tam.id, porcion: tam.porcion, precio: tam.precio, sel: limpio, lista, hash };
}
export function sorpresa() {
  const sel = vacio();
  const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  DESGRANADO.pasos.forEach((p) => {
    const n = p.max === 1 ? 1 : Math.max(p.min, Math.ceil(Math.random() * p.max));
    sel[p.id] = pick(p.items, n).map((i) => i.id);
  });
  return sel;
}
export const nombreAzar = (excepto) => {
  const ns = DESGRANADO.nombres.filter((n) => n !== excepto);
  return ns[Math.floor(Math.random() * ns.length)];
};
