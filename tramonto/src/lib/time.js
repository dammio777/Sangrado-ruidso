import { schedule, holidays } from '../data/site.js';

const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));
export const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const pad = (n) => String(n).padStart(2, '0');
export const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** "Ahora" en Bogotá: { y, m, d, date: 'YYYY-MM-DD', weekday, minutes } */
export function bogotaNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: schedule.timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const y = +parts.year, m = +parts.month, d = +parts.day;
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, date: ymd(y, m, d), weekday, minutes: (+parts.hour % 24) * 60 + +parts.minute };
}

export const holidayName = (date) => holidayMap.get(date) || null;

/** Horario de un día concreto (o null si está cerrado). */
export function hoursFor(date, weekday) {
  if (holidayMap.has(date)) return { ...schedule.holiday, holiday: holidayMap.get(date) };
  return schedule.days[weekday] || null;
}

export function weekdayOf(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date, n) {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function formatDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return `${DAY_NAMES[weekdayOf(date)]} ${d} de ${MONTHS[m - 1]}`;
}

/** Estado en vivo: { open, label, detail } */
export function openStatus(now = new Date()) {
  const t = bogotaNow(now);
  const today = hoursFor(t.date, t.weekday);
  if (today && t.minutes >= toMin(today.open) && t.minutes < toMin(today.close)) {
    return { open: true, detail: `Cerramos a las ${today.close}${today.holiday ? ' · hoy es festivo' : ''}` };
  }
  // próxima apertura
  for (let i = 0; i < 14; i++) {
    const date = addDays(t.date, i);
    const h = hoursFor(date, weekdayOf(date));
    if (!h) continue;
    if (i === 0 && t.minutes >= toMin(h.open)) continue;
    const when = i === 0 ? 'hoy' : i === 1 ? 'mañana' : `el ${DAY_NAMES[weekdayOf(date)]}`;
    return { open: false, detail: `Abrimos ${when} a las ${h.open}${h.holiday ? ` (festivo)` : ''}` };
  }
  return { open: false, detail: 'Escríbenos por WhatsApp' };
}

/** ¿Se puede reservar ese día? (jueves a domingo o festivo, y no en el pasado) */
export function isBookable(date) {
  const t = bogotaNow();
  if (date < t.date) return false;
  const h = hoursFor(date, weekdayOf(date));
  if (!h) return false;
  if (date === t.date && t.minutes > toMin(h.close) - 60) return false;
  return true;
}

/** Franjas cada 30 min, hasta una hora antes del cierre. */
export function slotsFor(date) {
  const h = hoursFor(date, weekdayOf(date));
  if (!h) return [];
  const t = bogotaNow();
  const out = [];
  for (let m = toMin(h.open); m <= toMin(h.close) - 60; m += 30) {
    if (date === t.date && m <= t.minutes + 30) continue;
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}
