import { CIFRAS } from '../data'
import { gsap, useMM, MOTION } from '../lib/motion'

/* 10 — CIFRAS. Solo se muestran las que tienen valor real (ver data.js). */
export default function Cifras() {
  const lista = CIFRAS.filter((c) => c.value != null)
  const ref = useMM((mm) => {
    mm.add(MOTION, () => {
      gsap.utils.toArray('.cf-n').forEach((el) => {
        const fin = +el.dataset.v
        const o = { v: 0 }
        gsap.to(o, { v: fin, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = Math.round(o.v) } })
      })
      gsap.from('.cf-sep', { scaleY: 0, transformOrigin: 'top', duration: 1.2, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: { trigger: '.cf-grid', start: 'top 80%' } })
      gsap.from('.cf-sep-h', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: { trigger: '.cf-grid', start: 'top 80%' } })
    })
  }, [])
  return (
    <section ref={ref} aria-label="Casa Amiga en cifras" className="bg-hueso py-20 sm:py-28">
      <div className="wrap">
        <p className="eyebrow mb-10">10 — En cifras</p>
        <div className="cf-grid grid sm:grid-flow-col sm:auto-cols-fr">
          {lista.map((c, i) => (
            <div key={c.label} className="relative py-8 sm:px-10 sm:py-2 first:sm:pl-0">
              {i > 0 && <span aria-hidden="true" className="cf-sep absolute inset-y-0 left-0 hidden w-px bg-canela sm:block" />}
              {i > 0 && <span aria-hidden="true" className="cf-sep-h absolute inset-x-0 top-0 h-px bg-canela sm:hidden" />}
              <p className="titulo text-[clamp(5rem,12vw,11rem)] text-canela"><span className="cf-n" data-v={c.value}>{c.value}</span></p>
              <p className="mt-2 max-w-[16rem] text-lg text-tinta/80">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
