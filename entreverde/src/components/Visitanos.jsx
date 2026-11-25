import { useEffect, useRef, useState } from 'react';
import { Foto, Ico, Ejemplo } from './ui.jsx';
import { CONFIG } from '../data.js';
import { bogota, horaBonita, tablaSemana, textoEstado, esFestivo } from '../lib/horario.js';
import { useEstado } from './Navbar.jsx';
import { enIframe } from '../lib/util.js';

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.direccion.mapsQuery)}`;
const EMBED = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.direccion.mapsQuery).replace(/%20/g, '+')}&output=embed`;
const UBER = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(CONFIG.direccion.mapsQuery)}`;
const SIN_IFRAME = import.meta.env.VITE_ARTIFACT === '1' || enIframe;

function MapaEstatico() {
  return (
    <div className="mapa-estatico" aria-hidden="true">
      <svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="460" fill="#1F2620" />
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${-40 + i * 80} 470 Q ${80 + i * 60} ${240 - i * 8} ${220 + i * 70} -10`} stroke="rgba(201,211,180,.06)" strokeWidth="38" fill="none" />)}
        <path d="M-20 400 C 120 380 160 300 250 280 S 380 220 420 170 S 520 90 640 70" stroke="#3A4636" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M-20 400 C 120 380 160 300 250 280 S 380 220 420 170 S 520 90 640 70" stroke="var(--c-ambar)" strokeWidth="3" strokeDasharray="2 10" fill="none" strokeLinecap="round" />
        <g fontFamily="var(--f-body)" fontSize="13" fill="#C9D3B4">
          <text x="24" y="430">← Medellín</text>
          <text x="470" y="58">Parque →</text>
          <text x="300" y="300">Vía a Santa Elena</text>
        </g>
        <g transform="translate(420 170)">
          <circle r="34" fill="rgba(242,182,90,.16)" />
          <circle r="22" fill="var(--c-oliva)" stroke="#F4F1E8" strokeWidth="3" />
          <text textAnchor="middle" dy=".36em" fill="#fff" fontFamily="var(--f-serif)" fontSize="24">è</text>
        </g>
      </svg>
    </div>
  );
}

export default function Visitanos() {
  const e = useEstado();
  const hoy = bogota();
  const t = textoEstado(e);
  const ref = useRef(null);
  const [cargar, setCargar] = useState(false);
  useEffect(() => {
    if (SIN_IFRAME) return;
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setCargar(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section id="visitanos" className="sec noche vis-sec" data-noche aria-labelledby="vis-tit">
      <div className="wrap vis-grid">
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <span className="eyebrow">Visítanos</span>
          <h2 id="vis-tit" className="t-heading" style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}>Te esperamos en Santa Elena, <span className="acento">de camino al parque.</span></h2>
          <div className="t-lead" style={{ color: 'var(--c-salvia)' }}>{CONFIG.direccion.linea} <Ejemplo>poner</Ejemplo><br />{CONFIG.direccion.zona}</div>
          <div className="horario glass-dark">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`punto ${e.abierto ? 'vivo' : 'cerrado'}`} aria-hidden="true" />
              <b>{t.largo}</b>
            </div>
            <table>
              <caption className="sr">Horario por día</caption>
              <tbody>
                {tablaSemana().map((d) => (
                  <tr key={d.dow} className={d.dow === hoy.dow ? 'hoy' : ''}>
                    <td style={{ textTransform: 'capitalize' }}>{d.nombre}{d.dow === hoy.dow && ' · hoy'}{d.dow === hoy.dow && esFestivo(hoy.iso) && ' (festivo)'}</td>
                    <td>{d.h ? `${horaBonita(d.h.abre, true)} – ${horaBonita(d.h.cierra, true)}` : 'Cerrado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <span className="t-sm" style={{ color: 'var(--c-salvia)' }}>Lunes festivos: abrimos de 4 p. m. a 12 a. m. <Ejemplo>confirmar</Ejemplo></span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn btn-ambar" href={MAPS} target="_blank" rel="noopener"><Ico.mapa /> Cómo llegar</a>
            <a className="btn btn-sec" href={UBER} target="_blank" rel="noopener"><Ico.auto /> Pedir un Uber</a>
          </div>
          <div className="entrada-foto">
            <Foto id="lugar-entrada" sizes="120px" />
            <div className="t-sm"><b>Así se ve la entrada.</b><br /><span style={{ color: 'var(--c-salvia)' }}>{CONFIG.direccion.referencia}</span></div>
          </div>
        </div>
        <div className="mapa" ref={ref}>
          {cargar && !SIN_IFRAME ? (
            <iframe title="Mapa de Entreverde en Santa Elena" src={EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : <MapaEstatico />}
          <div className="mapa-cta glass-dark">
            <span className="t-sm"><b>Entreverde</b> · Santa Elena, Medellín</span>
            <a className="btn btn-sm btn-ambar" href={MAPS} target="_blank" rel="noopener">Abrir en Google Maps</a>
          </div>
        </div>
      </div>
    </section>
  );
}
