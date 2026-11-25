import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter-tight/latin-600.css';
import '@fontsource/inter-tight/latin-700.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import './styles.css';
import App from './App.jsx';
import { iniciarScroll } from './lib/scroll.js';
import { acciones, guardado, uiAcc } from './lib/store.js';
import { decodificarMesa } from './lib/util.js';
import { armarCustom } from './lib/desgranado.js';

// Paleta: ?paleta=a|b|c (o la última elegida en el modo demo)
const q = new URLSearchParams(location.search);
const pal = q.get('paleta') || ((q.has('demo') || location.hash === '#demo') && guardado.get('ev-paleta'));
if (pal && ['a', 'b', 'c'].includes(pal)) document.documentElement.dataset.paleta = pal;

// Mesa compartida por enlace (?mesa=): el amigo ve la misma mesa y agrega lo suyo.
const compartida = q.get('mesa');
if (compartida) {
  const m = decodificarMesa(compartida, armarCustom);
  if (m) {
    acciones.cargar(m);
    setTimeout(() => uiAcc.toast('Abriste la mesa que te compartieron. Agrega lo tuyo 🍃'), 2600);
  }
  q.delete('mesa');
  try { history.replaceState(null, '', location.pathname + (q.toString() ? `?${q}` : '') + location.hash); } catch { /* sin historial */ }
}

iniciarScroll();
createRoot(document.getElementById('root')).render(<App />);
