'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedIndustriesContent({ children }: { children: React.ReactNode }) {
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

        const chips = el.querySelectorAll('[data-animate="chip"]');
        if (chips.length > 0) {
          gsap.fromTo(
            chips,
            { opacity: 0, y: 30, scale: 0.8 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.5, stagger: 0.05, ease: 'back.out(1.7)',
              scrollTrigger: { trigger: chips[0]?.parentElement, start: 'top 90%', toggleActions: 'play none none none' },
            }
          );
        }

        const cards = el.querySelectorAll('[data-animate="feature-card"]');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50, rotateY: -10, transformPerspective: 800 },
            {
              opacity: 1, y: 0, rotateY: 0, transformPerspective: 800,
              duration: 0.7, stagger: 0.15, ease: 'expo.out',
              scrollTrigger: { trigger: cards[0]?.parentElement, start: 'top 90%', toggleActions: 'play none none none' },
            }
          );
        }
      })
      .catch(() => {
        const all = el.querySelectorAll('[data-animate]');
        all.forEach((t) => { (t as HTMLElement).style.opacity = '1'; });
      });

    const fallbackTimer = setTimeout(() => {
      const all = el.querySelectorAll('[data-animate]');
      all.forEach((t) => {
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
