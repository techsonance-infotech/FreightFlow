'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { target: 264500, prefix: '₹', suffix: '+', label: 'Monthly volume tracked', decimals: 0 },
  { target: 4, prefix: '', suffix: '', label: 'LR formats supported', decimals: 0 },
  { target: 100, prefix: '', suffix: '%', label: 'GST compliant', decimals: 0 },
];

const CITIES = [
  'Mumbai', 'Surat', 'Delhi', 'Chennai', 'Bangalore',
  'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Nagpur',
  'Lucknow', 'Indore', 'Vadodara', 'Hyderabad',
];

function CountUp({ target, prefix, suffix, decimals, shouldStart }: {
  target: number; prefix: string; suffix: string; decimals: number; shouldStart: boolean;
}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!shouldStart || startedRef.current) return;
    startedRef.current = true;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setValue(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [shouldStart, target, decimals]);

  const formatted = target >= 1000
    ? value.toLocaleString('en-IN')
    : value.toString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

export default function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      if (headRef.current) {
        gsap.fromTo(headRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: headRef.current, start: 'top 80%' }
          }
        );
      }

      if (statsRef.current) {
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 80%',
          onEnter: () => setStatsVisible(true),
        });

        gsap.fromTo(statsRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 80%' }
          }
        );
      }

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="social-proof"
      className="py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: '#0A1628' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Headline */}
        <div className="text-center mb-20">
          <p className="text-[#42A5F5] text-sm font-semibold tracking-[0.2em] uppercase mb-4">BUILT FOR INDIA</p>
          <h2
            ref={headRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
            style={{ letterSpacing: '-2px', opacity: 0 }}
          >
            Built for{' '}
            <span className="text-[#FFB300]">Indian transport</span>
            <br />businesses.
          </h2>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-24"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative p-8 rounded-3xl border border-white/10 text-center group hover:border-[#2563EB]/40 transition-all duration-500 hover:bg-[#2563EB]/5"
              style={{ opacity: 0 }}
            >
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.08), transparent 70%)' }} />
              <div
                className="text-4xl sm:text-5xl font-black mb-3"
                style={{ color: '#FFB300', fontVariantNumeric: 'tabular-nums' }}
              >
                <CountUp {...stat} shouldStart={statsVisible} />
              </div>
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* City marquee */}
        <div className="relative overflow-hidden">
          <div className="text-center mb-6">
            <p className="text-white/30 text-xs uppercase tracking-widest">Routes covered across India</p>
          </div>

          {/* Gradient fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A1628] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A1628] to-transparent z-10" />

          <div className="flex overflow-hidden">
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
              {[...CITIES, ...CITIES].map((city, i) => (
                <div key={i} className="flex items-center gap-4 shrink-0">
                  <span className="text-white/70 font-semibold text-lg">{city}</span>
                  {i < CITIES.length * 2 - 1 && (
                    <svg className="w-4 h-4 text-[#2563EB]/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🛡️', label: 'AES-256 Encryption', sub: 'Sensitive fields' },
            { icon: '📋', label: 'Audit-Ready Logs', sub: 'Append-only trail' },
            { icon: '🔐', label: 'MFA Protected', sub: 'TOTP + SMS OTP' },
            { icon: '⚡', label: 'TLS 1.3', sub: 'All API comms' },
          ].map((badge) => (
            <div
              key={badge.label}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center hover:border-[#2563EB]/30 transition-all duration-300 hover:bg-[#2563EB]/5"
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-white font-semibold text-xs">{badge.label}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{badge.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
