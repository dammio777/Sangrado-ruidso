import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useDragControls, useMotionValue } from 'framer-motion';
import { Foto, Ico, Seg, Stepper, useFocusTrap } from './ui.jsx';
import { FotoLinea } from './ArmaMesa.jsx';
import { CARTA, CONFIG } from '../data.js';
import { acciones, mesa, nombreLinea, porcionLinea, precioLinea, totales, ui, uiAcc, useStore } from '../lib/store.js';
import { DIAS_CORTO, bogota, diaDesde, diasAbiertos, estado, fechaBonita, franjas, franjasDomicilio, horaBonita, horarioDelDia } from '../lib/horario.js';
import { copiar, dinero, fotoSrc, mensajeParche, mensajePedido, numeroPedido, onCompartir, porcion, waEntreverde, waLink } from '../lib/util.js';
import { useMedia } from '../lib/motion.js';

const celOk = (c) => /^3\d{9}$/.test(c.replace(/\D/g, ''));
const fmtCel = (c) => { const d = c.replace(/\D/g, '').slice(0, 10); return d.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, e) => [a, b, e].filter(Boolean).join(' ')); };

function Campo({ id, label, error, mostrar, children, ayuda }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {children}
      {mostrar && error ? <span className="error" id={`${id}-err`} role="alert">{error}</span> : ayuda ? <span className="ayuda">{ayuda}</span> : null}
    </div>
  );
}

function proximosDiasAbiertos(n = 7) {
  return diasAbiertos(21).filter((d) => d.abierto).slice(0, n);
}

