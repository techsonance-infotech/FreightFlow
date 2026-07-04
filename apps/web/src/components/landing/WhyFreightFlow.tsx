'use client';

import { useEffect, useRef } from 'react';

const ADVANTAGES = [
  {
    icon: '✨',
    title: '100% Digital Operations',
    desc: 'Eliminate physical paperwork entirely. Generate digital LRs, share invoices via WhatsApp, and store PODs in a secure cloud.',
  },
  {
    icon: '💰',
    title: 'Enhanced Financial Control',
    desc: 'Plug operational leakages. Log driver advances, fuel card expenses, and toll slips against individual trips with live margin calculations.',
  },
  {
    icon: '⚖️',
    title: 'Automated Compliance',
    desc: 'Native GST calculation, GTA RCM enforcement, and integration with e-Way Bill portals keep your books audit-ready at all times.',
  },
  {
    icon: '🛰️',
    title: 'Real-Time Visibility',
    desc: 'Track vehicles and route progress with GPS integration. Keep clients updated with live ETA alerts and instant digital delivery confirmations.',
  },
  {
    icon: '📈',
    title: 'Enterprise Scalability',
    desc: 'Designed for growth. Add infinite companies, branch offices, and team members with postgres-backed role-based security.',
  },
  {
    icon: '📱',
    title: 'Driver Empowerment',
    desc: 'A super-simple driver app that works on low network speeds. Drivers can request advances and upload PODs instantly.',
  },
];

export default function WhyFreightFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');

      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      if (containerRef.current) {
        const cards = containerRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 35 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
            stagger: 0.08,
          }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      id="why-freightflow"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0F1B2E' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" style={{ strokeWidth: 0.5 }}>
          <pattern id="why-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2E4E7C" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#why-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            KEY ADVANTAGES
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
            Built for the speed of
            <br /><span className="text-ff-amber-500">modern road transport.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Scale your transport operations, improve bottom-line margins, and maintain compliance automatically.
          </p>
        </div>

        {/* 6-Item Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {ADVANTAGES.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-ff-navy-700/50 bg-ff-navy-900/30 hover:border-ff-teal-500/40 hover:bg-ff-navy-950 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-ff-navy-700/30 border border-ff-navy-700/50 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:border-ff-teal-500/30 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-ff-teal-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
