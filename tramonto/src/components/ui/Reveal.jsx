import { createElement, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

/**
 * Titular revelado palabra por palabra con máscara.
 * `lines`: arreglo de líneas (cada una se parte en palabras).
 */
export function MaskWords({ as = 'h2', lines, className = '', wordClass = '', trigger = 'scroll', delay = 0, stagger = 0.06, start = 'top 85%', id }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const words = el.querySelectorAll('[data-w]');
    gsap.set(words, { yPercent: 115 });
    let tl;
    if (trigger === 'scroll') {
      tl = gsap.to(words, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger, delay, scrollTrigger: { trigger: el, start, once: true } });
    } else {
      const play = () => { tl = gsap.to(words, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger, delay }); };
      if (window.__tramontoReady) play(); else window.addEventListener('tramonto:ready', play, { once: true });
      return () => { window.removeEventListener('tramonto:ready', play); tl?.kill(); };
    }
    return () => { tl?.scrollTrigger?.kill(); tl?.kill(); };
  }, [trigger, delay, stagger, start]);

  const arr = Array.isArray(lines) ? lines : [lines];
  return createElement(
    as,
    { ref, className, id },
    arr.map((line, li) => (
      <span key={li} className="block">
        {(typeof line === 'string' ? line.split(' ') : [line]).map((w, wi, all) => (
          <span key={wi} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
            <span data-w className={`inline-block will-change-transform ${wordClass}`}>{w}{wi < all.length - 1 ? ' ' : ''}</span>
          </span>
        ))}
      </span>
    )),
  );
}

/** Aparición suave (fade + subida) al entrar en pantalla. */
export function FadeUp({ as = 'div', children, className = '', delay = 0, y = 28, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const t = gsap.from(el, { y, opacity: 0, duration: 1, delay, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); gsap.set(el, { clearProps: 'all' }); };
  }, [delay, y]);
  return createElement(as, { ref, className, ...rest }, children);
}
