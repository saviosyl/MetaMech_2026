'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedPricingContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Animate plan cards
    const planCards = el.querySelectorAll('[data-animate="plan-card"]');
    if (planCards.length > 0) {
      gsap.set(planCards, { opacity: 0 });
      gsap.from(planCards, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: planCards[0]?.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Animate ROI section
    const roiSection = el.querySelector('[data-animate="roi"]');
    if (roiSection) {
      gsap.set(roiSection, { opacity: 0 });
      gsap.from(roiSection, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: roiSection,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Animate FAQ items
    const faqItems = el.querySelectorAll('[data-animate="faq"]');
    if (faqItems.length > 0) {
      gsap.set(faqItems, { opacity: 0 });
      gsap.from(faqItems, {
        opacity: 0,
        y: 30,
        x: -20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: faqItems[0]?.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Animate checkout section
    const checkout = el.querySelector('[data-animate="checkout"]');
    if (checkout) {
      gsap.set(checkout, { opacity: 0 });
      gsap.from(checkout, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: checkout,
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
