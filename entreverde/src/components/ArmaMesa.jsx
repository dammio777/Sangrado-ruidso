import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Foto, Ico, Mono, Seg, Stepper } from './ui.jsx';
import { BaseMaiz, BowlBase, IngredienteArte } from './BowlArt.jsx';
import { FOTOS } from '../data.js';
import { acciones, fotoLinea, mesa, nombreLinea, nombrePersona, plato, porcionLinea, precioLinea, recomendacion, totales, uiAcc, unidades, useStore } from '../lib/store.js';
import { ingsOrdenados } from '../lib/desgranado.js';
import { cuentaCadaUno, dinero, fotoSrc, mensajeParche, onCompartir, porcion, waLink } from '../lib/util.js';
import { agregarPlato } from './Carta.jsx';
import { useReduced } from '../lib/motion.js';

const iniciales = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '·';
const SPR = { type: 'spring', stiffness: 260, damping: 26 };

export function FotoLinea({ l, size = 44 }) {
  if (l.custom) {
    return (
      <svg viewBox="0 0 400 400" width={size} height={size} aria-hidden="true">
        <BowlBase papel={false} id={`ln-${l.key}`}>
          <BaseMaiz densidad={0.5} />
          {ingsOrdenados(l.custom.sel).map((i) => <IngredienteArte key={i.id} ing={i} densidad={0.55} />)}
        </BowlBase>
      </svg>
    );
  }
  const f = fotoLinea(l);
  return FOTOS[f]?.src ? <Foto id={f} sizes={`${size}px`} /> : <Mono className="text-oliva" />;
}

