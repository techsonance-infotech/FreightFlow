'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Infinity as InfinityIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';

const CHALLENGES = [
  {
    id: 'paperwork',
    title: 'Powerful Analytics',
    badge: 'LIVE READY',
    description: 'Instantly access detailed spending data down to the LR and corridor level in just a single click.',
    solution: 'Digitized LRs, auto-populated locations, and tax computations in under 30 seconds with immediate PDF sharing via WhatsApp.',
    visual: (
      <div className="w-full h-full flex items-center justify-center relative p-3">
        <div className="w-[78%] h-[135px] bg-white rounded-xl shadow-md border border-slate-200/90 p-3 flex flex-col justify-between relative -left-5 top-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <span>Overview</span>
              <span>Compare</span>
              <span className="text-blue-600 border-b-2 border-blue-600 pb-0.5">History Log</span>
            </div>
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+18.4% SAVINGS</span>
          </div>
          <div className="h-16 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 32 Q 25 38 45 18 T 85 8 L 100 14 L 100 40 L 0 40 Z"
                fill="url(#blueGrad)"
              />
              <path
                d="M 0 32 Q 25 38 45 18 T 85 8 L 100 14"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="85" cy="8" r="3" fill="#2563EB" />
            </svg>
          </div>
        </div>

        <div className="w-[155px] sm:w-[175px] bg-white rounded-xl shadow-xl border border-slate-200/90 p-3 absolute right-3 bottom-3 space-y-1.5 transition-transform duration-300 group-hover:-translate-y-1">
          <div className="text-[10px] font-bold text-slate-800 leading-tight">
            10" x 13" Self-Seal Padded Poly Mailers
          </div>
          <div className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
            UNL-9420 · LR #88492
          </div>
          <div className="h-9 w-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
            <span className="text-xs font-black text-slate-900">₹12.00</span>
            <span className="text-[8px] text-slate-400 font-semibold">25 Count</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'leakage',
    title: 'Pricing Benchmarks',
    badge: 'COMING SOON',
    description: 'Make data-driven logistics decisions with historical corridor pricing and benchmarks across millions of trips.',
    solution: 'Granular expense ledger tracking advances, fuel slips, tolls, and helper wages with live trip profitability.',
    visual: (
      <div className="w-full h-full flex flex-col justify-center p-3 space-y-1.5">
        <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between px-0.5">
          <span>HVAC / Foam Insulation</span>
          <span className="text-blue-600 text-[8px] font-extrabold cursor-pointer">Foam Insulation Roll (1/2" Thick) ▾</span>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden text-[10px]">
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-100 p-2 font-bold text-slate-400 text-[8px] uppercase tracking-wider">
            <span>VENDOR</span>
            <span>LEAD TIME</span>
            <span>STOCK</span>
            <span className="text-right">PRICE</span>
          </div>
          <div className="divide-y divide-slate-100 text-[9px]">
            <div className="grid grid-cols-4 p-2 items-center hover:bg-slate-50/60">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-black text-[8px]">G</div>
                <span className="font-bold text-slate-800">Global</span>
              </div>
              <span className="text-slate-500 font-semibold">2 Days</span>
              <span className="text-emerald-600 font-extrabold text-[8px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock</span>
              <span className="text-right font-bold text-slate-900">$81.77</span>
            </div>
            <div className="grid grid-cols-4 p-2 items-center bg-blue-50/50">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[8px]">FF</div>
                <span className="font-bold text-blue-700">FreightFlow</span>
              </div>
              <span className="text-slate-500 font-semibold">1 Day</span>
              <span className="text-amber-600 font-extrabold text-[8px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Low Stock</span>
              <span className="text-right font-extrabold text-blue-600">$78.98</span>
            </div>
            <div className="grid grid-cols-4 p-2 items-center hover:bg-slate-50/60">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center font-black text-[8px]">A</div>
                <span className="font-bold text-slate-800">Apex</span>
              </div>
              <span className="text-slate-500 font-semibold">3 Days</span>
              <span className="text-rose-500 font-extrabold text-[8px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Out of Stock</span>
              <span className="text-right font-bold text-slate-900">$79.09</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'compliance',
    title: 'Savings Insights',
    badge: 'COMING SOON',
    description: 'Automatically identify savings opportunities — from lower freight costs to tax RCM & SKU consolidation.',
    solution: 'One-click e-Way Bill check, automated GST/RCM calculator, and e-Invoice IRN registration inside booking.',
    visual: (
      <div className="w-full h-full flex items-center justify-center relative p-3">
        <div className="w-[85%] bg-white rounded-xl shadow-md border border-slate-200/90 p-3 space-y-2">
          <div className="text-[10px] font-black text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
            <span>Purchase Order #5555</span>
            <span className="text-slate-400 font-semibold">Surat Dispatch</span>
          </div>
          <div className="space-y-1 text-[9px] font-semibold text-slate-500">
            <div className="flex justify-between">
              <span>51 Items</span>
              <span className="text-slate-900 font-bold">$10,474.12</span>
            </div>
            <div className="flex justify-between">
              <span>Early Delivery</span>
              <span className="text-slate-900 font-bold">$699.00</span>
            </div>
            <div className="flex justify-between text-blue-600 bg-blue-50/80 p-1 rounded border border-blue-100">
              <span>Shipping</span>
              <span className="font-extrabold">$300.99</span>
            </div>
          </div>
        </div>

        <div className="w-[160px] sm:w-[185px] bg-white rounded-xl shadow-2xl border border-blue-300 p-3 absolute right-2 bottom-2 space-y-2 transition-transform duration-300 group-hover:scale-105">
          <div className="text-[8px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-blue-600" /> SAVINGS INSIGHT
          </div>
          <div className="text-[10px] font-extrabold text-slate-900 leading-snug">
            Consolidate Orders to save <span className="text-emerald-600 font-black">$1,223.98</span>?
          </div>
          <div className="flex gap-1.5">
            <button className="flex-1 py-1 rounded bg-blue-600 text-white font-bold text-[9px] shadow-xs">Yes</button>
            <button className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[9px]">No</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'expiry',
    title: 'Fleet Compliance Shield',
    badge: 'AUTOMATED',
    description: 'Automated expiry calendars and push notifications warning transport managers before documents expire.',
    solution: 'Never miss PUC, Fitness Certificate, or Insurance deadlines with automated alerts.',
    visual: (
      <div className="w-full h-full flex flex-col justify-center p-3 space-y-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-900">PUC Renewal</div>
              <div className="text-[9px] font-bold text-slate-400">Truck MH-04-1190</div>
            </div>
          </div>
          <span className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">7 DAYS LEFT</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-900">Fitness & Insurance</div>
              <div className="text-[9px] font-bold text-slate-400">Truck GJ-05-8821</div>
            </div>
          </div>
          <span className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">VERIFIED</span>
        </div>
      </div>
    ),
  },
  {
    id: 'profitability',
    title: 'Corridor Profitability',
    badge: 'LIVE READY',
    description: 'Live corridor-wise profit analysis, revenue trends, and immediate customer ledger statements at a single glance.',
    solution: 'Eliminate blind spot decision-making with real-time gross margin metrics computed per trip.',
    visual: (
      <div className="w-full h-full flex flex-col justify-center p-3 space-y-2">
        <div className="bg-white rounded-xl shadow-md border border-slate-200/90 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-900">
            <span>Surat ➔ Mumbai Corridor</span>
            <span className="text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-full text-[9px]">+24.2% Margin</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div className="bg-blue-600 h-full w-[65%]" />
            <div className="bg-emerald-500 h-full w-[25%]" />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-0.5">
            <span>Freight Revenue: ₹1.42L</span>
            <span className="text-slate-800 font-extrabold">Net Profit: ₹34,200</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function PainSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<any>(null);

  // GSAP ScrollTrigger Sticky Pinning Effect
  useEffect(() => {
    let ctx: any;
    const init = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      if (!sectionRef.current || !scrollTrackRef.current) return;

      const track = scrollTrackRef.current;

      ctx = gsap.context(() => {
        const getScrollAmount = () => {
          if (!track) return 0;
          const lastChild = track.lastElementChild as HTMLElement;
          if (!lastChild) return 0;

          const parent = track.parentElement;
          const paddingLeft = parent ? parseFloat(getComputedStyle(parent).paddingLeft) || 32 : 32;
          const lastChildRight = lastChild.offsetLeft + lastChild.offsetWidth;
          
          // Calculate exact shift required so the last card is fully visible with equal margin
          const requiredShift = lastChildRight - (window.innerWidth - paddingLeft * 2) + 48;
          return -Math.max(0, requiredShift);
        };

        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.abs(getScrollAmount()) * 1.3 + 400}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          animation: gsap.to(track, {
            x: getScrollAmount,
            ease: 'none',
          }),
          onUpdate: (self) => {
            const idx = Math.min(
              CHALLENGES.length - 1,
              Math.floor(self.progress * CHALLENGES.length)
            );
            setActiveIndex(idx);
          },
        });

        triggerRef.current = st;
      });
    };

    init();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  // Jump to specific card when dot/arrow clicked
  const scrollToCard = (index: number) => {
    if (triggerRef.current) {
      const progress = index / (CHALLENGES.length - 1);
      const st = triggerRef.current;
      const targetScroll = st.start + (st.end - st.start) * progress;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="pain-points"
      className="bg-[#F8FAFC] text-slate-900 relative overflow-hidden flex flex-col justify-center min-h-screen py-10"
    >
      {/* Header Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <InfinityIcon className="w-5 h-5 stroke-[2.5]" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Optimize spend for greater savings.
            </h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium mt-2">
              Consolidate spend and unlock savings up to{' '}
              <span className="text-blue-600 font-extrabold underline decoration-blue-300">18%</span>.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 mr-2">
              {CHALLENGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className={`w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                activeIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-300 text-slate-700'
              }`}
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToCard(Math.min(CHALLENGES.length - 1, activeIndex + 1))}
              disabled={activeIndex === CHALLENGES.length - 1}
              className={`w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                activeIndex === CHALLENGES.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-300 text-slate-700'
              }`}
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Horizontal Track */}
      <div className="w-full overflow-visible pl-[max(1rem,calc((100vw-80rem)/2+1.5rem))]">
        <div
          ref={scrollTrackRef}
          className="flex gap-6 text-slate-900 will-change-transform pr-16"
        >
          {CHALLENGES.map((item, index) => {
            const isFocused = index === activeIndex;
            return (
              <div
                key={item.id}
                className={`w-[80vw] sm:w-[380px] md:w-[440px] lg:w-[480px] shrink-0 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
                  isFocused
                    ? 'ring-2 ring-blue-500/20 border-blue-300 shadow-xl scale-[1.01]'
                    : 'opacity-90 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Upper Preview Area */}
                  <div className="w-full h-[180px] sm:h-[210px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70 p-3 relative overflow-hidden flex items-center justify-center border border-slate-200/60 mb-5">
                    {item.visual}
                  </div>

                  {/* Card Title + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{item.title}</h3>
                    {item.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200/90 uppercase tracking-wider shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Card Description */}
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
