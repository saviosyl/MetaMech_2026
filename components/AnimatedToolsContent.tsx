'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedToolsContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Animate tool cards
    const cards = el.querySelectorAll('[data-animate="tool-card"]');
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0 });
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        rotateY: -12,
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

    // Animate benefit cards
    const benefitCards = el.querySelectorAll('[data-animate="benefit"]');
    if (benefitCards.length > 0) {
      gsap.set(benefitCards, { opacity: 0 });
      gsap.from(benefitCards, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: benefitCards[0]?.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Animate feature list items
    const features = el.querySelectorAll('[data-animate="feature"]');
    if (features.length > 0) {
      gsap.set(features, { opacity: 0 });
      gsap.from(features, {
        opacity: 0,
        x: 20,
        duration: 0.4,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: features[0]?.parentElement,
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
