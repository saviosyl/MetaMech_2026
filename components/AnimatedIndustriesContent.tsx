'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedIndustriesContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Animate industry chips
    const chips = el.querySelectorAll('[data-animate="chip"]');
    if (chips.length > 0) {
      gsap.set(chips, { opacity: 0 });
      gsap.from(chips, {
        opacity: 0,
        y: 30,
        scale: 0.8,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: chips[0]?.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Animate feature cards
    const cards = el.querySelectorAll('[data-animate="feature-card"]');
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0 });
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        rotateY: -10,
        transformPerspective: 800,
        duration: 0.7,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cards[0]?.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
