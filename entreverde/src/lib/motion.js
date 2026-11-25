import { useEffect, useRef, useState } from 'react';
import { reducido } from './util.js';

export const SPRING = { type: 'spring', stiffness: 260, damping: 28 };
export const SPRING_POP = { type: 'spring', stiffness: 420, damping: 26 };
export const EASE_OUT = [0.22, 1, 0.36, 1];

export function useReduced() {
  const [r, setR] = useState(reducido());
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(mq.matches);
    mq.addEventListener?.('change', f);
    return () => mq.removeEventListener?.('change', f);
  }, []);
  return r;
}

export function useMedia(q) {
  const [m, setM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const mq = matchMedia(q);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener?.('change', f);
    return () => mq.removeEventListener?.('change', f);
  }, [q]);
  return m;
}

/* Visible + pestaña activa (para pausar loops). */
export function useVisible(ref, { rootMargin = '0px', threshold = 0, once = false } = {}) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setV(e.isIntersecting);
      if (e.isIntersecting && once) io.disconnect();
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return v;
}
export function usePestana() {
  const [ok, setOk] = useState(typeof document === 'undefined' ? true : !document.hidden);
  useEffect(() => {
    const f = () => setOk(!document.hidden);
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  return ok;
}

/* Reveal: solo oculta lo que está DEBAJO de la pantalla al cargar. Nunca lo que ya se ve. */
export function useReveal(opts = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducido()) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92) return; // ya está en pantalla
    el.classList.add('rv-wait');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('rv-in');
        io.disconnect();
        setTimeout(() => el.classList.remove('rv-wait', 'rv-in'), 1200);
      }
    }, { rootMargin: opts.rootMargin || '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
