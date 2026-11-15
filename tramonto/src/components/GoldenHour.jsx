import { useEffect, useMemo, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion.js';
import { useIsDesktop, useReducedMotion } from '../hooks/useMedia.js';
import { goldenHour, media, tones } from '../data/site.js';
import { zigzagUriV, rng } from '../lib/geometry.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import ArchFrame from './ui/ArchFrame.jsx';

function PanelStars() {
  const s = useMemo(() => { const r = rng(55); return Array.from({ length: 34 }, () => [r() * 100, r() * 70, 1.2 + r() * 2.2, -r() * 4]); }, []);
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {s.map(([l, t, z, d], i) => (
        <span key={i} data-pstar className="absolute" style={{ left: `${l}%`, top: `${t}%` }}>
          <span className="twinkle block rounded-full bg-crema" style={{ width: z, height: z, '--o': 0.75, '--delay': `${d}s` }} />
        </span>
      ))}
    </div>
  );
}

function Panel({ p, i, horizontal }) {
  const tone = tones[p.bg];
  const dark = tone.fg !== '#2A1410';
  return (
    <article data-panel className={`relative shrink-0 overflow-hidden ${horizontal ? 'w-screen h-full' : 'min-h-[92svh] py-28'} ${dark ? 'on-dark' : ''}`}
      style={{ background: tone.bg, color: tone.fg }} aria-label={`Ore ${p.hour}: ${p.verb}`}>
      {!horizontal && <ZigzagEdge color={tone.bg} line={i === 0 ? 'rojo' : 'rojo'} />}
      {horizontal && i > 0 && (
        <div aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-[14px] z-[2]"
          style={{ backgroundImage: zigzagUriV({ fill: tones[goldenHour[i - 1].bg].bg }), backgroundSize: '14px 24px', transform: 'scaleX(-1)' }} />
      )}
      {p.night && <PanelStars />}
      <div data-bighour aria-hidden="true"
        className="absolute left-1/2 top-1/2 font-italiana leading-none whitespace-nowrap pointer-events-none select-none"
        style={{ fontSize: 'clamp(160px, 34vw, 560px)', color: dark ? 'rgba(255,248,238,.07)' : 'rgba(42,20,16,.08)', transform: horizontal ? undefined : 'translate(-50%, -50%)' }}>
        {p.hour}
      </div>
      <div className={`relative z-[1] container-page h-full grid md:grid-cols-12 gap-10 items-center ${horizontal ? 'pt-24' : ''}`}>
        <div className="md:col-span-6 lg:col-span-6">
          <p className="t-mono !text-[13px] flex items-center gap-3">
            <span>Ore {p.hour}</span><span aria-hidden="true" className="w-10 h-[1.5px] bg-current" /><span>0{i + 1} / 04</span>
          </p>
          <h3 className="t-display uppercase text-[clamp(64px,9vw,148px)] mt-4">{p.verb}</h3>
          <p className="t-lead mt-6 max-w-[420px]">{p.text}</p>
          {p.night && <p className="t-script text-dorado mt-6 -rotate-3">buonanotte, amici</p>}
        </div>
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 flex justify-center">
          <ArchFrame media={media[p.media]} className={`w-[min(78vw,400px)] ${horizontal ? 'h-[min(62vh,540px)]' : 'aspect-[3/4]'}`} reveal={!horizontal} />
        </div>
      </div>
    </article>
  );
}

/** 05 — La hora dorada: 4 paneles, del dorado de las 16:00 a la noche de las 19:00. */
export default function GoldenHour() {
  const desktop = useIsDesktop();
  const rm = useReducedMotion();
  const horizontal = desktop && !rm;
  const pin = useRef(null);
  const track = useRef(null);
  const arcSun = useRef(null);
  const overlay = useRef(null);

  useEffect(() => {
    if (!horizontal || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const t = track.current;
      const dist = () => t.scrollWidth - window.innerWidth;
      const sunEl = arcSun.current;
      const placeSun = (p) => {
        const a = gsap.utils.interpolate(150, -12, p) * (Math.PI / 180);
        gsap.set(sunEl, { x: 110 + Math.cos(a) * 100, y: 104 - Math.sin(a) * 92 });
      };
      placeSun(0);
      const tween = gsap.to(t, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: pin.current, pin: true, scrub: 1, start: 'top top', end: () => `+=${dist()}`, invalidateOnRefresh: true,
          onUpdate: (self) => {
            placeSun(self.progress);
            overlay.current?.classList.toggle('is-night', self.progress > 0.84);
          },
        },
      });
      t.querySelectorAll('[data-panel]').forEach((panel, idx) => {
        gsap.fromTo(panel.querySelector('[data-bighour]'), { xPercent: -30, yPercent: -50 }, {
          xPercent: -70, yPercent: -50, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
        const frame = panel.querySelector('.arch');
        if (idx > 0) gsap.fromTo(panel.querySelectorAll('h3, .t-lead'), { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
        });
        if (frame) gsap.fromTo(frame, { yPercent: 8, rotate: 3 }, { yPercent: -8, rotate: -3, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      const stars = t.querySelectorAll('[data-pstar]');
      gsap.fromTo(stars, { opacity: 0 }, { opacity: 1, stagger: { each: 0.03, from: 'random' }, scrollTrigger: { trigger: t.lastElementChild, containerAnimation: tween, start: 'left 60%', end: 'left 0%', scrub: true } });
    }, pin);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [horizontal]);

  if (!horizontal) {
    return (
      <section id="la-casa" aria-labelledby="hora-t" className="relative z-10">
        <h2 id="hora-t" className="sr-only">La hora dorada: de las 16:00 a las 19:00</h2>
        {goldenHour.map((p, i) => <Panel key={p.hour} p={p} i={i} horizontal={false} />)}
      </section>
    );
  }

  return (
    <section id="la-casa" aria-labelledby="hora-t" className="relative z-10">
      <ZigzagEdge color="dorado" line="rojo" />
      <div ref={pin} className="relative h-svh overflow-hidden">
        <div ref={track} className="flex h-full w-max will-change-transform">
          {goldenHour.map((p, i) => <Panel key={p.hour} p={p} i={i} horizontal />)}
        </div>
        <div ref={overlay} className="golden-overlay absolute top-0 inset-x-0 z-10 pointer-events-none pt-24">
          <div className="container-page flex items-start justify-between">
            <h2 id="hora-t" className="t-sub">La hora dorada</h2>
            <div className="relative w-[220px] h-[120px]" aria-hidden="true">
              <svg viewBox="0 0 220 120" className="absolute inset-0 w-full h-full overflow-visible">
                <path d="M10 104 A 100 92 0 0 1 210 104" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" opacity=".55" />
                <line x1="0" y1="104" x2="220" y2="104" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
              </svg>
              <div ref={arcSun} className="absolute left-0 top-0 -ml-[13px] -mt-[13px] w-[26px] h-[26px] rounded-full bg-naranja" style={{ boxShadow: '0 0 0 3px #FFF8EE, 0 0 28px 8px rgba(246,181,71,.7)' }} />
              <div className="absolute left-0 right-0 top-[110px] flex justify-between t-mono !text-[10px]"><span>16</span><span>17</span><span>18</span><span>19</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
