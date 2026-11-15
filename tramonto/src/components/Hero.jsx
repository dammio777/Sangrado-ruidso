import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToId } from '../lib/motion.js';
import { useReducedMotion } from '../hooks/useMedia.js';
import { SUN, rng } from '../lib/geometry.js';
import { SunRing } from './art/Sun.jsx';
import { PizzaTop } from './art/Pizza.jsx';
import { far, mid, near, cabin, W, H, CABIN_X } from './art/scene.js';
import Magnetic from './ui/Magnetic.jsx';
import { SunIcon } from './art/Sun.jsx';
import { goBooking } from './Navbar.jsx';

const SKY = [
  'linear-gradient(180deg, #F6B547 0%, #F7AE52 45%, #F8A85B 75%, #EB7126 100%)', // tarde
  'linear-gradient(180deg, #F8A85B 0%, #EB7126 55%, #E6401C 100%)', // hora dorada
  'linear-gradient(180deg, #C24E35 0%, #E6401C 38%, #EB7126 66%, #F6B547 100%)', // atardecer
  'linear-gradient(180deg, #2A1410 0%, #3B1D17 28%, #8A2F0C 54%, #E6401C 72%, #EB7126 88%)', // crepúsculo
];

const SET_X = 720;

function Mountains({ rm }) {
  const nightStyle = { opacity: rm ? 1 : 0 };
  return (
    <div data-mountains className="absolute inset-x-0 bottom-0 h-[46%] pointer-events-none">
      <svg data-far viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d={far.d} fill="#C24E35" />
        <path data-night d={far.d} fill="#5E2210" style={nightStyle} />
      </svg>
      <div data-mist className="absolute inset-x-[-10%] top-[46%] h-[16%] drift" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,248,238,.42), rgba(255,248,238,0) 70%)' }} />
      <svg data-mid viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d={mid.d} fill="#8A2F0C" />
        <path data-night d={mid.d} fill="#3B1D17" style={nightStyle} />
      </svg>
      <div data-mist className="absolute inset-x-[-10%] top-[64%] h-[14%] drift" style={{ animationDelay: '-6s', background: 'radial-gradient(50% 50% at 40% 50%, rgba(255,248,238,.3), rgba(255,248,238,0) 70%)' }} />
      <svg data-near viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="winGlow"><stop offset="0" stopColor="#F6B547" stopOpacity=".75" /><stop offset="1" stopColor="#F6B547" stopOpacity="0" /></radialGradient>
        </defs>
        <path d={near.d} fill="#3B1D17" />
        <path d={cabin.roof} fill="#3B1D17" />
        <path d={cabin.body} fill="#3B1D17" />
        <path d={cabin.gable} fill="#3B1D17" />
        <path d={cabin.chimney} fill="#3B1D17" />
        <g data-night style={nightStyle}>
          <path d={near.d} fill="#2A1410" />
          <path d={cabin.roof} fill="#2A1410" /><path d={cabin.body} fill="#2A1410" /><path d={cabin.gable} fill="#2A1410" /><path d={cabin.chimney} fill="#2A1410" />
        </g>
        {/* tablas de madera de la cabaña */}
        <g stroke="#8A2F0C" strokeOpacity=".35" strokeWidth="1">
          {[0, 1, 2, 3].map((i) => <line key={i} x1={CABIN_X - 78} x2={CABIN_X + 58} y1={cabin.ground - 12 - i * 12} y2={cabin.ground - 12 - i * 12} />)}
        </g>
        <g fill="#FFF8EE" opacity=".45">
          {[0, 1, 2].map((i) => <circle key={i} cx={cabin.smoke.x} cy={cabin.smoke.y} r={5 + i} style={{ animation: `smoke 4.5s ${i * 1.5}s ease-out infinite`, transformBox: 'fill-box', transformOrigin: 'center' }} />)}
        </g>
        {cabin.windows.map((w, i) => (
          <g key={i} data-win style={{ opacity: rm ? 1 : 0 }}>
            <circle cx={w.kind === 'tri' ? w.x : w.x + w.w / 2} cy={w.kind === 'tri' ? w.y + 6 : w.y + w.h / 2} r={w.kind === 'door' ? 30 : 26} fill="url(#winGlow)" />
            {w.kind === 'tri' ? (
              <path d={`M${w.x} ${w.y - 14} L${w.x + 16} ${w.y + 14} L${w.x - 16} ${w.y + 14} Z`} fill="#F6B547" />
            ) : (
              <rect x={w.x} y={w.y} width={w.w} height={w.h} rx="2" fill="#F6B547" />
            )}
            {w.kind === 'rect' && <path d={`M${w.x + w.w / 2} ${w.y} V${w.y + w.h} M${w.x} ${w.y + w.h / 2} H${w.x + w.w}`} stroke="#8A2F0C" strokeWidth="1.6" />}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Stars({ rm }) {
  const stars = useMemo(() => {
    const r = rng(101);
    return Array.from({ length: 58 }, () => ({
      left: r() * 100, top: r() * 52, size: 1.4 + r() * 2.4, big: r() > 0.9, o: 0.45 + r() * 0.5, d: 2.4 + r() * 3, delay: -r() * 4,
    }));
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} data-star className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%`, opacity: rm ? 1 : 0 }}>
          {s.big ? (
            <svg viewBox="-10 -10 20 20" className="twinkle w-[14px] h-[14px]" style={{ '--o': s.o, '--d': `${s.d}s`, '--delay': `${s.delay}s` }}>
              <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2Z" fill="#FFF8EE" />
            </svg>
          ) : (
            <span className="twinkle block rounded-full bg-crema" style={{ width: s.size, height: s.size, '--o': s.o, '--d': `${s.d}s`, '--delay': `${s.delay}s` }} />
          )}
        </span>
      ))}
    </div>
  );
}

export default function Hero() {
  const root = useRef(null);
  const stage = useRef(null);
  const rm = useReducedMotion();

  /* Intro tras el preloader */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = stage.current;
    const words = el.querySelectorAll('[data-w]');
    const fades = el.querySelectorAll('[data-intro]');
    gsap.set(words, { yPercent: 115 });
    gsap.set(fades, { y: 24, opacity: 0 });
    gsap.set(el.querySelector('[data-hello]'), { opacity: 0, rotate: -18, scale: 0.8 });
    const play = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to(words, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.05)
        .to(el.querySelector('[data-hello]'), { opacity: 1, rotate: -9, scale: 1, duration: 1, ease: 'back.out(2)' }, 0.55)
        .to(el.querySelector('[data-underline]'), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.8)
        .to(fades, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.6);
    };
    if (window.__tramontoReady) play(); else window.addEventListener('tramonto:ready', play, { once: true });
    return () => window.removeEventListener('tramonto:ready', play);
  }, []);

  /* EFECTO ESTRELLA: el sol baja, se vuelve pizza y sube como una luna */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = stage.current;
    const q = (s) => el.querySelector(s);
    const qa = (s) => el.querySelectorAll(s);
    const wrap = q('[data-sunwrap]');

    const geo = () => {
      const h = el.offsetHeight;
      const sunC = wrap.offsetTop + wrap.offsetHeight / 2;
      const R = wrap.offsetHeight / 2;
      const svg = q('[data-far]');
      const pt = svg.createSVGPoint();
      pt.x = SET_X; pt.y = far.y(SET_X);
      const sp = pt.matrixTransform(svg.getScreenCTM());
      const crest = q('[data-mountains]').offsetTop + (sp.y - svg.getBoundingClientRect().top);
      return { set: crest - sunC + R * 0.12, moon: h * 0.25 - sunC };
    };
    let g = geo();

    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
      const { desktop } = ctx.conditions;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: desktop ? '+=240%' : 'bottom bottom',
          scrub: desktop ? 1 : 0.5,
          pin: desktop ? stage.current : false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => { gsap.set(wrap, { y: 0, scale: 1 }); g = geo(); },
        },
      });
      // 0 — el texto se va, el indicador desaparece
      tl.to(q('[data-content]'), { yPercent: -18, opacity: 0, duration: 0.14, ease: 'power1.in' }, 0)
        .to(q('[data-haze]'), { opacity: 0, duration: 0.16 }, 0)
        .to(q('[data-indicator]'), { opacity: 0, duration: 0.05 }, 0)
        // 1 — el sol baja detrás de las montañas, el cielo pasa de dorado a cacao
        .to(wrap, { y: () => g.set, scale: 0.94, duration: 0.46, ease: 'power1.inOut' }, 0.04)
        .to(q('[data-sky="1"]'), { opacity: 1, duration: 0.2 }, 0.06)
        .to(q('[data-sky="2"]'), { opacity: 1, duration: 0.22 }, 0.26)
        .to(q('[data-sky="3"]'), { opacity: 1, duration: 0.24 }, 0.5)
        .to(q('[data-sunglow]'), { opacity: 0.25, scale: 1.25, duration: 0.5 }, 0.04)
        .to(q('[data-rays]'), { rotation: 90, svgOrigin: '0 0', duration: 0.5 }, 0)
        .to(q('[data-far]'), { y: -10, duration: 1 }, 0)
        .to(q('[data-near]'), { y: 26, duration: 1 }, 0)
        .to(qa('[data-mist]'), { xPercent: -6, duration: 1 }, 0)
        .to(qa('[data-night]'), { opacity: 1, duration: 0.3, stagger: 0.04 }, 0.48)
        // 2 — al tocar la cresta: el disco se vuelve PIZZA (crossfade con rotación)
        .to(q('[data-sunbody]'), { opacity: 0, rotation: 110, svgOrigin: '0 0', duration: 0.1 }, 0.5)
        .fromTo(q('[data-pizza]'), { opacity: 0, rotation: -110, svgOrigin: '0 0' }, { opacity: 1, rotation: 0, svgOrigin: '0 0', duration: 0.1 }, 0.5)
        .to(q('[data-ring]'), { rotation: 45, svgOrigin: '0 0', duration: 0.2 }, 0.5)
        // …y sube y queda flotando como una luna
        .to(wrap, { y: () => g.moon, scale: 0.52, duration: 0.3, ease: 'power2.out' }, 0.6)
        .to(q('[data-moonglow]'), { opacity: 1, duration: 0.25 }, 0.62)
        // 3 — estrellas y ventanas de la cabaña
        .to(qa('[data-star]'), { opacity: 1, duration: 0.04, stagger: { each: 0.0035, from: 'random' } }, 0.64)
        .to(qa('[data-win]'), { opacity: 1, duration: 0.025, stagger: 0.035 }, 0.72)
        // 4 — remate: "il tramonto più buono"
        .to(q('[data-note]'), { opacity: 1, y: 0, duration: 0.08 }, 0.86)
        .to(q('[data-arrow]'), { strokeDashoffset: 0, duration: 0.1 }, 0.88)
        .to({}, { duration: 0.04 });
      return () => {};
    });
    return () => mm.revert();
  }, []);

  const title = [['Un', 'pedacito'], ['de', 'Italia'], ['en', 'Santa', 'Elena.']];

  return (
    <section id="top" ref={root} aria-label="Bienvenida" className={`relative ${rm ? '' : 'max-[899px]:h-[185svh]'}`}>
      <div ref={stage} className={`relative h-svh min-h-[560px] overflow-hidden ${rm ? '' : 'max-[899px]:sticky max-[899px]:top-0'}`}>
        {/* cielo: 4 capas que se funden (solo opacidad) */}
        {SKY.map((bg, i) => (
          <div key={i} data-sky={i} className="absolute inset-0 will-change-[opacity]" style={{ background: bg, opacity: i === 0 || (rm && i === 3) ? 1 : 0 }} />
        ))}
        <Stars rm={rm} />

        {/* sol → pizza */}
        <div data-sunwrap aria-hidden="true" className="absolute will-change-transform"
          style={rm
            ? { width: 'min(19vh, 170px)', height: 'min(19vh, 170px)', left: 'calc(50% - min(9.5vh, 85px))', top: 'calc(15vh - min(9.5vh, 85px) + 30px)' }
            : { width: 'min(54vh, 500px, 84vw)', height: 'min(54vh, 500px, 84vw)', left: 'calc(50% - min(27vh, 250px, 42vw))', top: 'calc(41% - min(27vh, 250px, 42vw))' }}>
          <div data-sunglow className="absolute inset-[-30%] rounded-full" style={{ opacity: rm ? 0 : 0.9, background: 'radial-gradient(closest-side, rgba(246,181,71,.9), rgba(246,181,71,.35) 55%, rgba(246,181,71,0))' }} />
          <div data-moonglow className="absolute inset-[-18%] rounded-full" style={{ opacity: rm ? 1 : 0, background: 'radial-gradient(closest-side, rgba(255,221,184,.55), rgba(246,181,71,.18) 60%, rgba(246,181,71,0))' }} />
          <svg viewBox="-100 -100 200 200" className="relative w-full h-full overflow-visible">
            <g data-ring><SunRing /></g>
            <g data-sunbody style={{ opacity: rm ? 0 : 1 }}>
              <circle r="82" fill="#EB7126" />
              <g data-rays><g className="spin-slower" style={{ transformBox: 'view-box', transformOrigin: '0px 0px' }}><path d={SUN.rays} fill="#FFFFFF" /></g></g>
              <circle r={SUN.centerR} fill="#FFFFFF" />
            </g>
            <g data-pizza style={{ opacity: rm ? 1 : 0 }}>
              <circle r="81" fill="#FFF8EE" />
              <circle r="77" fill="none" stroke="#F6B547" strokeWidth="2.5" />
              <PizzaTop />
            </g>
          </svg>
        </div>

        {/* bruma de la tarde sobre el sol: suaviza los rayos detrás del titular y se va con el texto */}
        {!rm && <div data-haze aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 52% at 50% 40%, rgba(248,190,110,.78), rgba(247,181,90,.55) 45%, rgba(246,181,71,0) 75%)' }} />}

        <Mountains rm={rm} />

        {/* nota final */}
        {!rm && <div data-note className="absolute z-20 left-[calc(50%+min(13vh,120px))] top-[9%] max-[899px]:left-[52%] max-[899px]:top-[5%] pointer-events-none"
          style={{ opacity: 0, transform: 'translateY(12px)' }} aria-hidden="true">
          <p className="t-script text-dorado -rotate-6 whitespace-nowrap !text-[clamp(32px,4vw,52px)]">il tramonto più buono</p>
          {(
            <svg viewBox="0 0 160 120" className="w-[clamp(90px,10vw,150px)] -mt-1 ml-2 overflow-visible" aria-hidden="true">
              <path data-arrow d="M120 6 C 110 60, 70 86, 14 92 M14 92 L 32 78 M14 92 L 30 106" fill="none" stroke="#F6B547" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
            </svg>
          )}
        </div>}

        {/* contenido */}
        <div data-content className={`relative z-10 h-full flex flex-col items-center text-center px-5 ${rm ? 'text-crema pt-[calc(15vh+min(9.5vh,85px)+56px)]' : 'text-espresso pt-[clamp(108px,15vh,150px)]'}`}>
          <div className="relative">
            <p data-hello className={`t-script absolute -top-[0.95em] md:-top-[0.35em] left-[2%] md:-left-[4%] -rotate-[9deg] ${rm ? 'text-dorado' : 'text-ladrillo'} !text-[clamp(36px,4.2vw,58px)]`} aria-hidden="true">buonasera</p>
            <h1 className={`t-display uppercase max-w-[12ch] md:max-w-none ${rm ? 'text-[clamp(44px,7vw,112px)]' : 'text-[clamp(46px,8.4vw,134px)]'}`} aria-label="Un pedacito de Italia en Santa Elena.">
              {title.map((line, li) => (
                <span key={li} className="block" aria-hidden="true">
                  {line.map((w, wi) => (
                    <span key={wi} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.06em', marginBottom: '-0.06em' }}>
                      <span data-w className="relative inline-block">
                        {w}
                        {w === 'Italia' && (
                          <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute left-[-4%] w-[108%] -bottom-[0.02em] h-[0.16em] overflow-visible" aria-hidden="true">
                            <path data-underline d="M4 16 C 60 6, 120 20, 180 10 C 220 4, 260 12, 296 8" fill="none" stroke="#E6401C" strokeWidth="7" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={rm ? 0 : 1} />
                          </svg>
                        )}
                      </span>
                      {wi < line.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
          </div>
          <p data-intro className={`t-lead max-w-[600px] ${rm ? 'mt-4' : 'mt-6'}`}>
            Pizza, pasta, postres y cócteles en una cabaña de madera en la montaña. Abrimos de jueves a domingo y festivos, y tu perro también está invitado.
          </p>
          <div data-intro className={`${rm ? 'mt-5' : 'mt-7'} flex flex-wrap items-center justify-center gap-3`}>
            <Magnetic>
              <a href="#menu" onClick={(e) => { e.preventDefault(); scrollToId('#menu'); }} className={`btn ${rm ? 'btn-orange' : 'btn-dark'}`}>
                <SunIcon className="w-5 h-5" /> Ver il menù
              </a>
            </Magnetic>
            <button type="button" onClick={() => goBooking('reserva')} className={`btn ${rm ? 'btn-ghost-night' : 'btn-ghost'}`}>Reservar mesa</button>
          </div>
        </div>

        {!rm && (
          <div data-indicator className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 t-mono text-crema flex flex-col items-center gap-2" aria-hidden="true">
            <span>Desliza hasta el atardecer</span>
            <span style={{ animation: 'bob 1.8s ease-in-out infinite' }}>↓</span>
          </div>
        )}
      </div>
    </section>
  );
}
