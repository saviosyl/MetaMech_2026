'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedToolsContent({ children }: { children: React.ReactNode }) {
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

        // Animate tool cards
        const cards = el.querySelectorAll('[data-animate="tool-card"]');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 60, rotateY: -12, transformPerspective: 800 },
            {
              opacity: 1,
              y: 0,
              rotateY: 0,
              transformPerspective: 800,
              duration: 0.7,
              stagger: 0.15,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cards[0]?.parentElement,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Animate benefit cards
        const benefitCards = el.querySelectorAll('[data-animate="benefit"]');
        if (benefitCards.length > 0) {
          gsap.fromTo(
            benefitCards,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: benefitCards[0]?.parentElement,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Animate feature list items
        const features = el.querySelectorAll('[data-animate="feature"]');
        if (features.length > 0) {
          gsap.fromTo(
            features,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: features[0]?.parentElement,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      })
      .catch(() => {
        // GSAP failed — show all animated elements
        const all = el.querySelectorAll('[data-animate]');
        all.forEach((t) => {
          (t as HTMLElement).style.opacity = '1';
        });
      });

    // Safety fallback: force-show after 3s
    const fallbackTimer = setTimeout(() => {
      const all = el.querySelectorAll('[data-animate]');
      all.forEach((t) => {
        const computed = window.getComputedStyle(t);
        if (computed.opacity === '0') {
          (t as HTMLElement).style.opacity = '1';
          (t as HTMLElement).style.transform = 'none';
          (t as HTMLElement).style.transition = 'opacity 0.5s ease';
        }
      });
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
