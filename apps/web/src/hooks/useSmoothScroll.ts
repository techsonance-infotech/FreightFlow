'use client';

import { useEffect } from 'react';

export function useSmoothScroll() {
  useEffect(() => {
    let lenis: {
      raf: (t: number) => void;
      destroy: () => void;
    } | null = null;
    let rafId: number;

    async function initLenis() {
      try {
        const mod = await import('@studio-freight/lenis');
        const LenisClass = mod.default;

        lenis = new LenisClass({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        function raf(time: number) {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      } catch (e) {
        console.warn('Lenis smooth scroll not available:', e);
      }
    }

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      initLenis();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);
}
