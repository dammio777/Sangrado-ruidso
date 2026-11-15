import { useEffect, useRef } from 'react';
import SplitType from 'split-type';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { waHref, waClick } from '../lib/whatsapp.js';
import { ZigzagEdge } from './ui/Zigzag.jsx';
import Magnetic from './ui/Magnetic.jsx';
import Sun from './art/Sun.jsx';
import { WhatsAppIcon } from './art/Illustrations.jsx';

const MSG = 'Buonasera Tramonto! Quiero reservar una mesa para ver el atardecer.';

/** 13 — CTA final: el cielo en su momento más intenso. */
export default function FinalCTA() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    const split = new SplitType(el.querySelector('h2'), { types: 'words,chars' });
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-bigsun]', { yPercent: 18 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(split.chars, { yPercent: 100, opacity: 0, rotate: 8, duration: 0.9, ease: 'power4.out', stagger: 0.025, scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
    }, el);
    return () => { ctx.revert(); split.revert(); };
  }, []);

  return (
    <section ref={ref} aria-labelledby="cta-t" className="relative z-10 min-h-svh flex items-center overflow-hidden py-32"
      style={{ background: 'radial-gradient(130% 100% at 50% 100%, #F6B547 0%, #EB7126 34%, #EB7126 58%, #E6401C 86%, #C24E35 100%)' }}>
      <ZigzagEdge color="#C24E35" line="dorado" />
      <div data-bigsun aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 top-[60%] w-[min(92vw,1100px)] aspect-square">
        <div className="absolute inset-[-25%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(246,181,71,.8), rgba(246,181,71,0))' }} />
        <Sun spin className="relative w-full h-full" />
      </div>
      <div className="relative container-page text-center">
        <p className="t-script text-ladrillo -rotate-3">ci vediamo stasera</p>
        <h2 id="cta-t" className="t-display uppercase text-espresso text-[clamp(52px,10.5vw,168px)] mt-2">¿Nos vemos<br />al atardecer?</h2>
        <div className="mt-10 flex justify-center">
          <Magnetic>
            <a href={waHref(MSG)} onClick={waClick(MSG)} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-lg">
              <WhatsAppIcon className="w-6 h-6" /> Reservar por WhatsApp
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
