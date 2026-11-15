import { VISITAS } from '../data'
import DragRail from './DragRail'

/* 11 — LIBRO DE VISITAS. PLACEHOLDER: reemplazar en data.js por reseñas reales. */
export default function LibroVisitas() {
  return (
    <section id="visitas" className="overflow-hidden bg-blanco py-24 sm:py-32">
      <div className="wrap">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-4">11 — Libro de visitas</p>
            <h2 className="titulo text-[clamp(3rem,7vw,7rem)] text-tinta">Firmaron<br />al salir</h2>
          </div>
          <p className="max-w-md text-tinta/75 lg:justify-self-end">Notas de quienes ya subieron a la vereda. Arrastra para pasar las páginas.</p>
        </div>
        <DragRail label="Libro de visitas">
          {VISITAS.map((v, i) => (
            <figure key={i} className={`papel relative flex min-h-[300px] w-[min(82vw,400px)] shrink-0 flex-col justify-between rounded-[6px] border border-canela/10 p-8 pt-10 shadow-[0_20px_40px_-26px_rgba(43,26,18,.45)] ${i % 2 ? 'rotate-[1.2deg]' : '-rotate-[1deg]'}`}>
              <span aria-hidden="true" className="absolute inset-y-0 left-10 w-px bg-ambar/40" />
              {v.placeholder && <span className="cedula absolute right-4 top-3 rounded bg-ambar px-2 py-0.5 text-[0.62rem] text-tinta">Placeholder</span>}
              <blockquote className="pl-6 font-script text-[2rem] leading-[1.12] text-canela">“{v.cita}”</blockquote>
              <figcaption className="cedula mt-6 pl-6 text-tinta/70">— {v.nombre} · {v.origen}</figcaption>
            </figure>
          ))}
        </DragRail>
      </div>
    </section>
  )
}
