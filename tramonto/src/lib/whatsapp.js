import { business } from '../data/site.js';

/** Enlace de WhatsApp con mensaje prellenado. Sin número confirmado → wa.link. */
export function waHref(message = '') {
  const n = business.whatsapp.number.replace(/\D/g, '');
  if (n) return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  return business.whatsapp.shortLink;
}

export const hasWaNumber = () => Boolean(business.whatsapp.number.replace(/\D/g, ''));

/** onClick para <a href={waHref(msg)}>: si aún no hay número, copia el mensaje al portapapeles. */
export function waClick(message) {
  return () => {
    if (hasWaNumber() || !message) return;
    const toast = (detail) => window.dispatchEvent(new CustomEvent('toast', { detail }));
    const p = navigator.clipboard?.writeText(message);
    if (p) p.then(() => toast('Copiamos tu mensaje: pégalo en el chat de WhatsApp.')).catch(() => {});
  };
}

export function openWhatsApp(message) {
  waClick(message)();
  window.open(waHref(message), '_blank', 'noopener');
}

export const dishMessage = (dish) => `Buonasera Tramonto! Quiero pedir: ${dish}. ¿Me ayudan?`;
