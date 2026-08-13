// Placeholder for GSAP animation utilities
import gsap from 'gsap';

export const fadeIn = (element, duration = 1) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration, ease: 'power3.out' }
  );
};
