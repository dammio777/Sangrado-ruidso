import { useEffect, useRef } from 'react';
import { tones } from '../../data/site.js';
import { ART } from '../art/Illustrations.jsx';
import Sun from '../art/Sun.jsx';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

/**
 * Marco de arco: muestra la foto (media.src) o el video (media.video) cuando existan.
 * Mientras tanto: color sólido + ilustración (o el sol al 10%) + "FOTO PRÓXIMAMENTE".
 */
export default function ArchFrame({
  media = {}, className = '', shape = 'arch', reveal = true, showLabel = true, artMode = 'art', children, sizes,
}) {
  const ref = useRef(null);
  const tone = tones[media.tone] || tones.mandarina;
  const Art = artMode === 'art' && media.art ? ART[media.art] : null;
  const radius = shape === 'arch' ? 'var(--radius-arch)' : shape === 'round' ? '9999px' : '24px';

  useEffect(() => {
    if (!reveal || prefersReducedMotion() || !ref.current) return;
    const el = ref.current;
    const tween = gsap.fromTo(el, { clipPath: 'circle(0% at 50% 100%)' }, {
      clipPath: 'circle(150% at 50% 100%)', duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(el, { clearProps: 'clipPath' }); };
  }, [reveal]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: radius, background: tone.bg, color: tone.fg, boxShadow: 'var(--shadow-md)', border: '2px solid var(--color-crema)' }}>
      {media.video ? (
        <video className="absolute inset-0 w-full h-full object-cover" src={media.video} autoPlay muted loop playsInline aria-label={media.alt} />
      ) : media.src ? (
        <img className="absolute inset-0 w-full h-full object-cover" src={media.src} alt={media.alt || ''} loading="lazy" decoding="async" sizes={sizes} />
      ) : (
        <>
          {Art ? (
            <div className="absolute inset-x-[6%] top-[14%] bottom-[12%] flex items-center justify-center"><Art /></div>
          ) : (
            <Sun variant="mono" color={tone.fg} className="absolute left-1/2 top-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-10" />
          )}
          {showLabel && (
            <span className="t-mono absolute left-1/2 bottom-[5%] -translate-x-1/2 whitespace-nowrap !text-[10.5px] opacity-80" style={{ color: tone.fg }}>
              Foto próximamente
            </span>
          )}
        </>
      )}
      {children}
    </div>
  );
}
