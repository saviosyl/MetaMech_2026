'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  distance?: number;
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.8,
  distance = 60,
}: AnimatedSectionProps) {
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

        const fromVars: Record<string, unknown> = {
          opacity: 0,
          duration,
          delay,
          ease: 'expo.out',
        };

        switch (direction) {
          case 'up':
            fromVars.y = distance;
            break;
          case 'down':
            fromVars.y = -distance;
            break;
          case 'left':
            fromVars.x = distance;
            break;
          case 'right':
            fromVars.x = -distance;
            break;
        }

        const toVars: Record<string, unknown> = {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          delay,
          ease: 'expo.out',
        };

        gsap.fromTo(el, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 50%',
            toggleActions: 'play none none none',
          },
        });
      })
      .catch(() => {
        // GSAP failed to load — show content immediately
        el.style.opacity = '1';
      });

    // Safety fallback
    const fallbackTimer = setTimeout(() => {
      const computed = window.getComputedStyle(el);
      if (computed.opacity === '0') {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'opacity 0.5s ease';
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [delay, direction, duration, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
