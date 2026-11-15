import { SHOW_PENDING } from '../../data/site.js';

/** Etiqueta visible de contenido pendiente por confirmar con el dueño. */
export default function Pending({ children = 'PENDIENTE', dark = false, className = '' }) {
  if (!SHOW_PENDING) return null;
  return (
    <span className={`pending-tag ${dark ? 'dark' : ''} ${className}`}>
      <span aria-hidden="true">✎</span>
      <span>{children}</span>
    </span>
  );
}
