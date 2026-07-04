'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { triggerDemoModal } from '@/hooks/useDemoModal';

const FreightScene = dynamic(() => import('./three/FreightScene'), { ssr: false });

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      if (line1Ref.current) {
        tl.fromTo(line1Ref.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }
        );
      }
      if (line2Ref.current) {
        tl.fromTo(line2Ref.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' },
          '>-0.5'
        );
      }
      if (subtextRef.current) {
        tl.fromTo(subtextRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '>-0.3'
        );
      }
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '>-0.2'
        );
      }

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-32 px-4"
      style={{ background: '#0B1220' }}
    >
      {/* Three.js background (lighter) */}
      <div className="absolute inset-0 opacity-30">
        <FreightScene />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/80 via-transparent to-[#0B1220]/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-ff-teal-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 text-ff-teal-500 text-sm font-semibold tracking-[0.2em] uppercase mb-8 px-4 py-2 rounded-full border border-ff-navy-500/30 bg-ff-navy-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-ff-teal-500 animate-pulse" />
          Ready to go digital?
        </div>

        {/* Giant headline */}
        <div
          className="text-6xl sm:text-8xl lg:text-9xl font-black leading-none mb-4"
          style={{ letterSpacing: '-4px' }}
        >
          <span ref={line1Ref} className="block text-white" style={{ opacity: 0 }}>
            Every Trip.{' '}
            <span className="text-ff-teal-500">Every Rupee.</span>
          </span>
          <span ref={line2Ref} className="block text-ff-amber-500" style={{ opacity: 0 }}>
            In Control.
          </span>
        </div>

        <p
          ref={subtextRef}
          className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ opacity: 0 }}
        >
          Join transport businesses already running on FreightFlow.
          Start in minutes, not months.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: 0 }}
        >
          <button
            onClick={triggerDemoModal}
            id="final-cta-primary"
            className="group inline-flex items-center gap-2 text-ff-navy-950 font-bold text-lg px-10 py-5 rounded-full bg-ff-amber-500 hover:bg-ff-amber-600 transition-all duration-300 shadow-2xl shadow-ff-amber-500/20 hover:-translate-y-1 transform will-change-transform cursor-pointer"
          >
            Book a Free Demo
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <Link
            href="/login"
            id="final-cta-demo"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-lg px-10 py-5 rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/5"
          >
            Start 7-Day Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>

        {/* Trust micro-copy */}
        <div className="flex items-center justify-center gap-6 mt-10 text-white/30 text-sm">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ff-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ff-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Setup in 5 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ff-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}