export default function PanelMesa() {
  const abierto = useStore(ui, (u) => u.panel);
  const modoUi = useStore(ui, (u) => u.panelModo);
  const m = useStore(mesa);
  const movil = useMedia('(max-width: 767px)');
  const ref = useRef(null);
  const [modo, setModo] = useState(modoUi);
  const [paso, setPaso] = useState('form');
  const [num, setNum] = useState(numeroPedido);
  const [intento, setIntento] = useState(false);
  const [tocado, setTocado] = useState({});
  const [vaciarSeguro, setVaciarSeguro] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const preRef = useRef(null);
  const ahora = estado();
  const dias7 = useMemo(() => proximosDiasAbiertos(7), [abierto]);

  const [d, setD] = useState(() => ({
    nombre: '', cel: '', zona: '', direccion: '', referencia: '', cuando: 'ya', diaDom: '', horaDom: '',
    pago: CONFIG.pagos[0], conCuanto: '', notas: '', diaRes: '', horaRes: '', zonaLugar: CONFIG.reservas.zonas[CONFIG.reservas.zonas.length - 1], ocasion: CONFIG.reservas.ocasiones[0], dejarPedido: true, horaRec: '',
  }));
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const toca = (k) => () => setTocado((t) => ({ ...t, [k]: true }));

  useEffect(() => { if (abierto) { setModo(modoUi); setPaso('form'); setIntento(false); setVaciarSeguro(false); setCopiado(false); } }, [abierto, modoUi]);
  useEffect(() => { if (abierto && !movil) return; }, [abierto, movil]);

  // Si está cerrado, el domicilio pasa a "Programar" para la próxima apertura (aviso, nunca error).
  const cerrado = !ahora.abierto;
  useEffect(() => {
    if (!abierto) return;
    const primer = dias7[0];
    setD((x) => {
      const n = { ...x };
      if (cerrado && modo !== 'reservar') n.cuando = 'programar';
      if (!n.diaDom && primer) n.diaDom = primer.iso;
      if (!n.diaRes && primer) n.diaRes = primer.iso;
      return n;
    });
  }, [abierto, modo, cerrado]);

  const diaDomObj = dias7.find((x) => x.iso === d.diaDom) || dias7[0];
  const slotsDom = diaDomObj ? franjasDomicilio(diaDomObj.iso, diaDomObj.dow) : [];
  useEffect(() => {
    if (modo === 'domicilio' && d.cuando === 'programar' && !slotsDom.includes(d.horaDom) && slotsDom[0]) setD((x) => ({ ...x, horaDom: slotsDom[0] }));
  }, [modo, d.cuando, d.diaDom, slotsDom.join()]);
  const diaResObj = diasAbiertos().find((x) => x.iso === d.diaRes);
  const slotsRes = d.diaRes ? franjas(d.diaRes) : [];
  const hoy = bogota();
  const slotsRec = (() => {
    const base = ahora.abierto ? { iso: hoy.iso, dow: hoy.dow } : dias7[0];
    return base ? { dia: base, slots: franjasDomicilio(base.iso, base.dow) } : { slots: [] };
  })();

  const zona = CONFIG.domicilio.zonas.find((z) => z.id === d.zona);
  const costoDom = modo === 'domicilio' && zona ? zona.costo : 0;
  const t = totales(m, costoDom);

  // ---------- validación ----------
  const err = {};
  if (!d.nombre.trim()) err.nombre = '¿A nombre de quién?';
  if (!celOk(d.cel)) err.cel = 'Escribe un celular de 10 dígitos que empiece por 3.';
  if (modo === 'domicilio') {
    if (!m.lineas.length) err.platos = 'Agrega al menos un plato.';
    if (!zona) err.zona = 'Escoge tu vereda o sector.';
    if (!d.direccion.trim()) err.direccion = 'Necesitamos la dirección para llegar.';
    if (d.cuando === 'programar' && !d.horaDom) err.horaDom = 'Escoge una hora.';
    if (d.pago === 'Efectivo' && d.conCuanto && Number(d.conCuanto) < t.total) err.conCuanto = `Debe ser mínimo ${dinero(t.total)}.`;
  }
  if (modo === 'reservar') {
    if (!d.diaRes) err.diaRes = 'Escoge el día.';
    if (!d.horaRes) err.horaRes = 'Escoge la hora.';
  }
  if (modo === 'recoger') {
    if (!m.lineas.length) err.platos = 'Agrega al menos un plato.';
    if (!d.horaRec) err.horaRec = 'Escoge a qué hora pasas.';
  }
  const valido = Object.keys(err).length === 0;
  const ver = (k) => intento || tocado[k];

  const cuando = modo === 'domicilio'
    ? (d.cuando === 'ya' ? 'lo antes posible' : `${diaDomObj ? fechaBonita(diaDomObj) : ''}, ${d.horaDom ? horaBonita(d.horaDom) : ''}`)
    : modo === 'reservar'
      ? `${diaResObj ? fechaBonita(diaResObj) : ''}, ${d.horaRes ? horaBonita(d.horaRes) : ''}`
      : `${slotsRec.dia ? (slotsRec.dia.iso === hoy.iso ? 'hoy' : fechaBonita(slotsRec.dia)) : ''}, ${d.horaRec ? horaBonita(d.horaRec) : ''}`;
  const mensaje = mensajePedido({ numero: num, modo, m, datos: { ...d, cel: fmtCel(d.cel) }, zona, cuando, costoDom });

  const enviar = (e) => {
    if (!valido) { e.preventDefault(); setIntento(true); ref.current?.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setTimeout(() => setPaso('listo'), 120);
  };
  const cerrar = () => uiAcc.cerrarPanel();
  useFocusTrap(ref, abierto, cerrar);

  // ---------- hoja inferior arrastrable (móvil) ----------
  const y = useMotionValue(0);
  const ctrl = useDragControls();
  const alto = typeof innerHeight !== 'undefined' ? innerHeight * 0.92 : 800;
  const medio = typeof innerHeight !== 'undefined' ? alto - innerHeight * 0.5 : 300;
  useEffect(() => { if (abierto && movil) { y.set(alto); animate(y, m.lineas.length > 2 ? 0 : medio, { type: 'spring', stiffness: 300, damping: 34 }); } }, [abierto, movil]);
  const soltar = (_, info) => {
    const fin = y.get() + info.velocity.y * 0.15;
    if (fin > medio + 140) { cerrar(); return; }
    animate(y, fin < medio / 2 ? 0 : medio, { type: 'spring', stiffness: 320, damping: 34 });
  };

  const sugerencias = CARTA.filter((p) => ['desgranado-casa', 'combo-parche', 'papas'].includes(p.id));
  const modos = [{ id: 'domicilio', nombre: 'Domicilio' }, { id: 'reservar', nombre: 'Reservar mesa' }].concat(CONFIG.recoger ? [{ id: 'recoger', nombre: 'Recoger' }] : []);
  const calendario = diasAbiertos();
  const offsetCal = (calendario[0].dow + 6) % 7; // lunes primero

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div key="velo" className="velo" style={{ zIndex: 139, background: 'rgba(28,34,25,.28)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cerrar} />
          <motion.aside
            key="panel"
            ref={ref}
            className="panel glass-light"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-tit"
            initial={movil ? false : { x: 480, opacity: 0.6 }}
            animate={movil ? undefined : { x: 0, opacity: 1 }}
            exit={movil ? { y: alto, transition: { duration: 0.3 } } : { x: 480, opacity: 0.6, transition: { duration: 0.32, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            style={movil ? { y } : undefined}
            drag={movil ? 'y' : false}
            dragListener={false}
            dragControls={ctrl}
            dragConstraints={{ top: 0, bottom: alto }}
            dragElastic={{ top: 0.05, bottom: 0.4 }}
            onDragEnd={soltar}
          >
            {movil && <div className="asa-zona" onPointerDown={(e) => ctrl.start(e)}><div className="asa" /></div>}
            <div className="panel-cab" onPointerDown={(e) => movil && e.target === e.currentTarget && ctrl.start(e)}>
              <div className="fila">
                <h2 id="panel-tit" className="t-sub" style={{ fontSize: 28 }}>Tu mesa</h2>
                <button type="button" className="btn-ico" onClick={cerrar} aria-label="Cerrar tu mesa"><Ico.x /></button>
              </div>
              {paso === 'form' && <Seg grupo="modo-panel" className="seg-modo" valor={modo} onChange={(v) => { setModo(v); setIntento(false); }} opciones={modos} />}
            </div>

            {paso === 'form' ? (
              <>
                <div className="panel-cuerpo" data-lenis-prevent>
                  {/* platos */}
                  {m.lineas.length === 0 ? (
                    <div className="vacio">
                      <p style={{ margin: 0, fontWeight: 500 }}>Tu mesa está vacía. ¿Le damos una mirada a la carta?</p>
                      <div className="sugs">
                        {sugerencias.map((p) => (
                          <button key={p.id} type="button" className="sug" onClick={() => acciones.agregar(p.id)}>
                            <img src={fotoSrc(p.foto, 400)} alt="" width="44" height="44" loading="lazy" />
                            <span style={{ flex: 1 }}><b>{p.nombre}</b><br /><span className="t-sm muted">{porcion(p.porcion)} · {dinero(p.precio)}</span></span>
                            <Ico.mas />
                          </button>
                        ))}
                      </div>
                      {err.platos && modo !== 'reservar' && intento && <span className="error">{err.platos}</span>}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {m.lineas.map((l) => (
                        <div key={l.key} style={{ display: 'grid', gap: 6 }}>
                          <div className="linea">
                            <span className="linea-foto"><FotoLinea l={l} /></span>
                            <div style={{ minWidth: 0 }}>
                              <div className="linea-nom">{nombreLinea(l)}</div>
                              <div className="linea-sub num">{porcion(porcionLinea(l))} · {dinero(precioLinea(l) * l.qty)}</div>
                            </div>
                            <Stepper sm valor={l.qty} onMenos={() => acciones.setQty(l.key, l.qty - 1)} onMas={() => acciones.setQty(l.key, l.qty + 1)} etiqueta={`Cantidad de ${nombreLinea(l)}`} />
                          </div>
                          <label className="sr" htmlFor={`nota-${l.key}`}>Nota para {nombreLinea(l)}</label>
                          <input id={`nota-${l.key}`} className="input" style={{ height: 38, fontSize: 14, marginLeft: 56, width: 'calc(100% - 56px)' }} placeholder="Nota: sin cebolla…" value={l.nota || ''} onChange={(e) => acciones.setNota(l.key, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="cuantos" style={{ background: 'rgba(28,34,25,.05)' }}>
                    <div><b>¿Cuántos son?</b><div className="t-sm muted">Viene de «Arma la mesa»</div></div>
                    <Stepper valor={m.personas} min={1} max={20} etiqueta="Personas" onMenos={() => acciones.setPersonas(m.personas - 1)} onMas={() => acciones.setPersonas(m.personas + 1)} />
                  </div>

                  {/* -------- DOMICILIO -------- */}
                  {modo === 'domicilio' && (
                    <>
                      {cerrado && (
                        <div className="aviso" role="status"><Ico.reloj style={{ flex: 'none' }} /> Ahora estamos cerrados. Programamos tu domicilio para {diaDomObj ? fechaBonita(diaDomObj) : 'la próxima apertura'} desde las 4:00 p. m.</div>
                      )}
                      <Campo id="f-nombre" label="Nombre" error={err.nombre} mostrar={ver('nombre')}>
                        <input id="f-nombre" className="input" autoComplete="name" value={d.nombre} onChange={set('nombre')} onBlur={toca('nombre')} aria-invalid={ver('nombre') && !!err.nombre} />
                      </Campo>
                      <Campo id="f-cel" label="Celular" error={err.cel} mostrar={ver('cel')}>
                        <input id="f-cel" className="input num" inputMode="numeric" autoComplete="tel-national" placeholder="300 000 0000" value={fmtCel(d.cel)} onChange={(e) => setD((x) => ({ ...x, cel: e.target.value.replace(/\D/g, '').slice(0, 10) }))} onBlur={toca('cel')} aria-invalid={ver('cel') && !!err.cel} />
                      </Campo>
                      <Campo id="f-zona" label="Zona" error={err.zona} mostrar={ver('zona')} ayuda="El costo del domicilio depende de la vereda o sector.">
                        <select id="f-zona" className="input" value={d.zona} onChange={set('zona')} onBlur={toca('zona')} aria-invalid={ver('zona') && !!err.zona}>
                          <option value="">Escoge tu vereda o sector</option>
                          {CONFIG.domicilio.zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre} · {dinero(z.costo)}</option>)}
                        </select>
                      </Campo>
                      <Campo id="f-dir" label="Dirección" error={err.direccion} mostrar={ver('direccion')}>
                        <input id="f-dir" className="input" autoComplete="street-address" value={d.direccion} onChange={set('direccion')} onBlur={toca('direccion')} aria-invalid={ver('direccion') && !!err.direccion} />
                      </Campo>
                      <Campo id="f-ref" label="Referencia">
                        <input id="f-ref" className="input" placeholder="Casa verde después de la tienda" value={d.referencia} onChange={set('referencia')} />
                      </Campo>
                      <div className="campo">
                        <span className="lbl">¿Cuándo?</span>
                        <div className="opciones">
                          <button type="button" className="chip" aria-pressed={d.cuando === 'ya'} disabled={cerrado} onClick={() => setD((x) => ({ ...x, cuando: 'ya' }))}>Lo antes posible</button>
                          <button type="button" className="chip" aria-pressed={d.cuando === 'programar'} onClick={() => setD((x) => ({ ...x, cuando: 'programar' }))}>Programar</button>
                        </div>
                        {d.cuando === 'programar' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <select aria-label="Día" className="input" value={d.diaDom} onChange={(e) => setD((x) => ({ ...x, diaDom: e.target.value, horaDom: '' }))}>
                              {dias7.map((x) => <option key={x.iso} value={x.iso}>{fechaBonita(x)}</option>)}
                            </select>
                            <select aria-label="Hora" className="input" value={d.horaDom} onChange={set('horaDom')} aria-invalid={intento && !!err.horaDom}>
                              <option value="">Hora</option>
                              {slotsDom.map((h) => <option key={h} value={h}>{horaBonita(h)}</option>)}
                            </select>
                          </div>
                        )}
                        {intento && err.horaDom && <span className="error">{err.horaDom}</span>}
                      </div>
                      <div className="campo">
                        <span className="lbl">Pago</span>
                        <div className="opciones">{CONFIG.pagos.map((p) => <button key={p} type="button" className="chip" aria-pressed={d.pago === p} onClick={() => setD((x) => ({ ...x, pago: p }))}>{p}</button>)}</div>
                      </div>
                      {d.pago === 'Efectivo' && (
                        <Campo id="f-cuanto" label="¿Con cuánto pagas?" error={err.conCuanto} mostrar={!!d.conCuanto} ayuda="Para llevarte las vueltas.">
                          <input id="f-cuanto" className="input num" inputMode="numeric" placeholder={`${t.total || 100000}`} value={d.conCuanto} onChange={(e) => setD((x) => ({ ...x, conCuanto: e.target.value.replace(/\D/g, '') }))} />
                        </Campo>
                      )}
                      <Campo id="f-notas" label="Notas"><textarea id="f-notas" className="input" value={d.notas} onChange={set('notas')} placeholder="Sin cebolla en un ceviche…" /></Campo>
                    </>
                  )}

                  {/* -------- RESERVAR -------- */}
                  {modo === 'reservar' && (
                    <>
                      <div className="campo">
                        <span className="lbl">Día</span>
                        <div className="dias" role="group" aria-label="Escoge el día">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x, i) => <span key={i} className="dow" aria-hidden="true">{x}</span>)}
                          {Array.from({ length: offsetCal }).map((_, i) => <span key={`v${i}`} />)}
                          {calendario.map((x) => (
                            <button key={x.iso} type="button" className="dia" disabled={!x.abierto} aria-pressed={d.diaRes === x.iso} aria-label={`${fechaBonita(x)}${x.abierto ? '' : ', cerrado'}${x.festivo ? ', festivo' : ''}`} onClick={() => setD((v) => ({ ...v, diaRes: x.iso, horaRes: '' }))}>{x.d}</button>
                          ))}
                        </div>
                        <span className="ayuda">Abrimos de jueves a domingo y algunos festivos.</span>
                      </div>
                      <div className="campo">
                        <span className="lbl">Hora</span>
                        <div className="opciones">{slotsRes.map((h) => <button key={h} type="button" className="chip chip-sm" style={{ height: 34 }} aria-pressed={d.horaRes === h} onClick={() => setD((x) => ({ ...x, horaRes: h }))}>{horaBonita(h)}</button>)}</div>
                        {intento && err.horaRes && <span className="error">{err.horaRes}</span>}
                      </div>
                      <div className="campo"><span className="lbl">Zona preferida</span><div className="opciones">{CONFIG.reservas.zonas.map((z) => <button key={z} type="button" className="chip" aria-pressed={d.zonaLugar === z} onClick={() => setD((x) => ({ ...x, zonaLugar: z }))}>{z}</button>)}</div></div>
                      <div className="campo"><span className="lbl">Ocasión</span><div className="opciones">{CONFIG.reservas.ocasiones.map((z) => <button key={z} type="button" className="chip" aria-pressed={d.ocasion === z} onClick={() => setD((x) => ({ ...x, ocasion: z }))}>{z}</button>)}</div></div>
                      <Campo id="r-nombre" label="Nombre" error={err.nombre} mostrar={ver('nombre')}>
                        <input id="r-nombre" className="input" autoComplete="name" value={d.nombre} onChange={set('nombre')} onBlur={toca('nombre')} aria-invalid={ver('nombre') && !!err.nombre} />
                      </Campo>
                      <Campo id="r-cel" label="Celular" error={err.cel} mostrar={ver('cel')}>
                        <input id="r-cel" className="input num" inputMode="numeric" autoComplete="tel-national" placeholder="300 000 0000" value={fmtCel(d.cel)} onChange={(e) => setD((x) => ({ ...x, cel: e.target.value.replace(/\D/g, '').slice(0, 10) }))} onBlur={toca('cel')} aria-invalid={ver('cel') && !!err.cel} />
                      </Campo>
                      {m.lineas.length > 0 && (
                        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 500 }}>
                          <input type="checkbox" checked={d.dejarPedido} onChange={set('dejarPedido')} style={{ width: 20, height: 20, accentColor: 'var(--c-oliva-profundo)' }} />
                          ¿Dejamos la comida pedida? ({m.lineas.reduce((s, l) => s + l.qty, 0)} platos)
                        </label>
                      )}
                    </>
                  )}

                  {/* -------- RECOGER -------- */}
                  {modo === 'recoger' && (
                    <>
                      {cerrado && <div className="aviso" role="status"><Ico.reloj style={{ flex: 'none' }} /> Ahora estamos cerrados. Puedes dejarlo listo para {slotsRec.dia ? fechaBonita(slotsRec.dia) : 'la próxima apertura'}.</div>}
                      <Campo id="c-nombre" label="Nombre" error={err.nombre} mostrar={ver('nombre')}>
                        <input id="c-nombre" className="input" autoComplete="name" value={d.nombre} onChange={set('nombre')} onBlur={toca('nombre')} aria-invalid={ver('nombre') && !!err.nombre} />
                      </Campo>
                      <Campo id="c-cel" label="Celular" error={err.cel} mostrar={ver('cel')}>
                        <input id="c-cel" className="input num" inputMode="numeric" placeholder="300 000 0000" value={fmtCel(d.cel)} onChange={(e) => setD((x) => ({ ...x, cel: e.target.value.replace(/\D/g, '').slice(0, 10) }))} onBlur={toca('cel')} aria-invalid={ver('cel') && !!err.cel} />
                      </Campo>
                      <div className="campo">
                        <span className="lbl">¿A qué hora pasas?</span>
                        <div className="opciones">{slotsRec.slots.map((h) => <button key={h} type="button" className="chip chip-sm" style={{ height: 34 }} aria-pressed={d.horaRec === h} onClick={() => setD((x) => ({ ...x, horaRec: h }))}>{horaBonita(h)}</button>)}</div>
                        {intento && err.horaRec && <span className="error">{err.horaRec}</span>}
                      </div>
                      <div className="campo"><span className="lbl">Pago</span><div className="opciones">{CONFIG.pagos.map((p) => <button key={p} type="button" className="chip" aria-pressed={d.pago === p} onClick={() => setD((x) => ({ ...x, pago: p }))}>{p}</button>)}</div></div>
                      <Campo id="c-notas" label="Notas"><textarea id="c-notas" className="input" value={d.notas} onChange={set('notas')} /></Campo>
                    </>
                  )}
                </div>

                <div className="panel-pie">
                  {modo !== 'reservar' || (d.dejarPedido && m.lineas.length) ? (
                    <>
                      <div className="fila"><span>Subtotal</span><span>{dinero(t.subtotal)}</span></div>
                      {modo === 'domicilio' && <div className="fila"><span>Domicilio{zona ? ` (${zona.nombre})` : ''}</span><span>{zona ? dinero(costoDom) : '—'}</span></div>}
                      <div className="fila"><span className="total">Total</span><span className="total">{dinero(t.total)}</span></div>
                      {m.personas > 1 && <div className="fila muted"><span>Por persona</span><span>{dinero(t.porPersona)} ({m.personas} personas)</span></div>}
                    </>
                  ) : (
                    <div className="fila"><span>Mesa para {m.personas}</span><span>{diaResObj ? fechaBonita(diaResObj) : 'Escoge el día'}{d.horaRes ? ` · ${horaBonita(d.horaRes)}` : ''}</span></div>
                  )}
                  <a className="btn btn-pri" href={valido ? waEntreverde(mensaje) : undefined} target="_blank" rel="noopener" aria-disabled={!valido} role="button" onClick={enviar} style={valido ? undefined : { opacity: 0.55 }}>
                    <Ico.wa /> {modo === 'reservar' ? 'Enviar reserva por WhatsApp' : 'Enviar pedido por WhatsApp'}
                  </a>
                  {!valido && intento && <span className="error" style={{ textAlign: 'center' }}>Revisa lo que está marcado arriba.</span>}
                  {!valido && !intento && <span className="ayuda" style={{ textAlign: 'center' }}>Completa los datos y te lo mandamos ordenadito a WhatsApp.</span>}
                </div>
              </>
            ) : (
              <div className="panel-cuerpo" data-lenis-prevent style={{ justifyItems: 'center', textAlign: 'center', paddingTop: 12 }}>
                <svg className="check-anim" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="none" stroke="var(--c-oliva)" strokeWidth="3" /><path d="m25 41 10 10 21-22" fill="none" stroke="var(--c-oliva-profundo)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <h3 className="t-sub" style={{ fontSize: 28 }}>¡Listo! Pedido {num}</h3>
                <p className="muted" style={{ margin: 0 }}>Abrimos WhatsApp con tu {modo === 'reservar' ? 'reserva' : 'pedido'}. Solo dale enviar y Entreverde te confirma.</p>
                <pre ref={preRef} className="msg-pre" style={{ textAlign: 'left', width: '100%' }}>{mensaje}</pre>
                <p className="t-sm muted" style={{ margin: 0 }}>¿WhatsApp no se abrió? Copia el mensaje y mándalo al {CONFIG.telefonoVisible}.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-sec btn-sm" onClick={async () => setCopiado(await copiar(mensaje, preRef.current) ? 'ok' : 'sel')}><Ico.copiar /> {copiado === 'ok' ? 'Copiado' : copiado === 'sel' ? 'Seleccionado, copia con Ctrl+C' : 'Copiar'}</button>
                  <a className="btn btn-sec btn-sm" href={waEntreverde(mensaje)} target="_blank" rel="noopener"><Ico.wa /> Abrir de nuevo</a>
                  <a className="btn btn-pri btn-sm" href={waLink(mensajeParche(m))} target="_blank" rel="noopener" onClick={(e) => onCompartir(e, mensajeParche(m))}><Ico.compartir /> Compartir con el parche</a>
                </div>
                <div style={{ display: 'grid', gap: 8, marginTop: 10, width: '100%' }}>
                  {!vaciarSeguro ? (
                    <button type="button" className="btn btn-sec" onClick={() => setVaciarSeguro(true)}>Hacer otro pedido</button>
                  ) : (
                    <div className="aviso" style={{ display: 'grid', gap: 10, textAlign: 'left' }}>
                      <span>¿Vaciamos la mesa para empezar de cero? Los nombres y las personas se quedan.</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" className="btn btn-pri btn-sm" onClick={() => { acciones.vaciar(); setNum(numeroPedido()); setPaso('form'); setVaciarSeguro(false); }}>Sí, vaciar</button>
                        <button type="button" className="btn btn-sec btn-sm" onClick={() => { setNum(numeroPedido()); setPaso('form'); setVaciarSeguro(false); }}>No, conservarla</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
