'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedStaggerProps {
  children: ReactNode;
  className?: string;
  childSelector?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  rotate3D?: boolean;
}

export default function AnimatedStagger({
  children,
  className = '',
  childSelector = ':scope > *',
  stagger = 0.12,
  delay = 0,
  duration = 0.7,
  distance = 50,
  direction = 'up',
  rotate3D = false,
}: AnimatedStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    // Dynamically import GSAP so a load failure doesn't hide content forever
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
      .then(([gsapMod, scrollMod]) => {
        if (cancelled) return;

        const gsap = gsapMod.default || gsapMod;
        const ScrollTrigger = scrollMod.ScrollTrigger || scrollMod.default;
        gsap.registerPlugin(ScrollTrigger);

        const targets = el.querySelectorAll(childSelector);
        if (targets.length === 0) return;

        const fromVars: Record<string, unknown> = {
          opacity: 0,
          duration,
          stagger,
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

        if (rotate3D) {
          fromVars.rotateY = -15;
          fromVars.rotateX = 8;
          fromVars.transformPerspective = 800;
        }

        const toVars: Record<string, unknown> = {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          stagger,
          delay,
          ease: 'expo.out',
        };

        if (rotate3D) {
          toVars.rotateY = 0;
          toVars.rotateX = 0;
          toVars.transformPerspective = 800;
        }

        // Use fromTo for reliability — ensures end state is always opacity:1
        gsap.fromTo(targets, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 40%',
            toggleActions: 'play none none none',
          },
        });
      })
      .catch(() => {
        // If GSAP fails to load, make everything visible
        const targets = el.querySelectorAll(childSelector);
        targets.forEach((t) => {
          (t as HTMLElement).style.opacity = '1';
        });
      });

    // Safety fallback: if elements are still invisible after 3s, force show
    const fallbackTimer = setTimeout(() => {
      const targets = el.querySelectorAll(childSelector);
      targets.forEach((t) => {
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
  }, [childSelector, stagger, delay, duration, distance, direction, rotate3D]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
