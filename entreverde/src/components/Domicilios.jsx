import { Foto, Ico, Ejemplo } from './ui.jsx';
import { CONFIG } from '../data.js';
import { uiAcc } from '../lib/store.js';
import { dinero, waEntreverde } from '../lib/util.js';
import { EstadoVivo } from './Navbar.jsx';

export default function Domicilios() {
  const min = Math.min(...CONFIG.domicilio.zonas.map((z) => z.costo));
  return (
    <section className="sec noche" data-noche aria-labelledby="dom-tit" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="dom-media">
          <Foto id="pendones-dia" sizes="(min-width: 1240px) 1240px, 100vw" />
          <div className="dom-card glass-dark">
            <span className="eyebrow">Domicilios</span>
            <h2 id="dom-tit" className="t-sub" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Entreverde llega hasta tu puerta.</h2>
            <p style={{ margin: 0, color: 'var(--c-salvia)' }}>Domicilios en todo Santa Elena. Pide para el parche y que llegue calientico.</p>
            <div className="zonas" aria-label="Zonas de cobertura">
              {CONFIG.domicilio.zonas.map((z) => <span key={z.id} className="chip">{z.nombre}</span>)}
              <Ejemplo>zonas por confirmar</Ejemplo>
            </div>
            <div className="dom-datos">
              <div><span className="t-sm" style={{ color: 'var(--c-salvia)' }}>Costo</span><b className="num">desde {dinero(min)}</b></div>
              <div><span className="t-sm" style={{ color: 'var(--c-salvia)' }}>Tiempo</span><b>{CONFIG.domicilio.tiempo}</b></div>
              <div><span className="t-sm" style={{ color: 'var(--c-salvia)' }}>Horario</span><b>Jue–Dom · 4 p. m.–12 a. m.</b></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <EstadoVivo corto={false} />
              <span className="t-sm" style={{ color: 'var(--c-salvia)' }}>· <span className="num" style={{ userSelect: 'all' }}>{CONFIG.telefonoVisible}</span></span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ambar" onClick={() => uiAcc.abrirPanel('domicilio')}><Ico.moto /> Pedir domicilio</button>
              <a className="btn btn-sec" href={waEntreverde('¡Hola Entreverde! 🍃 Quiero pedir un domicilio.')} target="_blank" rel="noopener"><Ico.wa /> Escribir por WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
