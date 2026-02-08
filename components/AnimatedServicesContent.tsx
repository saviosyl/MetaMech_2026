'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedServicesContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cards = el.querySelectorAll('.glass-card');
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0 });

    const tween = gsap.from(cards, {
      opacity: 0,
      y: 60,
      rotateY: -15,
      rotateX: 8,
      transformPerspective: 800,
      duration: 0.7,
      stagger: 0.15,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
