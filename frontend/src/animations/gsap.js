import gsap from 'gsap';

/**
 * HH Goa 2026 — GSAP Animation Presets
 * Standalone utility functions (non-hook) for imperative use.
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fade in and slide up */
export const fadeInUp = (target, options = {}) => {
  if (prefersReducedMotion()) return;
  return gsap.fromTo(
    target,
    { opacity: 0, y: options.y ?? 20 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration ?? 0.5,
      delay: options.delay ?? 0,
      ease: options.ease ?? 'power3.out',
      clearProps: 'all',
    }
  );
};

/** Staggered fade in */
export const staggerIn = (targets, options = {}) => {
  if (prefersReducedMotion()) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration ?? 0.4,
      stagger: options.stagger ?? 0.06,
      ease: 'power3.out',
      clearProps: 'all',
    }
  );
};

/** Scale pop */
export const popIn = (target, options = {}) => {
  if (prefersReducedMotion()) return;
  return gsap.fromTo(
    target,
    { scale: 0.9, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: options.duration ?? 0.4,
      ease: 'back.out(1.7)',
      clearProps: 'all',
    }
  );
};

/** Fade out and remove */
export const fadeOut = (target, options = {}) => {
  if (prefersReducedMotion()) return;
  return gsap.to(target, {
    opacity: 0,
    y: options.y ?? -10,
    duration: options.duration ?? 0.3,
    ease: 'power2.in',
  });
};
