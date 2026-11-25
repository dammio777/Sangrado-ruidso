import { CONFIG } from '../data.js';

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/* Colombia no tiene horario de verano: America/Bogota = UTC−5 todo el año. */
export function bogota(d = new Date()) {
  const b = new Date(d.getTime() - 5 * 3600e3);
  const y = b.getUTCFullYear(), m = b.getUTCMonth(), dd = b.getUTCDate();
  return { y, m, d: dd, dow: b.getUTCDay(), min: b.getUTCHours() * 60 + b.getUTCMinutes(), iso: iso(y, m, dd), date: b };
}
const pad = (n) => String(n).padStart(2, '0');
export const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const aMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };

export function esFestivo(isoFecha) { return CONFIG.festivos.fechas.includes(isoFecha); }
export function horarioDelDia(isoFecha, dow) {
  if (esFestivo(isoFecha) && CONFIG.festivos.abre) return CONFIG.festivos.horario;
  return CONFIG.horario[dow] || null;
}
export function horaBonita(h, corta = false) {
  let min = aMin(h) % 1440;
  const hh = Math.floor(min / 60), mm = min % 60;
  const suf = hh < 12 ? 'a. m.' : 'p. m.';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return corta && mm === 0 ? `${h12} ${suf}` : `${h12}:${pad(mm)} ${suf}`;
}
export function diaDesde(base, offset) {
  const t = new Date(Date.UTC(base.y, base.m, base.d + offset));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), dow: t.getUTCDay(), iso: iso(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) };
}
export function fechaBonita(dia) { return `${DIAS[dia.dow]} ${dia.d} de ${MESES[dia.m]}`; }

/* Estado en vivo: abierto / abre más tarde hoy / cerrado (con la próxima apertura). */
export function estado(ahora = bogota()) {
  // ¿Sigue abierto por un horario de ayer que pasa la medianoche?
  const ayer = diaDesde(ahora, -1);
  const hAyer = horarioDelDia(ayer.iso, ayer.dow);
  if (hAyer && aMin(hAyer.cierra) <= aMin(hAyer.abre) && ahora.min < aMin(hAyer.cierra)) {
    return { abierto: true, cierra: hAyer.cierra };
  }
  const hoy = horarioDelDia(ahora.iso, ahora.dow);
  if (hoy) {
    const a = aMin(hoy.abre), c = aMin(hoy.cierra) <= a ? aMin(hoy.cierra) + 1440 : aMin(hoy.cierra);
    if (ahora.min >= a && ahora.min < c) return { abierto: true, cierra: hoy.cierra };
    if (ahora.min < a) return { abierto: false, hoyMasTarde: true, abre: hoy.abre, dia: { ...ahora }, offset: 0 };
  }
  for (let i = 1; i <= 14; i++) {
    const dia = diaDesde(ahora, i);
    const h = horarioDelDia(dia.iso, dia.dow);
    if (h) return { abierto: false, abre: h.abre, dia, offset: i };
  }
  return { abierto: false };
}
export function cuandoAbre(e) {
  if (!e.dia) return '';
  if (e.offset === 0) return `hoy a las ${horaBonita(e.abre, true)}`;
  if (e.offset === 1) return `mañana a las ${horaBonita(e.abre, true)}`;
  return `el ${DIAS[e.dia.dow]} a las ${horaBonita(e.abre, true)}`;
}
export function textoEstado(e = estado()) {
  if (e.abierto) return { corto: 'Abierto', largo: `Abierto ahora · cierra a las ${horaBonita(e.cierra, true)}` };
  if (e.hoyMasTarde) return { corto: 'Cerrado', largo: `Cerrado · abrimos hoy a las ${horaBonita(e.abre, true)}` };
  return { corto: 'Cerrado', largo: `Cerrado · abrimos ${cuandoAbre(e)}` };
}
export function respuestaChat(e = estado()) {
  if (e.abierto) return `¡Sí! Hasta las ${horaBonita(e.cierra, true).replace(' a. m.', '').replace(' p. m.', '')} 🌙`;
  if (e.hoyMasTarde) return `Hoy desde las ${horaBonita(e.abre, true)} ✨`;
  const dia = e.offset === 1 ? 'mañana' : `el ${DIAS[e.dia?.dow ?? 4]}`;
  return `Abren ${dia} a las ${horaBonita(e.abre || '16:00', true).replace(' p. m.', '')}. Separemos mesa 😉`;
}

/* Tabla semanal (lunes → domingo) */
export function tablaSemana() {
  const orden = [1, 2, 3, 4, 5, 6, 0];
  return orden.map((dow) => ({ dow, nombre: DIAS[dow], h: CONFIG.horario[dow] }));
}

/* Días con reserva: próximos N días abiertos */
export function diasAbiertos(n = CONFIG.reservas.diasAdelante) {
  const hoy = bogota();
  const out = [];
  for (let i = 0; i < n; i++) {
    const dia = diaDesde(hoy, i);
    out.push({ ...dia, abierto: !!horarioDelDia(dia.iso, dia.dow), festivo: esFestivo(dia.iso) });
  }
  return out;
}
export function franjas(isoFecha) {
  const { desde, hasta, cadaMin } = CONFIG.reservas;
  const hoy = bogota();
  const out = [];
  for (let t = aMin(desde); t <= aMin(hasta); t += cadaMin) {
    if (isoFecha === hoy.iso && t <= hoy.min + 30) continue;
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out;
}
/* Franjas para domicilio programado (dentro del horario de ese día) */
export function franjasDomicilio(isoFecha, dow) {
  const h = horarioDelDia(isoFecha, dow);
  if (!h) return [];
  const hoy = bogota();
  const out = [];
  const fin = aMin(h.cierra) <= aMin(h.abre) ? aMin(h.cierra) + 1440 : aMin(h.cierra);
  for (let t = aMin(h.abre); t <= fin - 60; t += 30) {
    if (isoFecha === hoy.iso && t <= hoy.min + 45) continue;
    out.push(`${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`);
  }
  return out;
}
