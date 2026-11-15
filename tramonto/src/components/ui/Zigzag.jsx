import { zigzagUri } from '../../lib/geometry.js';

const HEX = {
  naranja: '#EB7126', mandarina: '#F8A85B', durazno: '#FFDDB8', crema: '#FFF8EE', rojo: '#E6401C',
  ladrillo: '#8A2F0C', dorado: '#F6B547', espresso: '#2A1410', cacao: '#3B1D17', terracota: '#C24E35',
};
const c = (k) => HEX[k] || k;

/**
 * Borde en zigzag en el filo superior de una sección: los dientes son del color de la
 * sección (muerden la anterior) y una línea en zigzag (rojo por defecto) los acompaña.
 */
export function ZigzagEdge({ color = 'naranja', line = 'rojo', position = 'top' }) {
  const isTop = position === 'top';
  return (
    <>
      <div aria-hidden="true" className="zz-edge"
        style={{ backgroundImage: zigzagUri({ fill: c(color), flip: !isTop }), ...(isTop ? {} : { top: 'auto', bottom: -13 }) }} />
      {line && (
        <div aria-hidden="true" className="zz-line"
          style={{ backgroundImage: zigzagUri({ stroke: c(line), flip: !isTop }), ...(isTop ? { top: -20 } : { bottom: -20 }) }} />
      )}
    </>
  );
}

/** Tira en zigzag independiente (bandas, separadores). */
export function ZigzagStrip({ color = 'rojo', className = '', flip = false, height = 14 }) {
  return (
    <div aria-hidden="true" className={className}
      style={{ height, backgroundImage: zigzagUri({ stroke: c(color), flip }), backgroundRepeat: 'repeat-x', backgroundSize: `${(24 * height) / 14}px ${height}px` }} />
  );
}
