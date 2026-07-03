'use client';

import { useEffect, useRef } from 'react';

const STATEMENTS = [
  { pre: 'Still creating', em: 'LRs on paper?', isQuestion: true },
  { pre: 'Still writing', em: 'invoices by hand?', isQuestion: true },
  { pre: 'Still chasing', em: 'GST manually?', isQuestion: true },
  { pre: 'Still using WhatsApp', em: 'for POD updates?', isQuestion: true },
  { pre: 'There\'s a', em: 'better way.', isQuestion: false, isAnswer: true },
];

export default function PainSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const init = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');
      const section = sectionRef.current;
      if (!section) return;

      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];

      // Set initial states — all invisible except first
      slides.forEach((slide, i) => {
        gsap.set(slide, { opacity: i === 0 ? 0 : 0, y: i === 0 ? 0 : 60 });
      });

      // Create a single pinned timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=400%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      slides.forEach((slide, i) => {
        // Fade in current slide
        tl.to(slide, { opacity: 1, y: 0, duration: 0.4 }, i * 1.2);
        // Hold it
        tl.to(slide, { opacity: 1, duration: 0.5 }, i * 1.2 + 0.4);
        // Fade out (except last)
        if (i < slides.length - 1) {
          tl.to(slide, { opacity: 0, y: -40, duration: 0.3 }, i * 1.2 + 0.9);
        }
      });

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    init();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pain"
      className="relative overflow-hidden"
      style={{ background: '#000000', minHeight: '100vh' }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Radial glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(37,99,235,0.08)' }} />

      {/* Statements container */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-5xl text-center" style={{ position: 'relative', height: '200px' }}>
          {STATEMENTS.map((stmt, i) => (
            <div
              key={i}
              ref={el => { slideRefs.current[i] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity: 0 }}
            >
              {stmt.isAnswer ? (
                <>
                  <p className="text-white/40 text-xl sm:text-2xl font-medium mb-3">There&apos;s a</p>
                  <p className="font-black" style={{ fontSize: 'clamp(56px, 10vw, 120px)', letterSpacing: '-4px', color: '#FFB300', lineHeight: 1 }}>
                    better way.
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <a href="/login" className="px-8 py-4 rounded-full font-bold text-white text-base" style={{ background: 'linear-gradient(135deg, #2563EB, #1E4D8C)', boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}>
                      Start Free Trial →
                    </a>
                  </div>
                </>
              ) : (
                <p className="font-black leading-tight" style={{ fontSize: 'clamp(36px, 6vw, 80px)', letterSpacing: '-3px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{stmt.pre} </span>
                  <span style={{ color: 'white' }}>{stmt.em}</span>
                </p>
              )}

              {/* Counter indicator */}
              <div className="absolute bottom-[-60px] flex gap-2 justify-center">
                {STATEMENTS.map((_, j) => (
                  <div key={j} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: j === i ? '#2563EB' : 'rgba(255,255,255,0.15)', transform: j === i ? 'scale(1.5)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
