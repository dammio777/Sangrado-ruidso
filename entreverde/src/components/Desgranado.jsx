import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BaseMaiz, BowlBase, IngredienteArte, Muestra } from './BowlArt.jsx';
import { Ico, Ejemplo, Seg } from './ui.jsx';
import { DESGRANADO } from '../data.js';
import { ING, armarCustom, faltantes, ingsOrdenados, nombreAzar, sorpresa, vacio } from '../lib/desgranado.js';
import { acciones, guardado, uiAcc } from '../lib/store.js';
import { dinero, onCompartir, porcion, urlBase, waLink } from '../lib/util.js';
import { volar } from '../lib/volar.js';
import { useReduced } from '../lib/motion.js';
import { irA } from '../lib/scroll.js';

const inicial = guardado.get('ev-desg') || { sel: DESGRANADO.presets[0].sel, nombre: 'El de la casa', tamano: 'compartir' };

export function mensajeDesgranado(c) {
  const lista = c.lista.map((g) => g.items.join(', ')).join(' · ');
  return `Armé mi desgranado en Entreverde 🍃 «${c.nombre}» (${porcion(c.porcion)}): maíz tierno + ${lista}. ¿Quién se le mide? ${urlBase()}#desgranado`;
}

export default function Desgranado() {
  const [sel, setSel] = useState(() => ({ ...vacio(), ...inicial.sel }));
  const [nombre, setNombre] = useState(inicial.nombre || '');
  const [tamano, setTamano] = useState(inicial.tamano || 'compartir');
  const [aviso, setAviso] = useState({});
  const [falta, setFalta] = useState('');
  const bowlRef = useRef(null);
  const reduced = useReduced();

  useEffect(() => { guardado.set('ev-desg', { sel, nombre, tamano }); }, [sel, nombre, tamano]);

  const ings = useMemo(() => ingsOrdenados(sel), [sel]);
  const custom = useMemo(() => armarCustom(nombre.trim() || 'Mi desgranado', tamano, sel), [nombre, tamano, sel]);
  const faltan = faltantes(sel);
  const tam = DESGRANADO.tamanos.find((t) => t.id === tamano);
  const total = Object.values(sel).reduce((s, a) => s + a.length, 0);

  function toggle(paso, id) {
    setFalta('');
    setSel((s) => {
      const cur = s[paso.id] || [];
      if (cur.includes(id)) return { ...s, [paso.id]: cur.filter((x) => x !== id) };
      if (paso.max === 1) return { ...s, [paso.id]: [id] };
      if (cur.length >= paso.max) {
        setAviso((a) => ({ ...a, [paso.id]: `Máximo ${paso.max}. Quita uno para cambiarlo.` }));
        setTimeout(() => setAviso((a) => ({ ...a, [paso.id]: '' })), 2400);
        return s;
      }
      return { ...s, [paso.id]: [...cur, id] };
    });
  }
  function preset(p) { setSel({ ...vacio(), ...p.sel }); setNombre(p.nombre); setFalta(''); }
  function azar() { setSel(sorpresa()); setNombre(nombreAzar(nombre)); setFalta(''); }
  function reiniciar() { setSel(vacio()); setNombre(''); setFalta(''); }
  function agregar() {
    if (faltan.length) {
      setFalta(`Te falta escoger: ${faltan.join(' y ')}.`);
      const p = DESGRANADO.pasos.find((x) => (sel[x.id] || []).length < x.min);
      if (p) irA(`paso-${p.id}`);
      return;
    }
    acciones.agregar('desgranado-custom', 1, '', custom);
    volar(bowlRef.current, bowlRef.current?.querySelector('svg'));
    uiAcc.toast(`«${custom.nombre}» ya está en tu mesa`);
  }

  const compartir = mensajeDesgranado(custom);
  const listo = faltan.length === 0;

  return (
    <section id="desgranado" className="sec desg" data-noche aria-labelledby="desg-tit">
      <div className="wrap">
        <div className="desg-head">
          <div className="titulo-sec" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Lo nuevo de la casa · el favorito del parche</span>
            <h2 id="desg-tit" className="t-heading">Arma tu <span className="acento">desgranado.</span></h2>
          </div>
          <div style={{ display: 'grid', gap: 18 }}>
            <p className="t-lead">Maíz tierno de base y el resto lo escoges tú. Toca cada ingrediente, míralo caer en el bowl, ponle nombre y compártelo con tu gente.</p>
            <div className="presets">
              <span className="t-sm muted">Para arrancar:</span>
              {DESGRANADO.presets.map((p) => (
                <button key={p.nombre} type="button" className="chip chip-sm" aria-pressed={nombre === p.nombre} onClick={() => preset(p)}>{p.nombre}</button>
              ))}
              <button type="button" className="chip chip-sm" onClick={azar}><Ico.dado width="15" height="15" /> Sorpréndeme</button>
            </div>
          </div>
        </div>

        <div className="desg-grid">
          {/* ---------- Bowl ---------- */}
          <div className="desg-bowl">
            <div className="bowl-esc" ref={bowlRef}>
              <svg viewBox="0 0 400 400" role="img" aria-label={`Tu desgranado: maíz tierno${ings.length ? ', ' + ings.map((i) => i.nombre.toLowerCase()).join(', ') : ''}`}>
                <BowlBase id="desg">
                  <BaseMaiz />
                  <AnimatePresence>
                    {ings.map((ing) => (
                      <motion.g
                        key={ing.id}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -70, scale: 1.25 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.22 } }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      >
                        <IngredienteArte ing={ing} />
                      </motion.g>
                    ))}
                  </AnimatePresence>
                </BowlBase>
              </svg>
              <AnimatePresence mode="popLayout">
                {nombre.trim() && (
                  <motion.span key={nombre.trim()} className="bowl-tag glass-dark" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>«{nombre.trim()}»</motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="bowl-resumen glass-dark">
              <div className="fila">
                <div>
                  <div className="t-sm" style={{ color: 'var(--c-salvia)' }}>{tam.nombre} · {porcion(tam.porcion)}</div>
                  <div style={{ fontWeight: 600 }}>{total} ingredientes + maíz tierno</div>
                </div>
                <div className="precio num">{dinero(tam.precio)} <Ejemplo /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-ambar" onClick={agregar} aria-describedby="desg-falta"><Ico.mas /> Agregar a la mesa</button>
                <a className="btn btn-sec" href={waLink(compartir)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, compartir)}><Ico.compartir /> Compartir</a>
                <button type="button" className="btn-link" onClick={reiniciar} style={{ marginLeft: 'auto' }}>Empezar de nuevo</button>
              </div>
              <div id="desg-falta" className="paso-aviso" role="status">{falta || (listo ? '' : `Falta: ${faltan.join(', ')}`)}</div>
            </div>
          </div>

          {/* ---------- Pasos ---------- */}
          <div className="desg-pasos">
            <div className="paso" style={{ display: 'grid', gap: 14 }}>
              <div className="paso-cab" style={{ marginBottom: 0 }}>
                <span className="paso-num ok" style={{ background: 'var(--c-ambar)', color: 'var(--c-bosque)' }}><Ico.check /></span>
                <span className="paso-tit">Base: {DESGRANADO.base.toLowerCase()}</span>
              </div>
              <Seg grupo="tam" className="tam-seg" valor={tamano} onChange={setTamano} opciones={DESGRANADO.tamanos.map((t) => ({ id: t.id, nombre: <>{t.nombre} <small>· {porcion(t.porcion)}</small></> }))} />
            </div>

            {DESGRANADO.pasos.map((paso, pi) => {
              const cur = sel[paso.id] || [];
              const lleno = paso.max > 1 && cur.length >= paso.max;
              const ok = cur.length >= Math.max(1, paso.min);
              return (
                <div key={paso.id} id={`paso-${paso.id}`} className={`paso ${ok ? 'ok' : ''}`} role="group" aria-labelledby={`pt-${paso.id}`}>
                  <div className="paso-cab">
                    <span className="paso-num">{ok ? <Ico.check /> : pi + 1}</span>
                    <span className="paso-tit" id={`pt-${paso.id}`}>{paso.nombre}</span>
                    <span className="paso-regla">{paso.regla} · {cur.length}/{paso.max}</span>
                  </div>
                  <div className="ings">
                    {paso.items.map((it) => {
                      const on = cur.includes(it.id);
                      return (
                        <button key={it.id} type="button" className="ing" aria-pressed={on} aria-disabled={!on && lleno} onClick={() => toggle(paso, it.id)}>
                          <Muestra ing={ING[it.id]} size={40} />
                          <span>{it.nombre}</span>
                          {on && <motion.span className="chk" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}><Ico.check /></motion.span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="paso-aviso" role="status">{aviso[paso.id] || ''}</div>
                </div>
              );
            })}

            <div className="paso" style={{ display: 'grid', gap: 12 }}>
              <div className="paso-cab" style={{ marginBottom: 0 }}>
                <span className={`paso-num ${nombre.trim() ? 'ok' : ''}`} style={nombre.trim() ? { background: 'var(--c-ambar)', color: 'var(--c-bosque)' } : undefined}>{nombre.trim() ? <Ico.check /> : 6}</span>
                <label className="paso-tit" htmlFor="desg-nombre">Dale un nombre a tu creación</label>
              </div>
              <div className="nombre-in">
                <input id="desg-nombre" className="input-noche" value={nombre} maxLength={32} placeholder="Ej.: El Silletero" onChange={(e) => setNombre(e.target.value)} />
                <button type="button" className="btn btn-sec btn-sm" onClick={() => setNombre(nombreAzar(nombre))}><Ico.dado width="16" height="16" /> Sugerir</button>
              </div>
            </div>
          </div>
        </div>

        <div className="desg-barra glass-dark">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>«{custom.nombre}»</div>
            <div className="t-sm num" style={{ color: 'var(--c-salvia)' }}>{dinero(tam.precio)} · {total} ingredientes</div>
          </div>
          <button type="button" className="btn btn-ambar btn-sm" style={{ marginLeft: 'auto' }} onClick={agregar}><Ico.mas /> A la mesa</button>
        </div>
      </div>
    </section>
  );
}
