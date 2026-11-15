import { useRef } from 'react'
import { gsap, finePointer, prefersReduced } from '../lib/motion'

/** Envuelve un botón/enlace y lo atrae suavemente hacia el cursor. */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    if (!finePointer() || prefersReduced()) return
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4, ease: 'power3.out' })
  }
  const leave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' })
  return (
    <span ref={ref} onMouseMove={move} onMouseLeave={leave} className={`inline-block ${className}`}>
      {children}
    </span>
  )
}
