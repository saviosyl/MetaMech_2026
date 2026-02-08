'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedContactContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
      .then(([gsapMod, scrollMod]) => {
        if (cancelled) return;

        const gsap = gsapMod.default || gsapMod;
        const ScrollTrigger = scrollMod.ScrollTrigger || scrollMod.default;
        gsap.registerPlugin(ScrollTrigger);

        const cards = el.querySelectorAll('.glass-card');
        if (cards.length === 0) return;

        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.15, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          }
        );
      })
      .catch(() => {
        const cards = el.querySelectorAll('.glass-card');
        cards.forEach((t) => { (t as HTMLElement).style.opacity = '1'; });
      });

    const fallbackTimer = setTimeout(() => {
      const cards = el.querySelectorAll('.glass-card');
      cards.forEach((t) => {
        if (window.getComputedStyle(t).opacity === '0') {
          (t as HTMLElement).style.opacity = '1';
          (t as HTMLElement).style.transform = 'none';
          (t as HTMLElement).style.transition = 'opacity 0.5s ease';
        }
      });
    }, 3000);

    return () => { cancelled = true; clearTimeout(fallbackTimer); };
  }, []);

  return <div ref={ref}>{children}</div>;
}
