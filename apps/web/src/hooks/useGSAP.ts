'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function useGSAP(
  callback: (ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => (() => void) | void,
  deps: React.DependencyList = []
) {
  const cleanupRef = useRef<(() => void) | void>(null);

  useEffect(() => {
    const cleanup = callback({ gsap, ScrollTrigger });
    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, deps);
}
