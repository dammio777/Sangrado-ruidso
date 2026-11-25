import { useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Foto, Ico, Ejemplo, Stepper, useFocusTrap } from './ui.jsx';
import { BowlMini } from './BowlArt.jsx';
import { CARTA, CATEGORIAS, DESGRANADO, FOTOS } from '../data.js';
import { acciones, plato, uiAcc } from '../lib/store.js';
import { ingsOrdenados } from '../lib/desgranado.js';
import { dinero, fotoSrc, onCompartir, porcion, urlBase, waLink } from '../lib/util.js';
import { volar } from '../lib/volar.js';
import { irA } from '../lib/scroll.js';
import { SPRING } from '../lib/motion.js';

export function agregarPlato(p, desdeEl, qty = 1, nota = '') {
  if (!p.disponible) return;
  acciones.agregar(p.id, qty, nota);
  volar(desdeEl, fotoSrc(p.foto, 400));
  uiAcc.toast(`${qty > 1 ? `${qty} × ` : ''}${p.nombre} a la mesa`);
}

function Card({ p, onAbrir }) {
  const ph = !FOTOS[p.foto]?.src;
  if (p.especial === 'builder') {
    const ings = ingsOrdenados(DESGRANADO.presets[0].sel);
    return (
      <motion.article layout transition={SPRING} className={`card builder ${p.tam || ''}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span className="etq-nuevo" style={{ justifySelf: 'start' }}>Nuevo</span>
          <div className="card-nom" style={{ color: 'var(--c-crema)' }}>{p.nombre}</div>
          <div className="t-sm" style={{ opacity: 0.85 }}>{p.desc}</div>
        </div>
        <div className="mini-bowl"><BowlMini ings={ings} size="100%" id="card-b" /></div>
        <button type="button" className="btn btn-ambar btn-sm" onClick={() => irA('desgranado')}>Armarlo <Ico.der width="16" height="16" /></button>
      </motion.article>
    );
  }
  return (
    <motion.article layout transition={SPRING} className={`card ${p.tam || ''} ${ph ? 'ph-card' : ''} ${p.disponible ? '' : 'agotado'}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
      <motion.div layoutId={`foto-${p.id}`} className="card-foto">
        <Foto id={p.foto} sizes={p.tam === 'grande' ? '(min-width: 1100px) 620px, 100vw' : '(min-width: 1100px) 300px, 50vw'} />
      </motion.div>
      <div className="card-grad" />
      <button type="button" className="card-hit" onClick={() => p.disponible && onAbrir(p)} aria-label={`Ver ${p.nombre}`} disabled={!p.disponible} />
      {p.nuevo && <span className="etq-nuevo">Nuevo</span>}
      {!p.disponible && <span className="agotado-etq">Agotado</span>}
      <button type="button" className="card-mas glass-light" aria-label={`Agregar ${p.nombre} a la mesa`} onClick={(e) => agregarPlato(p, e.currentTarget)}><Ico.mas /></button>
      <div className="card-info">
        <div className="card-nom">{p.nombre}{p.nombrePendiente && <> <Ejemplo>nombre</Ejemplo></>}</div>
        {(p.tam === 'grande' || p.tam === 'ancha') && <div className="card-desc">{p.desc}</div>}
        <div className="card-fila">
          <span className="card-precio">{dinero(p.precio)}</span>
          <span className={`card-por ${ph ? '' : 'glass-tint'}`}>{porcion(p.porcion)}</span>
          {p.ejemplo && <Ejemplo>precio ej.</Ejemplo>}
        </div>
      </div>
    </motion.article>
  );
}

function ModalPlato({ p, onCerrar }) {
  const ref = useRef(null);
  const [qty, setQty] = useState(1);
  const [nota, setNota] = useState('');
  useFocusTrap(ref, true, onCerrar);
  const btn = useRef(null);
  return (
    <>
      <motion.div className="velo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCerrar} />
      <div className="modal-wrap">
        <motion.div ref={ref} className="modal glass-light" role="dialog" aria-modal="true" aria-labelledby="modal-tit" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={SPRING} style={{ position: 'relative' }} data-lenis-prevent>
          <button type="button" className="btn-ico cerrar glass-light" onClick={onCerrar} aria-label="Cerrar"><Ico.x /></button>
          <motion.div layoutId={`foto-${p.id}`} className="modal-foto">
            <Foto id={p.foto} sizes="(min-width: 760px) 460px, 100vw" />
          </motion.div>
          <div className="modal-cuerpo">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="chip chip-sm on">{porcion(p.porcion)}</span>
              {p.nuevo && <span className="etq-nuevo">Nuevo</span>}
            </div>
            <h3 id="modal-tit" className="t-sub">{p.nombre}</h3>
            <p style={{ margin: 0 }} className="muted">{p.desc}</p>
            {p.ingredientes && (
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Lleva</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{p.ingredientes.map((i) => <span key={i} className="chip chip-sm">{i}</span>)}</div>
              </div>
            )}
            <div className="campo">
              <label htmlFor="nota-plato">Nota para la cocina</label>
              <input id="nota-plato" className="input" placeholder="Sin cebolla, salsa aparte…" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={80} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Stepper valor={qty} min={1} onMenos={() => setQty((q) => Math.max(1, q - 1))} onMas={() => setQty((q) => q + 1)} />
              <button ref={btn} type="button" className="btn btn-pri" style={{ flex: 1 }} onClick={() => { agregarPlato(p, btn.current, qty, nota.trim()); onCerrar(); }} data-autofocus>
                Agregar a la mesa · {dinero(p.precio * qty)}
              </button>
            </div>
            {p.ejemplo && <span className="ayuda">Precio de ejemplo <Ejemplo /></span>}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function Carta() {
  const [cat, setCat] = useState('todo');
  const [todos, setTodos] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const lista = cat === 'todo' ? CARTA.filter((p) => todos || p.destacado) : CARTA.filter((p) => p.cat === cat);
  const ocultos = CARTA.length - CARTA.filter((p) => p.destacado).length;
  const combo = plato('combo-parche');
  const comboRef = useRef(null);
  const msgCombo = `🍃 ¿Pedimos el Combo El Parche en Entreverde? 3 desgranados, papas, 3 cervezas y salsas por ${dinero(combo.precio)}. Sale a ${dinero(Math.ceil(combo.precio / 4 / 100) * 100)} c/u entre 4. ${urlBase()}#carta`;

  const abrir = (p) => { setAbierto(p); uiAcc.modal(1); };
  const cerrar = () => { setAbierto(null); uiAcc.modal(-1); };

  return (
    <section id="carta" className="sec" aria-labelledby="carta-tit">
      <div className="wrap">
        <div className="titulo-sec">
          <span className="eyebrow">La carta para compartir</span>
          <h2 id="carta-tit" className="t-heading">Pide para el <span className="acento">centro.</span></h2>
          <p className="t-lead muted">Todo viene marcado: para 1, para 2–3 o para el grupo. Toca el + y el plato se va directo a tu mesa.</p>
        </div>
        <div className="filtros" role="toolbar" aria-label="Filtrar la carta">
          {CATEGORIAS.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.nombre}</button>
          ))}
        </div>
        <LayoutGroup>
          <motion.div layout className="bento">
            <AnimatePresence mode="popLayout">
              {lista.map((p) => <Card key={p.id} p={p} onAbrir={abrir} />)}
            </AnimatePresence>
          </motion.div>
          {cat === 'todo' && !todos && (
            <div className="card-ver-mas">
              <button type="button" className="btn btn-sec" onClick={() => setTodos(true)}>Ver toda la carta (+{ocultos})</button>
            </div>
          )}
          <AnimatePresence>{abierto && <ModalPlato key={abierto.id} p={abierto} onCerrar={cerrar} />}</AnimatePresence>
        </LayoutGroup>

        {/* ---------- Combos (propuesta del local) ---------- */}
        <div className="combo" id="combos">
          <div className="combo-foto"><Foto id="desgranados-trio" sizes="(min-width: 900px) 700px, 100vw" /></div>
          <div className="combo-info">
            <span className="eyebrow" style={{ color: 'var(--c-salvia)' }}>Combos para el parche</span>
            <h3 className="t-sub">{combo.nombre}</h3>
            <ul className="combo-lista">{combo.ingredientes.map((i) => <li key={i}>{i}</li>)}</ul>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span className="combo-precio num">{dinero(combo.precio)}</span>
              <span className="t-sm" style={{ color: 'var(--c-salvia)' }}>para 3–4 · {dinero(Math.ceil(combo.precio / 4 / 100) * 100)} c/u entre 4</span>
              <Ejemplo />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button ref={comboRef} type="button" className="btn btn-ambar" onClick={() => agregarPlato(combo, comboRef.current)}><Ico.mas /> Agregar a la mesa</button>
              <a className="btn btn-sec" style={{ color: 'var(--c-crema)', boxShadow: 'inset 0 0 0 1px rgba(244,241,232,.3)' }} href={waLink(msgCombo)} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, msgCombo)}><Ico.compartir /> Proponerlo al parche</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
