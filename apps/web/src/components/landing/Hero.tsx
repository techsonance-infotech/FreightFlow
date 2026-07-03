'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const FreightScene = dynamic(() => import('./three/FreightScene'), { ssr: false });

const STATS = [
  { value: '30s', label: 'Create an LR', icon: '⚡' },
  { value: '100%', label: 'GST Compliant', icon: '✅' },
  { value: '∞', label: 'Multi-company', icon: '🏢' },
  { value: '0', label: 'Excel sheets', icon: '🚫' },
];

const BADGES = [
  '📋 Auto LR#',
  '🚛 Live Fleet Map',
  '🧾 GST Toggle',
  '📦 Pallet Tracking',
  '💰 AR/AP Ledger',
  '📊 BI Reports',
  '👥 HR & Payroll',
  '🔔 Compliance Alerts',
];

export default function Hero() {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingCardRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');

      const tl = gsap.timeline({ delay: 0.4 });

      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(headlineRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, '-=0.2')
        .fromTo(subtextRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .fromTo(ctaRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .fromTo(badgesRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
        .fromTo(statsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1')
        .fromTo(floatingCardRef.current, { opacity: 0, x: 60, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out' }, 0.6);

      // Floating animation on the card
      if (floatingCardRef.current) {
        gsap.to(floatingCardRef.current, {
          y: -12,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.5,
        });
      }
    };
    init();
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050D1E 0%, #0A1628 50%, #0D1F3C 100%)' }}
    >
      {/* Three.js scene */}
      <FreightScene />

      {/* Multi-layer gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: 'linear-gradient(to top, #050D1E, transparent)' }} />
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, #050D1E 0%, transparent 100%)' }} />
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10 blur-[100px]" style={{ background: '#FFB300' }} />
        <div className="absolute bottom-40 left-10 w-80 h-80 rounded-full opacity-8 blur-[80px]" style={{ background: '#2563EB' }} />
      </div>

      {/* Content grid */}
      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">

          {/* Left: Text content */}
          <div>
            {/* Eyebrow */}
            <div ref={eyebrowRef} style={{ opacity: 0 }} className="flex items-center gap-3 mb-7">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.1)' }}>
                <span className="w-2 h-2 rounded-full bg-[#42A5F5] animate-pulse" />
                <span className="text-[#42A5F5] text-xs font-bold tracking-[0.18em] uppercase">Logistics & Supply Chain Intelligence</span>
              </div>
            </div>

            {/* Main headline */}
            <div ref={headlineRef} style={{ opacity: 0 }}>
              <h1 className="font-black text-white leading-[0.95]" style={{ fontSize: 'clamp(48px, 7vw, 88px)', letterSpacing: '-4px' }}>
                Every Freight.<br />
                <span style={{ color: '#FFB300' }}>Every Route.</span><br />
                One Platform.
              </h1>
            </div>

            <p ref={subtextRef} style={{ opacity: 0 }} className="mt-7 text-lg leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Create LRs in <span className="text-white font-semibold">30 seconds</span>. Auto-generate GST invoices. Track every shipment, driver & payment — across all your companies.
            </p>

            {/* CTA row */}
            <div ref={ctaRef} style={{ opacity: 0 }} className="flex flex-wrap items-center gap-4 mt-9">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 text-white font-bold text-[15px] px-7 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1E4D8C)', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}
              >
                Start Free Trial — It&apos;s Free
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button className="inline-flex items-center gap-2.5 text-[15px] font-semibold px-7 py-4 rounded-full border transition-all duration-300 hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.2)' }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>▶</span>
                Watch Demo
              </button>
            </div>

            {/* Feature badge chips */}
            <div ref={badgesRef} style={{ opacity: 0 }} className="mt-10 flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span key={b} className="text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Floating LR Card */}
          <div ref={floatingCardRef} style={{ opacity: 0 }} className="relative hidden lg:block">
            {/* Glow behind card */}
            <div className="absolute -inset-10 rounded-3xl blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }} />

            {/* Main dashboard card */}
            <div className="relative rounded-3xl overflow-hidden border" style={{ background: 'rgba(15, 30, 60, 0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#E53935]"/><div className="w-3 h-3 rounded-full bg-[#FFB300]"/><div className="w-3 h-3 rounded-full bg-[#43A047]"/></div>
                <div className="flex-1 h-5 rounded-md flex items-center px-3" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                  FreightFlow · Mission Control
                </div>
                <div className="flex items-center gap-1.5 text-[#43A047] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43A047] animate-pulse"/>LIVE
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {[
                  { label: "Today's LRs", val: '47', color: '#42A5F5', sub: '+12 from yesterday' },
                  { label: 'Daily Revenue', val: '₹2.6L', color: '#FFB300', sub: 'Mumbai corridor' },
                  { label: 'Fleet Live', val: '12/20', color: '#43A047', sub: 'On trip today' },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-5" style={{ background: 'rgba(10,22,40,0.6)' }}>
                    <div className="text-[11px] mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{kpi.label}</div>
                    <div className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.val}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* LR list */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Today&apos;s Lorry Receipts</span>
                  <span className="text-[#2563EB] text-[11px] font-semibold cursor-pointer">View All →</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { lr: '#LR/2026-27/1005', route: 'SURAT → MUMBAI', party: 'Shree Shivay', amt: '₹13,125', status: 'IN TRANSIT', scolor: '#2563EB' },
                    { lr: '#LR/2026-27/1006', route: 'AHMD → PUNE', party: 'Aarambh FX', amt: '₹8,450', status: 'DELIVERED', scolor: '#43A047' },
                    { lr: '#LR/2026-27/1007', route: 'SURAT → DELHI', party: 'Kiran Traders', amt: '₹22,800', status: 'CREATED', scolor: '#FFB300' },
                  ].map((row) => (
                    <div key={row.lr} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold" style={{ color: '#42A5F5' }}>{row.lr}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${row.scolor}20`, color: row.scolor }}>{row.status}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <span>{row.route}</span>
                          <span>·</span>
                          <span>{row.party}</span>
                        </div>
                      </div>
                      <div className="text-white font-bold text-sm">{row.amt}</div>
                    </div>
                  ))}
                </div>

                {/* Revenue mini-chart */}
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-semibold text-white/60">Revenue Performance</span>
                    <span className="text-[#43A047] text-[11px] font-bold">+27% ↑</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-12">
                    {[35, 52, 45, 78, 65, 88, 72, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? '#2563EB' : 'rgba(37,99,235,0.3)', boxShadow: i === 7 ? '0 0 8px rgba(37,99,235,0.5)' : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini-badges around the card */}
            <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(255,179,0,0.15)', border: '1px solid rgba(255,179,0,0.3)', color: '#FFB300', backdropFilter: 'blur(10px)' }}>
              ⚡ LR created in 30s
            </div>
            <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(67,160,71,0.15)', border: '1px solid rgba(67,160,71,0.3)', color: '#43A047', backdropFilter: 'blur(10px)' }}>
              ✅ 100% GST Ready
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <div ref={statsRef} style={{ opacity: 0 }} className="relative z-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ divideColor: 'rgba(255,255,255,0.08)' }}>
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="flex flex-col items-center py-5 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-2xl sm:text-3xl font-black" style={{ color: '#FFB300', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
