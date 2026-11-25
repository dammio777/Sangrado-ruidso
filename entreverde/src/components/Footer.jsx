import { useRef } from 'react';
import { LogoCirculo, Ico } from './ui.jsx';
import { CONFIG } from '../data.js';
import { LINKS, EstadoVivo } from './Navbar.jsx';
import { irA } from '../lib/scroll.js';
import { useVisible } from '../lib/motion.js';
import { waEntreverde } from '../lib/util.js';

const LETRAS = 'entreverde'.split('');
export default function Footer() {
  const ref = useRef(null);
  const v = useVisible(ref, { threshold: 0.4, once: true });
  const mid = (LETRAS.length - 1) / 2;
  return (
    <footer className="noche foot" data-noche>
      <div className="wrap">
        <div className="foot-grid">
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LogoCirculo size={52} />
              <span className="wordmark" style={{ fontSize: 26 }}>entreverde</span>
            </div>
            <p style={{ margin: 0, color: 'var(--c-salvia)' }}>{CONFIG.marca.eslogan}</p>
            <EstadoVivo corto={false} />
          </div>
          <div>
            <h4>Explora</h4>
            <ul>{LINKS.map((l) => <li key={l.id}><a href={`#${l.id}`} onClick={(e) => { e.preventDefault(); irA(l.id); }}>{l.nombre}</a></li>)}</ul>
          </div>
          <div>
            <h4>Escríbenos</h4>
            <ul>
              <li><a href={waEntreverde('¡Hola Entreverde! 🍃')} target="_blank" rel="noopener"><Ico.wa style={{ verticalAlign: -3 }} /> {CONFIG.telefonoVisible}</a></li>
              <li><a href={CONFIG.marca.instagramUrl} target="_blank" rel="noopener"><Ico.insta style={{ verticalAlign: -3 }} /> {CONFIG.marca.instagram}</a></li>
            </ul>
          </div>
          <div>
            <h4>Dónde y cuándo</h4>
            <ul style={{ color: 'var(--c-salvia)' }}>
              <li>{CONFIG.direccion.linea}</li>
              <li>{CONFIG.direccion.zona}</li>
              <li>Jueves a domingo · 4 p. m. – 12 a. m.</li>
            </ul>
          </div>
        </div>
        <div ref={ref} className="foot-gigante" aria-hidden="true">
          {LETRAS.map((l, i) => <span key={i} style={{ transform: v ? 'none' : `translateX(${(mid - i) * 0.3}em)` }}>{l}</span>)}
        </div>
        <div className="foot-legal">
          <span>© 2026 Entreverde · Santa Elena, Medellín.</span>
          <span>Disfruta con moderación. Prohibida la venta de bebidas alcohólicas a menores de edad.</span>
        </div>
      </div>
    </footer>
  );
}
