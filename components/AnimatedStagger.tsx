'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

    const targets = el.querySelectorAll(childSelector);
    if (targets.length === 0) return;

    const fromVars: gsap.TweenVars = {
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

    gsap.set(targets, { opacity: 0 });

    const tween = gsap.from(targets, {
      ...fromVars,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 40%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [childSelector, stagger, delay, duration, distance, direction, rotate3D]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
