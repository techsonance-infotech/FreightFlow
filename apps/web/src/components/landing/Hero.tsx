'use client';

import React, { useEffect, useRef } from 'react';
import IsometricPallet from './IsometricPallet';
import IsometricBox from './IsometricBox';
import DashboardShowcase from './DashboardShowcase';
import { triggerDemoModal } from '@/hooks/useDemoModal';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const palletRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;

    const initGSAP = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      if (!containerRef.current) return;

      ctx = gsap.context(() => {
        // LAYER 2 INITIAL STATES:
        // Pallet: left viewport, -22 deg rotate, 1.1 scale, 45% opacity
        gsap.set(palletRef.current, {
          xPercent: 0,
          yPercent: 0,
          rotation: -22,
          scale: 1.1,
          opacity: 0.45,
          force3D: true,
        });

        // Box: right viewport, 18 deg rotate, 1.05 scale, 45% opacity
        gsap.set(boxRef.current, {
          xPercent: 0,
          yPercent: 0,
          rotation: 18,
          scale: 1.05,
          opacity: 0.45,
          force3D: true,
        });

        // LAYER 3 INITIAL STATE: Hero content centered
        gsap.set(heroContentRef.current, {
          y: 0,
          force3D: true,
        });

        // LAYER 4 INITIAL STATE: Dashboard translateY(120px)
        gsap.set(dashboardRef.current, {
          y: 120,
          force3D: true,
        });

        // CREATE SCROLLTRIGGER TIMELINE (Finishes within 800px scroll)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=800',
            pin: true,
            scrub: 0.5, // Ultra smooth 60 FPS scrub
            anticipatePin: 1,
          },
        });

        // PALLET ANIMATION (Left -> Center -> Smoothly hides behind dashboard)
        // Rotation: -22 -> 0 | Scale: 1.1 -> 0.85 | Opacity: 0.45 -> 0.0
        tl.to(
          palletRef.current,
          {
            x: '28vw',
            y: '36vh',
            rotation: 0,
            scale: 0.85,
            opacity: 0,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        );

        // BOX ANIMATION (Right -> Center -> Smoothly hides behind dashboard)
        // Rotation: 18 -> 0 | Scale: 1.05 -> 0.85 | Opacity: 0.42 -> 0.0
        tl.to(
          boxRef.current,
          {
            x: '-24vw',
            y: '36vh',
            rotation: 0,
            scale: 0.85,
            opacity: 0,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        );

        // HERO CONTENT ANIMATION (0px -> -20px maximum, no fading, no scaling)
        tl.to(
          heroContentRef.current,
          {
            y: -20,
            ease: 'power2.out',
            duration: 1,
          },
          0
        );

        // DASHBOARD REVEAL ANIMATION (translateY 120px -> 0px)
        tl.to(
          dashboardRef.current,
          {
            y: 0,
            ease: 'power2.out',
            duration: 1,
          },
          0
        );
      }, containerRef);
    };

    initGSAP();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#FAFAFC] text-slate-900 overflow-hidden pt-24 pb-12 flex flex-col justify-between"
    >
      {/* ================= LAYER 1: BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-white via-[#FAFAFC] to-[#F1F5F9] opacity-90" />

      {/* ================= LAYER 2: ILLUSTRATIONS (PALLET & BOX) ================= */}
      {/* Pallet (Left) */}
      <div
        ref={palletRef}
        style={{ willChange: 'transform, opacity' }}
        className="absolute left-[-12vw] sm:left-[-6vw] lg:left-[-4vw] top-[14vh] w-[32vw] max-w-[420px] min-w-[240px] z-10 pointer-events-none opacity-40"
      >
        <IsometricPallet />
      </div>

      {/* Box (Right) */}
      <div
        ref={boxRef}
        style={{ willChange: 'transform, opacity' }}
        className="absolute right-[-12vw] sm:right-[-6vw] lg:right-[-4vw] top-[14vh] w-[28vw] max-w-[380px] min-w-[220px] z-10 pointer-events-none opacity-40"
      >
        <IsometricBox />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-30 flex-grow flex flex-col justify-between items-center">
        {/* ================= LAYER 3: CENTERED CONTENT ================= */}
        <div
          ref={heroContentRef}
          style={{ willChange: 'transform' }}
          className="text-center max-w-4xl mx-auto space-y-5 pt-4 z-20 relative"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-xs sm:text-sm font-semibold">
            <span>Centralize LRs, control freight spend</span>
            <span className="text-blue-600 font-bold">→</span>
            <span className="text-slate-700">Unlock savings.</span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold text-[#0A1628] leading-[1.05] uppercase tracking-tight"
            style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}
          >
            <span className="text-[#2563EB]">CONTROL</span> FREIGHT & LOGISTICS FROM END-TO-END.
          </h1>

          {/* Email input */}
          <div className="pt-2 max-w-xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerDemoModal();
              }}
              className="flex items-center p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md shadow-slate-200/40"
            >
              <input
                type="email"
                placeholder="What's your work email?"
                required
                className="flex-1 px-4 py-2.5 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Book a Demo
              </button>
            </form>
          </div>

          {/* Client logos */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-50 filter grayscale hover:grayscale-0 transition-all duration-300">
            {['SHREE SHIVAY', 'AARAMBH FX', 'SALTBOX', 'NIMBL FLEET', 'SHIPPINGTREE', 'WSI LOGISTICS'].map((brand) => (
              <span key={brand} className="text-[11px] sm:text-xs font-black tracking-widest text-slate-700 uppercase">
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* ================= LAYER 4: DASHBOARD CARD ================= */}
        <div
          ref={dashboardRef}
          style={{ willChange: 'transform' }}
          className="w-full relative z-40 mt-8 sm:mt-12"
        >
          <DashboardShowcase />
        </div>
      </div>
    </section>
  );
}
