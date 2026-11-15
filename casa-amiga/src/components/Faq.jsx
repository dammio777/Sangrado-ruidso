import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FAQ } from '../data'

/* 12 — LO QUE DEBES SABER ANTES DE VENIR */
export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-hueso py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4">12 — Antes de venir</p>
          <h2 className="titulo text-[clamp(2.8rem,5.5vw,5.6rem)] text-tinta">Lo que debes saber</h2>
        </div>
        <ul className="lg:col-span-7">
          {FAQ.map((f, i) => {
            const on = open === i
            return (
              <li key={f.q} className="border-b border-canela/20">
                <h3>
                  <button type="button" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} aria-controls={`faq-${i}`} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                    <span className="font-display text-xl font-bold text-tinta sm:text-2xl">{f.q}</span>
                    <span aria-hidden="true" className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl leading-none transition-all duration-500 ${on ? 'rotate-45 bg-ambar text-tinta' : 'border border-canela/30 text-canela'}`}>+</span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 text-tinta/80">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
