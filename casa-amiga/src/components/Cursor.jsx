import { useEffect, useRef, useState } from 'react'
import { gsap, finePointer, prefersReduced } from '../lib/motion'

/* Cursor personalizado (solo desktop). Elementos con data-cursor="ver" lo convierten en círculo ámbar con texto. */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const [on, setOn] = useState(false)
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!finePointer() || prefersReduced()) return
    setOn(true)
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12 })
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.12 })
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    const move = (e) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY) }
    const over = (e) => {
      const t = e.target.closest?.('[data-cursor]')
      setLabel(t ? t.dataset.cursor : '')
      setHover(!t && !!e.target.closest?.('a,button,[role="button"],input,select,textarea,label'))
    }
    const out = () => { gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 }) }
    const inn = () => { gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 }) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    document.documentElement.addEventListener('pointerleave', out)
    document.documentElement.addEventListener('pointerenter', inn)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', out)
      document.documentElement.removeEventListener('pointerenter', inn)
    }
  }, [])

  const big = !!label
  return (
    <div aria-hidden="true" className={on ? '' : 'hidden'}>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[95]">
        <div
          className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out ${
            big ? 'h-24 w-24 border-transparent bg-ambar' : hover ? 'h-14 w-14 border border-canela/50 bg-ambar/10' : 'h-9 w-9 border border-canela/40'
          }`}
        >
          <span className={`cedula text-tinta transition-opacity duration-200 ${big ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
        </div>
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[96]">
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canela transition-opacity ${big ? 'opacity-0' : ''}`} />
      </div>
    </div>
  )
}
