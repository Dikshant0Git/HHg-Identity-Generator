import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Page entrance reveal animation.
 * Fades in and slides up children of the container.
 */
export function usePageReveal(containerRef) {
  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const el = containerRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
      }
    );

    return () => { gsap.killTweensOf(el); };
  }, [containerRef]);
}

/**
 * Staggered reveal for a list of child elements.
 * Pass a ref to the parent; children are selected by the selector.
 */
export function useStaggerReveal(containerRef, selector = '> *') {
  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const targets = containerRef.current.querySelectorAll(selector);
    if (!targets.length) return;

    gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'all',
      }
    );

    return () => { gsap.killTweensOf(targets); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, selector]);
}

/**
 * Image reveal — clips from hidden to visible.
 */
export function useImageReveal(imageRef) {
  useEffect(() => {
    if (prefersReducedMotion() || !imageRef.current) return;

    const el = imageRef.current;
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0% 0 0 0)',
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
      }
    );

    return () => { gsap.killTweensOf(el); };
  }, [imageRef]);
}

/**
 * Hover scale animation factory. Returns onMouseEnter/onMouseLeave handlers.
 */
export function useHoverAnimation(scale = 1.03) {
  const elementRef = useRef(null);

  const onMouseEnter = useCallback(() => {
    if (prefersReducedMotion() || !elementRef.current) return;
    gsap.to(elementRef.current, {
      scale,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, [scale]);

  const onMouseLeave = useCallback(() => {
    if (prefersReducedMotion() || !elementRef.current) return;
    gsap.to(elementRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, []);

  return { ref: elementRef, onMouseEnter, onMouseLeave };
}

/**
 * Button press animation factory.
 */
export function useButtonPress() {
  const elementRef = useRef(null);

  const onMouseDown = useCallback(() => {
    if (prefersReducedMotion() || !elementRef.current) return;
    gsap.to(elementRef.current, { scale: 0.96, duration: 0.1 });
  }, []);

  const onMouseUp = useCallback(() => {
    if (prefersReducedMotion() || !elementRef.current) return;
    gsap.to(elementRef.current, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
  }, []);

  return { ref: elementRef, onMouseDown, onMouseUp };
}
