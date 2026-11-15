import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { ZigzagEdge, ZigzagStrip } from './ui/Zigzag.jsx';
import Sun from './art/Sun.jsx';

const WORDS = ['Pizza', 'Pasta', 'Dolci', 'Cocktails', 'Pet friendly', 'Jueves a domingo', 'Santa Elena'];

function Row() {
  return (
    <div className="flex items-center shrink-0" aria-hidden="true">
      {WORDS.map((w) => (
        <div key={w} className="flex items-center">
          <span className="font-italiana uppercase text-[clamp(44px,7vw,104px)] leading-none px-[0.35em] text-espresso">{w}</span>
          <Sun spin className="w-[clamp(40px,5vw,72px)] h-[clamp(40px,5vw,72px)] shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** 03 — Cinta infinita que acelera y se inclina con la velocidad del scroll. */
export default function Marquee() {
  const track = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = track.current;
    let x = 0, dir = -1, skew = 0, lastY = window.scrollY, vel = 0;
    const setX = gsap.quickSetter(el, 'x', 'px');
    const setSkew = gsap.quickSetter(el, 'skewX', 'deg');
    const tick = (time, dt) => {
      const y = window.scrollY;
      const dy = y - lastY; lastY = y;
      vel += (dy - vel) * 0.18;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? -1 : 1;
      const half = el.scrollWidth / 2;
      x += dir * (0.06 + Math.min(Math.abs(vel) * 0.012, 0.9)) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      skew += (gsap.utils.clamp(-12, 12, -vel * 0.35) - skew) * 0.12;
      setX(x); setSkew(skew);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <section aria-label="Pizza, pasta, dolci, cocktails, pet friendly, de jueves a domingo en Santa Elena" className="relative z-10 bg-naranja py-10 md:py-14 overflow-hidden">
      <ZigzagEdge color="naranja" line="rojo" />
      <div ref={track} className="flex w-max will-change-transform">
        <Row /><Row />
      </div>
      <ZigzagStrip color="rojo" className="absolute left-0 right-0 bottom-3" />
    </section>
  );
}
