'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { target: 45, prefix: '₹', suffix: ' Cr+', label: 'Monthly volume tracked', decimals: 0 },
  { target: 12000, prefix: '', suffix: '+', label: 'Trips dispatched', decimals: 0 },
  { target: 99.99, prefix: '', suffix: '%', label: 'System uptime guarantee', decimals: 2 },
];

const CITIES = [
  'Mumbai', 'Surat', 'Delhi', 'Chennai', 'Bangalore',
  'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Nagpur',
  'Lucknow', 'Indore', 'Vadodara', 'Hyderabad',
];

const TESTIMONIALS = [
  {
    quote: "FreightFlow cut our LR creation time down to seconds. Our billing leakage dropped to absolute zero in our first month.",
    author: "Rajesh Sharma",
    role: "Owner, Sharma Roadlines",
    location: "Mumbai",
  },
  {
    quote: "Managing 8 sister companies and their GST calculations used to require three full-time accountants. Now we do it all under one login.",
    author: "Sunil Patel",
    role: "Director, Aarambh Logistics",
    location: "Surat",
  },
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
  const cardsRef = useRef<HTMLDivElement>(null);
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

      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' }
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
      style={{ background: '#0B1220' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            PROVEN RESULTS
          </div>
          <h2
            ref={headRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
            style={{ letterSpacing: '-2px', opacity: 0 }}
          >
            Built for the speed of{' '}
            <br /><span className="text-ff-amber-500">Indian highway transport.</span>
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
              className="relative p-8 rounded-2xl border border-ff-navy-700/50 text-center group hover:border-ff-teal-500/40 hover:bg-ff-navy-900/30 transition-all duration-500"
              style={{ opacity: 0 }}
            >
              <div
                className="text-4xl sm:text-5xl font-black mb-3"
                style={{ color: '#F59E0B', fontVariantNumeric: 'tabular-nums' }}
              >
                <CountUp {...stat} shouldStart={statsVisible} />
              </div>
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
        >
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl border border-ff-navy-700/50 bg-ff-navy-900/30 flex flex-col justify-between hover:border-ff-teal-500/40 transition-colors duration-300"
              style={{ opacity: 0 }}
            >
              <p className="text-white/80 text-base italic mb-6 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div>
                <h4 className="text-white font-bold text-sm">{item.author}</h4>
                <p className="text-white/40 text-xs mt-0.5">{item.role} · {item.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* City marquee */}
        <div className="relative overflow-hidden">
          <div className="text-center mb-6">
            <p className="text-white/30 text-xs uppercase tracking-widest">Active Corridors Covered</p>
          </div>

          {/* Gradient fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B1220] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B1220] to-transparent z-10" />

          <div className="flex overflow-hidden">
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
              {[...CITIES, ...CITIES].map((city, i) => (
                <div key={i} className="flex items-center gap-4 shrink-0">
                  <span className="text-white/70 font-semibold text-lg">{city}</span>
                  {i < CITIES.length * 2 - 1 && (
                    <svg className="w-4 h-4 text-ff-amber-500/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
