import { useEffect, useRef, useState } from 'react';
import SplitType from 'split-type';
import { SUN } from '../lib/geometry.js';
import { gsap, prefersReducedMotion, getLenis } from '../lib/motion.js';

function markReady() {
  window.__tramontoReady = true;
  window.dispatchEvent(new Event('tramonto:ready'));
  getLenis()?.start();
}

/** 00 — Preloader: el sol del logo se construye y se pone (máx. 2.2 s). */
export default function Preloader() {
  const [done, setDone] = useState(() => prefersReducedMotion());
  const root = useRef(null);

  useEffect(() => {
    if (done) { markReady(); return; }
    const el = root.current;
    getLenis()?.stop();
    window.scrollTo(0, 0);
    const q = (s) => el.querySelectorAll(s);
    const split = new SplitType(el.querySelector('[data-word]'), { types: 'chars' });
    const clock = el.querySelector('[data-clock]');
    const time = { m: 17 * 60 };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { setDone(true); },
    });
    tl.set(q('[data-ray]'), { scale: 0, svgOrigin: '0 0' })
      .to(q('[data-ray]'), { scale: 1, duration: 0.28, stagger: 0.008, ease: 'back.out(2)' }, 0)
      .fromTo(q('[data-disc]'), { scale: 0.35, opacity: 0, svgOrigin: '0 0' }, { scale: 1, opacity: 1, svgOrigin: '0 0', duration: 0.45, ease: 'back.out(1.6)' }, 0.42)
      .to(q('[data-white]'), { opacity: 1, duration: 0.25 }, 0.68)
      .fromTo(q('[data-ring]'), { rotation: -140, scale: 1.3, opacity: 0, svgOrigin: '0 0' }, { rotation: 0, scale: 1, opacity: 1, svgOrigin: '0 0', duration: 0.75, ease: 'back.out(2.4)' }, 0.66)
      .from(split.chars, { yPercent: 110, opacity: 0, duration: 0.5, stagger: 0.045 }, 0.5)
      .fromTo(q('[data-sub]'), { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45 }, 0.92)
      .to(time, {
        m: 18 * 60 + 30, duration: 1.4, ease: 'power1.inOut',
        onUpdate: () => {
          const m = Math.round(time.m / 5) * 5;
          clock.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        },
      }, 0.05)
      .to(q('[data-text]'), { y: -16, opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.45)
      .to(q('[data-sunwrap]'), { yPercent: 160, duration: 0.6, ease: 'power3.in' }, 1.45)
      .to(q('[data-gold]'), { opacity: 1, duration: 0.45, ease: 'power1.inOut' }, 1.5)
      .to(el, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 1.9);

    return () => { tl.kill(); split.revert(); };
  }, [done]);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-crema overflow-hidden" role="status" aria-label="Cargando Tramonto di Santa Elena">
      <div data-gold className="absolute inset-0 opacity-0" style={{ background: 'linear-gradient(180deg,#F6B547 0%,#F8A85B 100%)' }} />
      <div data-sunwrap className="relative w-[min(56vw,260px)] aspect-square">
        <svg viewBox="-100 -100 200 200" className="w-full h-full overflow-visible" aria-hidden="true">
          <g data-ring style={{ opacity: 0 }}>
            <polygon points={SUN.ringOuter} fill="#E6401C" />
            <polygon points={SUN.ringWhite} fill="#FFF8EE" />
            <polygon points={SUN.ringOrange} fill="#EB7126" />
          </g>
          <circle data-disc r="82" fill="#EB7126" style={{ opacity: 0 }} />
          <g>{SUN.rayList.map((d, i) => <path key={i} data-ray d={d} fill="#EB7126" />)}</g>
          <g data-white style={{ opacity: 0 }}>
            <path d={SUN.rays} fill="#FFFFFF" />
            <circle r={SUN.centerR} fill="#FFFFFF" />
          </g>
        </svg>
      </div>
      <div data-text className="relative mt-8 text-center">
        <p data-word className="font-italiana text-terracota text-[clamp(48px,9vw,76px)] leading-none overflow-hidden pb-1">Tramonto</p>
        <p data-sub className="font-italiana text-teja text-[22px] mt-1 opacity-0" style={{ paddingLeft: "3.6em" }}>di santa elena</p>
      </div>
      <p data-text className="t-mono absolute bottom-10 text-teja !text-[13px]">
        Ore <span data-clock className="tabular-nums">17:00</span>
      </p>
    </div>
  );
}
