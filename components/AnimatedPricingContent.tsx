'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedPricingContent({ children }: { children: React.ReactNode }) {
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

        // Animate plan cards
        const planCards = el.querySelectorAll('[data-animate="plan-card"]');
        if (planCards.length > 0) {
          gsap.fromTo(
            planCards,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: planCards[0]?.parentElement,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Animate ROI section
        const roiSection = el.querySelector('[data-animate="roi"]');
        if (roiSection) {
          gsap.fromTo(
            roiSection,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: roiSection,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Animate FAQ items
        const faqItems = el.querySelectorAll('[data-animate="faq"]');
        if (faqItems.length > 0) {
          gsap.fromTo(
            faqItems,
            { opacity: 0, y: 30, x: -20 },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: faqItems[0]?.parentElement,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Animate checkout section
        const checkout = el.querySelector('[data-animate="checkout"]');
        if (checkout) {
          gsap.fromTo(
            checkout,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: checkout,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      })
      .catch(() => {
        // GSAP failed — show everything
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
