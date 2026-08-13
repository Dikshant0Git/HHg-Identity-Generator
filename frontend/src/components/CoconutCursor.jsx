import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Coconut emoji cursor — desktop only.
 * Smoothly follows the mouse. Disabled on touch devices.
 */
export default function CoconutCursor() {
  const cursorRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  const isTouchDevice = () => {
    if (typeof window === 'undefined') return true;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const animate = useCallback(() => {
    const lerp = 0.25;
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isTouchDevice()) return;

    document.body.classList.add('custom-cursor-active');
    setVisible(true);

    const onMouseMove = (e) => {
      targetRef.current.x = e.clientX - 12;
      targetRef.current.y = e.clientY - 12;
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || isTouchDevice()) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        fontSize: '24px',
        lineHeight: 1,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      🥥
    </div>
  );
}