function Mesa({ m }) {
  const reduced = useReduced();
  const C = 220;
  const n = m.personas;
  const Rs = 182;
  const rSilla = Math.min(27, (2 * Math.PI * Rs) / n / 2.25);
  const us = unidades(m).slice(0, 28);
  const N = us.length;
  const rDisco = N <= 1 ? 40 : Math.max(12, Math.min(30, 74 / Math.sqrt(N)));
  const c = N <= 1 ? 0 : Math.min(98, 96 / Math.sqrt(N)) * 1.05;
  return (
    <svg className="mesa-svg" viewBox="0 0 440 440" role="img" aria-label={`Mesa para ${n} ${n === 1 ? 'persona' : 'personas'} con ${m.lineas.reduce((s, l) => s + l.qty, 0)} platos`}>
      <defs>
        <clipPath id="disco" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5" /></clipPath>
        <radialGradient id="madera" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#EADFC6" /><stop offset="1" stopColor="#D8C8A6" /></radialGradient>
      </defs>
      {/* sillas */}
      <AnimatePresence>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = C + Math.cos(a) * Rs, y = C + Math.sin(a) * Rs;
        const nom = nombrePersona(m, i);
        return (
          <motion.g key={i} initial={reduced ? false : { opacity: 0, scale: 0.4, x: C, y: C }} animate={{ opacity: 1, scale: 1, x, y }} exit={{ opacity: 0, scale: 0.4 }} transition={SPR}>
            <circle r={rSilla} fill="var(--c-salvia)" />
            <circle r={rSilla * 0.72} fill="var(--c-oliva)" />
            <text textAnchor="middle" dy=".35em" fill="#fff" fontSize={Math.max(8, rSilla * 0.56)} fontWeight="700" fontFamily="var(--f-body)">{m.nombres[i] ? iniciales(nom) : i === 0 ? 'Tú' : i + 1}</text>
          </motion.g>
        );
      })}
      </AnimatePresence>
      {/* mesa */}
      <circle cx={C} cy={C + 6} r="140" fill="rgba(28,34,25,.08)" />
      <circle cx={C} cy={C} r="140" fill="url(#madera)" />
      {[118, 92, 64, 36].map((r) => <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="#C9B58C" strokeOpacity=".35" strokeWidth="1" />)}
      {N === 0 && (
        <text x={C} y={C} textAnchor="middle" fontFamily="var(--f-body)" fontSize="14" fill="var(--c-oliva-profundo)">
          <tspan x={C} dy="-.3em">La mesa está vacía.</tspan>
          <tspan x={C} dy="1.4em">Agrega platos de la carta.</tspan>
        </text>
      )}
      {/* platos en espiral */}
      <AnimatePresence>
        {us.map((u, k) => {
          const ang = k * 2.39996;
          const rr = N <= 1 ? 0 : c * Math.sqrt(k + 0.6);
          const x = C + Math.cos(ang) * rr, y = C + Math.sin(ang) * rr;
          const f = fotoLinea(u.linea);
          return (
            <motion.g key={u.uid} initial={reduced ? false : { opacity: 0, scale: 0.3, x, y: y - 40 }} animate={{ opacity: 1, scale: 1, x, y }} exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }} transition={SPR}>
              <circle r={rDisco + 3} fill="#FBF9F3" stroke="rgba(28,34,25,.12)" />
              {u.linea.custom ? (
                <svg x={-rDisco} y={-rDisco} width={rDisco * 2} height={rDisco * 2} viewBox="0 0 400 400">
                  <BowlBase papel={false} id={`m-${u.uid.replace(/[^a-z0-9]/gi, '')}`}>
                    <BaseMaiz densidad={0.4} />
                    {ingsOrdenados(u.linea.custom.sel).map((i) => <IngredienteArte key={i.id} ing={i} densidad={0.45} />)}
                  </BowlBase>
                </svg>
              ) : FOTOS[f]?.src ? (
                <image href={fotoSrc(f, 360)} x={-rDisco} y={-rDisco} width={rDisco * 2} height={rDisco * 2} clipPath="url(#disco)" preserveAspectRatio="xMidYMid slice" />
              ) : (
                <g><circle r={rDisco} fill="var(--c-oliva)" /><text textAnchor="middle" dy=".35em" fill="#fff" fontFamily="var(--f-serif)" fontSize={rDisco}>è</text></g>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

function Nombres({ m }) {
  const [v, setV] = useState('');
  const add = () => { const t = v.trim(); if (!t) return; acciones.setNombres([...m.nombres, t].slice(0, 20)); setV(''); };
  return (
    <div className="nombres">
      {m.nombres.map((n, i) => (
        <span key={i} className="chip">
          <span className="ini">{iniciales(n)}</span>{n}
          <button type="button" aria-label={`Quitar a ${n}`} onClick={() => acciones.setNombres(m.nombres.filter((_, j) => j !== i))}><Ico.x width="14" height="14" /></button>
        </span>
      ))}
      <label className="sr" htmlFor="nombre-amigo">Nombre de un amigo</label>
      <input id="nombre-amigo" value={v} maxLength={18} placeholder="+ Escribe un nombre y Enter" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} onBlur={add} />
    </div>
  );
}

function CadaUno({ m }) {
  const us = unidades(m);
  const [sobre, setSobre] = useState(null);
  const filas = cuentaCadaUno(m);
  const buscar = (ev) => {
    const pt = ev?.changedTouches?.[0] || ev;
    if (!pt || pt.clientX == null) return null;
    const el = document.elementsFromPoint(pt.clientX, pt.clientY).find((n) => n.dataset?.persona != null);
    return el ? Number(el.dataset.persona) : null;
  };
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="t-sm" style={{ opacity: 0.85 }}>Arrastra cada plato a quien lo pide (o elígelo en la lista). Lo que no tenga dueño se divide entre todos.</div>
      <div className="unidades">
        {us.map((u) => (
          <motion.div
            key={u.uid}
            className="unidad"
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            whileDrag={{ scale: 1.08, zIndex: 20 }}
            onDrag={(e) => setSobre(buscar(e))}
            onDragEnd={(e) => { const p = buscar(e); setSobre(null); if (p != null) acciones.asignar(u.uid, p); }}
          >
            <span className="pt" style={{ overflow: 'hidden', display: 'inline-grid', placeItems: 'center' }}><FotoLinea l={u.linea} size={22} /></span>
            {u.linea.custom ? `«${u.linea.custom.nombre}»` : nombreLinea(u.linea)}
            <select aria-label={`¿Quién pide ${nombreLinea(u.linea)}?`} value={m.asig[u.uid] ?? ''} onChange={(e) => acciones.asignar(u.uid, e.target.value === '' ? null : Number(e.target.value))} onPointerDown={(e) => e.stopPropagation()}>
              <option value="">Entre todos</option>
              {Array.from({ length: m.personas }).map((_, i) => <option key={i} value={i}>{nombrePersona(m, i)}</option>)}
            </select>
          </motion.div>
        ))}
      </div>
      <div className="personas-dz">
        {filas.map((f, i) => (
          <div key={i} className={`persona ${sobre === i ? 'sobre' : ''}`} data-persona={i}>
            <span className="ini">{iniciales(f.nombre)}</span>
            <span style={{ flex: 1 }}>{f.nombre}</span>
            <b className="num">{dinero(f.total)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArmaMesa() {
  const m = useStore(mesa);
  const t = totales(m);
  const r = recomendacion(m);
  const sug = plato('desgranado-casa');
  const sugRef = useRef(null);
  const msg = mensajeParche(m);
  return (
    <section id="mesa" className="sec mesa-sec" aria-labelledby="mesa-tit">
      <div className="wrap">
        <div className="titulo-sec">
          <span className="eyebrow">La experiencia de compartir</span>
          <h2 id="mesa-tit" className="t-heading">Arma la mesa con <span className="acento">tu gente.</span></h2>
          <p className="t-lead muted">Dile cuántos son, pon lo que van a pedir al centro y que las cuentas queden claras antes de llegar. Después se lo mandas al parche.</p>
        </div>
        <div className="mesa-grid">
          <div className="mesa-izq">
            <div className="cuantos">
              <div>
                <div style={{ fontWeight: 600 }}>¿Cuántos son?</div>
                <div className="t-sm muted">De 1 a 20 personas</div>
              </div>
              <Stepper valor={m.personas} min={1} max={20} etiqueta="Personas" onMenos={() => acciones.setPersonas(m.personas - 1)} onMas={() => acciones.setPersonas(m.personas + 1)} />
            </div>
            <Mesa m={m} />
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="t-sm" style={{ fontWeight: 600 }}>¿Quiénes van? <span className="muted" style={{ fontWeight: 400 }}>(opcional, para los avatares y el juego)</span></div>
              <Nombres m={m} />
            </div>
          </div>

          <div className="cuenta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="t-sub" style={{ fontSize: 28 }}>La cuenta</h3>
              <span className="t-sm muted num">{t.platos} {t.platos === 1 ? 'plato' : 'platos'}</span>
            </div>
            {m.lineas.length === 0 ? (
              <div className="vacio" style={{ justifyItems: 'start', textAlign: 'left', padding: 0 }}>
                <p style={{ margin: 0 }} className="muted">Todavía no hay nada en la mesa. Empieza por algo para el centro:</p>
                <button ref={sugRef} type="button" className="sug" onClick={() => agregarPlato(sug, sugRef.current)}>
                  <Foto id={sug.foto} sizes="44px" />
                  <span style={{ flex: 1 }}><b>{sug.nombre}</b><br /><span className="t-sm muted">{porcion(sug.porcion)} · {dinero(sug.precio)}</span></span>
                  <Ico.mas />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                <AnimatePresence initial={false}>
                  {m.lineas.map((l) => (
                    <motion.div key={l.key} className="linea" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <span className="linea-foto"><FotoLinea l={l} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div className="linea-nom">{nombreLinea(l)}</div>
                        <div className="linea-sub"><span>{porcion(porcionLinea(l))}</span>{l.nota && <span>· {l.nota}</span>}</div>
                      </div>
                      <div className="linea-der">
                        <Stepper sm valor={l.qty} onMenos={() => acciones.setQty(l.key, l.qty - 1)} onMas={() => acciones.setQty(l.key, l.qty + 1)} etiqueta={`Cantidad de ${nombreLinea(l)}`} />
                        <span className="num" style={{ minWidth: 76, textAlign: 'right', fontWeight: 600 }}>{dinero(precioLinea(l) * l.qty)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="reco" role="status">
              <Ico.hoja style={{ flex: 'none', marginTop: 2, color: 'var(--c-oliva-profundo)' }} />
              <div>
                <b>{r.texto}</b>
                <div className="t-sm">{r.falta > 0 ? `Les falta más o menos ${r.faltanPlatos} ${r.faltanPlatos === 1 ? 'plato' : 'platos'} para compartir. Pidan uno más para el centro.` : 'Mesa completa: nadie se queda con hambre.'}</div>
              </div>
            </div>

            <div className="claras" aria-live="polite">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 17 }}>Cuentas claras</b>
                <Seg grupo="modo-cuenta" valor={m.modo} onChange={acciones.setModo} opciones={[{ id: 'iguales', nombre: 'Partes iguales' }, { id: 'cada', nombre: 'Cada uno lo suyo' }]} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span className="t-sm" style={{ opacity: 0.85 }}>Total <b className="num">{dinero(t.total)}</b> entre {m.personas}</span>
                {m.modo === 'iguales' && <span className="grande">{dinero(t.porPersona)} <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0 }}>c/u</span></span>}
              </div>
              {m.modo === 'cada' && m.lineas.length > 0 && <CadaUno m={m} />}
            </div>

            <div className="mesa-btns">
              <a className="btn btn-pri" href={waLink(msg)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, msg)}><Ico.wa /> Mandar al parche</a>
              <button type="button" className="btn btn-sec" onClick={() => uiAcc.abrirPanel('domicilio')}>Pedir a Entreverde</button>
              <button type="button" className="btn btn-sec" onClick={() => uiAcc.abrirPanel('reservar')}>Reservar con esto</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
