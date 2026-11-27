import { CONFIG, FOTOS, PORCIONES } from '../data.js';
import { nombreLinea, precioLinea, totales, nombrePersona, unidades } from './store.js';
import INLINE from '@fotos-inline';

export const dinero = (n) => '$' + Math.round(n || 0).toLocaleString('es-CO');
export const porcion = (p) => PORCIONES[p] || p;
export const BASE = import.meta.env.BASE_URL || './';

export function fotoSrc(key, prefer) {
  const f = FOTOS[key];
  if (!f || !f.src) return null;
  if (INLINE[key]) return INLINE[key];
  const ws = f.widths || [f.w];
  const w = prefer ? ws.find((x) => x >= prefer) || ws[ws.length - 1] : ws[ws.length - 1];
  return `${BASE}${f.src}-${w}.webp`;
}
export function fotoSet(key) {
  const f = FOTOS[key];
  if (!f || !f.src || INLINE[key]) return null;
  return (f.widths || [f.w]).map((w) => `${BASE}${f.src}-${w}.webp ${w}w`).join(', ');
}

export function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
export function rng(seed) {
  let a = typeof seed === 'string' ? parseInt(hashStr(seed), 36) : seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ---------- entorno ---------- */
export const enIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
export const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esTactil = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
export function urlBase() {
  if (enIframe) return CONFIG.urlSitio;
  return location.origin + location.pathname;
}

/* ---------- WhatsApp y compartir ---------- */
export const waLink = (texto, numero) => `https://wa.me/${numero || ''}?text=${encodeURIComponent(texto)}`;
export const waEntreverde = (texto) => waLink(texto, CONFIG.whatsapp);
/* Usa la hoja nativa de compartir en el celular (si existe y no estamos en un iframe). */
export function onCompartir(e, texto, url) {
  if (typeof navigator !== 'undefined' && navigator.share && !enIframe && esTactil()) {
    e.preventDefault();
    navigator.share({ text: texto, url }).catch(() => {});
  }
}
export async function copiar(texto, el) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    return false;
  }
}

/* ---------- Mesa en la URL (?mesa=) ---------- */
function b64e(str) { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64d(s) { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); }
export function codificarMesa(m) {
  const o = { p: m.personas, n: m.nombres, l: m.lineas.map((l) => (l.custom ? [l.id, l.qty, l.nota || '', { n: l.custom.nombre, t: l.custom.tamano, s: l.custom.sel }] : [l.id, l.qty, l.nota || ''])) };
  return b64e(JSON.stringify(o));
}
export function decodificarMesa(s, armarCustom) {
  try {
    const o = JSON.parse(b64d(s));
    return {
      personas: o.p, nombres: o.n || [],
      lineas: (o.l || []).map(([id, qty, nota, c]) => {
        if (c) { const custom = armarCustom(c.n, c.t, c.s); return { key: `c-${custom.hash}`, id, qty, nota, custom }; }
        return { key: nota ? `${id}~${nota}` : id, id, qty, nota };
      }),
    };
  } catch { return null; }
}
export const enlaceMesa = (m) => `${urlBase()}?mesa=${codificarMesa(m)}`;

/* ---------- Mensajes ---------- */
export function mensajeParche(m) {
  const t = totales(m);
  const items = m.lineas.map((l) => `${nombreLinea(l)} x${l.qty}`).join(', ');
  return `🍃 Armé la mesa en Entreverde para ${m.personas}: ${items || 'todavía nada, ayúdenme a escoger'}. Total ${dinero(t.total)} → ${dinero(t.porPersona)} c/u. ¿Se apuntan? ${enlaceMesa(m)}`;
}
export function mensajeInvitar() {
  return `Oye, ¡Entreverde volvió! 🍃 Reabrió en Santa Elena después de un año, con nueva imagen. Tragos y comida que se comparten. ¿Vamos? ${urlBase()}`;
}
export function mensajeReapertura() {
  return `¡Volvió Entreverde! 🍃 Después de un año reabrió en Santa Elena, de camino al parque, con nueva imagen y desgranados que uno mismo arma. Jueves a domingo, 4 p. m. a medianoche. ¿Armamos el parche? ${urlBase()}`;
}
export function detalleCustom(c) {
  return c.lista.map((g) => `${g.paso}: ${g.items.join(', ')}`).join(' · ');
}
export function mensajePedido({ numero, modo, m, datos, zona, cuando, costoDom }) {
  const t = totales(m, costoDom);
  const titulo = { domicilio: 'DOMICILIO', reservar: 'RESERVA', recoger: 'PARA RECOGER' }[modo];
  const L = [`¡Hola Entreverde! 🍃 Pedido ${numero} · ${titulo}`];
  if (m.lineas.length && (modo !== 'reservar' || datos.dejarPedido)) {
    m.lineas.forEach((l) => {
      L.push(`• ${l.qty} × ${nombreLinea(l)} — ${dinero(precioLinea(l) * l.qty)}${l.nota ? ` (${l.nota})` : ''}`);
      if (l.custom) L.push(`   ${detalleCustom(l.custom)}`);
    });
    L.push(modo === 'domicilio' ? `Subtotal: ${dinero(t.subtotal)} · Domicilio (${zona?.nombre}): ${dinero(costoDom)} · Total: ${dinero(t.total)}` : `Total: ${dinero(t.subtotal)}`);
    if (m.personas > 1) L.push(`Por persona: ${dinero(t.porPersona)} (${m.personas} personas)`);
  }
  L.push(`Nombre: ${datos.nombre} · Cel: ${datos.cel}`);
  if (modo === 'domicilio') {
    L.push(`Dirección: ${datos.direccion}${datos.referencia ? ` (Ref.: ${datos.referencia})` : ''}`);
    L.push(`Pago: ${datos.pago}${datos.pago === 'Efectivo' && datos.conCuanto ? `, pago con ${dinero(datos.conCuanto)}` : ''}`);
    L.push(`Cuándo: ${cuando}`);
  }
  if (modo === 'recoger') { L.push(`Recojo: ${cuando}`); L.push(`Pago: ${datos.pago}`); }
  if (modo === 'reservar') {
    L.push(`Mesa para ${m.personas} · ${cuando}`);
    L.push(`Zona: ${datos.zonaLugar} · Ocasión: ${datos.ocasion}`);
    if (datos.dejarPedido && m.lineas.length) L.push('Dejamos la comida pedida 🙌');
  }
  if (datos.notas) L.push(`Notas: ${datos.notas}`);
  return L.join('\n');
}
export function cuentaCadaUno(m) {
  const us = unidades(m);
  const por = Array.from({ length: m.personas }, () => 0);
  let sinAsignar = 0;
  us.forEach((u) => {
    const p = m.asig[u.uid];
    const v = precioLinea(u.linea);
    if (p != null && p < m.personas) por[p] += v; else sinAsignar += v;
  });
  const parte = sinAsignar / Math.max(1, m.personas);
  return por.map((v, i) => ({ nombre: nombrePersona(m, i), total: Math.ceil((v + parte) / 100) * 100, propio: v })).concat([]).map((x) => x);
}
export const numeroPedido = () => `EV-${Math.floor(1000 + Math.random() * 9000)}`;
