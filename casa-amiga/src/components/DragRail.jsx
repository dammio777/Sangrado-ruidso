import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { Arrow } from './Icons'

/** Carril arrastrable con inercia (framer-motion) + flechas. */
export default function DragRail({ children, label, className = '' }) {
  const outer = useRef(null)
  const inner = useRef(null)
  const x = useMotionValue(0)
  const [min, setMin] = useState(0)

  useEffect(() => {
    const calc = () => setMin(Math.min(0, outer.current.offsetWidth - inner.current.scrollWidth))
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(outer.current); ro.observe(inner.current)
    return () => ro.disconnect()
  }, [])

  const paso = (dir) => {
    const w = outer.current.offsetWidth * 0.8
    animate(x, Math.max(min, Math.min(0, x.get() - dir * w)), { type: 'spring', stiffness: 160, damping: 26 })
  }

  return (
    <div className={className}>
      <div ref={outer} className="overflow-hidden" role="region" aria-label={label}>
        <motion.div
          ref={inner}
          className="flex w-max cursor-grab gap-5 pb-6 active:cursor-grabbing sm:gap-7"
          style={{ x }}
          drag={min < 0 ? 'x' : false}
          dragConstraints={{ left: min, right: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.3, timeConstant: 260 }}
        >
          {children}
        </motion.div>
      </div>
      {min < 0 && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => paso(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-canela/30 text-canela transition-colors hover:bg-canela hover:text-white" aria-label="Anterior"><Arrow dir="left" /></button>
          <button type="button" onClick={() => paso(1)} className="grid h-12 w-12 place-items-center rounded-full border border-canela/30 text-canela transition-colors hover:bg-canela hover:text-white" aria-label="Siguiente"><Arrow /></button>
        </div>
      )}
    </div>
  )
}
