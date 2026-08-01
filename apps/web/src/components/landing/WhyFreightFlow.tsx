'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  IndianRupee,
  Calculator,
  Navigation,
  Building2,
  Smartphone,
  CheckCircle2,
  Lock,
  Users,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const ADVANTAGES = [
  {
    step: '01',
    id: 'paperless-lr',
    title: 'Paperless LR & POD Management',
    desc: 'Stop writing LRs in registers or creating them in Excel. Generate professional Lorry Receipts in seconds, share them on WhatsApp, and keep every POD safely stored in the cloud.',
    // Custom High-Fidelity Mock Visual
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm sm:text-lg shadow-xs shrink-0">
              F
            </div>
            <div className="flex gap-1 overflow-hidden shrink min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-orange-500 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold shrink-0">FF</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold shrink-0">WA</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-rose-600 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold shrink-0">PDF</div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-bold shrink-0">POD</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5 min-w-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 flex items-center justify-between text-[11px] sm:text-xs">
              <span className="font-semibold text-slate-600 truncate">LR_Number / 2026</span>
              <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>
            <button className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900 text-white font-bold text-[11px] sm:text-xs shadow-xs truncate">
              Generate Digital LR
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '02',
    id: 'trip-expenses',
    title: 'Complete Control Over Trip Expenses',
    desc: 'Track driver advances, diesel, tolls, hamali, detention, and every trip expense in one place. Know the actual profit on every load—not just your monthly revenue.',
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-200 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 min-w-0">
            <div className="text-xs font-extrabold text-blue-600 flex items-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 shrink-0" /> Trip Expense Policy
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] sm:text-[11px] font-bold text-slate-700">
              <span>GL Codes</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] sm:text-[11px] font-bold text-slate-700">
              <span>Advance Limits</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '03',
    id: 'gst-eway',
    title: 'GST & e-Way Bill Made Simple',
    desc: 'Automatically calculate GST, handle GTA RCM correctly, and generate e-Way Bills without switching between multiple government portals.',
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 min-w-0">
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">GST Portal Sync</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">10 Active Taxpayers</div>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              AUTO RCM
            </span>
          </div>

          <div className="space-y-1 text-xs min-w-0">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded bg-blue-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">PD</div>
                <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate">Shree Shivay Ltd</span>
              </div>
              <span className="font-extrabold text-emerald-600 text-[10px] sm:text-[11px] shrink-0 ml-1">₹2.8K</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shrink-0">AS</div>
                <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate">Aarambh Logistics</span>
              </div>
              <span className="font-extrabold text-blue-600 text-[10px] sm:text-[11px] shrink-0 ml-1">₹5K RCM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button className="py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 font-bold text-[9px] sm:text-[10px] truncate">
              e-Way Bill
            </button>
            <button className="py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[9px] sm:text-[10px] truncate">
              GSTR-1
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '04',
    id: 'truck-visibility',
    title: 'Know Where Every Truck Is',
    desc: 'Monitor vehicle movement, trip status, and delivery progress in real time. Keep customers informed with accurate updates and faster response times.',
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between min-w-0 gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-black text-slate-900 truncate">Truck MH-04-AX-1190</div>
                <div className="text-[9px] text-slate-400 font-semibold truncate">Surat ➔ Mumbai</div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold bg-blue-100 text-blue-800 shrink-0">
              62 KM/H
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 h-full w-[72%]" />
          </div>

          <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-500 pt-0.5">
            <span>Dispatched: 06:30 AM</span>
            <span className="text-emerald-600 font-extrabold">Est: 04:15 PM</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '05',
    id: 'multi-branch',
    title: 'Built for Multi-Branch Transport Companies',
    desc: 'Whether you operate 5 trucks or 500, manage multiple branches, transport offices, users, and permissions from a single platform.',
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-black text-slate-900 truncate">Multi-Branch Center</span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">5 BRANCHES</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50/70 border border-blue-100 min-w-0">
              <div className="font-black text-slate-900 text-[10px] sm:text-[11px] truncate">Surat HO</div>
              <div className="text-[8px] sm:text-[9px] text-blue-600 font-bold mt-0.5 truncate">340 Trucks</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
              <div className="font-black text-slate-900 text-[10px] sm:text-[11px] truncate">Mumbai Terminal</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500 font-semibold mt-0.5 truncate">160 Trucks</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '06',
    id: 'driver-app',
    title: 'Simple Driver App',
    desc: 'Drivers can upload PODs, request advances, update trip status, and submit expenses directly from their phone—even on slow mobile networks.',
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative min-w-0">
        <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-black text-slate-900 truncate">Driver Portal</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 truncate">Trip #TR-8820</div>
              <div className="text-[8px] sm:text-[9px] text-slate-400 font-semibold truncate">Offline Sync Ready</div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-emerald-100 text-emerald-700 shrink-0 ml-1">Verified</span>
          </div>

          <button className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 text-white font-extrabold text-[10px] sm:text-xs shadow-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 1-Tap Upload POD
          </button>
        </div>
      </div>
    ),
  },
];

// Sub-component for Tablet and Mobile individual feature sections with fade + translateY scroll animation
function FeatureSectionItem({
  item,
  variant,
}: {
  item: (typeof ADVANTAGES)[0];
  variant: 'tablet' | 'mobile';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isTablet = variant === 'tablet';

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
      className={isTablet ? 'max-w-[720px] mx-auto text-center min-w-0' : 'w-full min-w-0'}
    >
      {/* Number Badge (Circular) */}
      <div
        className={`w-10 h-10 rounded-full border border-blue-500 bg-blue-50 text-blue-600 font-medium text-base flex items-center justify-center mb-4 ${
          isTablet ? 'mx-auto' : ''
        }`}
      >
        {item.step}
      </div>

      {/* Heading (32px on Tablet, 28px on Mobile) */}
      <h3
        className={`${
          isTablet ? 'text-[32px]' : 'text-[28px]'
        } font-bold text-slate-900 tracking-tight leading-tight mb-3 break-words`}
      >
        {item.title}
      </h3>

      {/* Description (16px) */}
      <p
        className={`text-base text-slate-500 font-normal leading-relaxed mb-6 break-words ${
          isTablet ? 'max-w-xl mx-auto' : ''
        }`}
      >
        {item.desc}
      </p>

      {/* Illustration Card (Placed BELOW content, 24px padding inside) */}
      <div
        className={`mt-6 w-full rounded-2xl bg-white border border-slate-200/90 shadow-lg p-6 min-h-[240px] flex items-center justify-center overflow-hidden min-w-0 ${
          isTablet ? 'max-w-[600px] mx-auto' : ''
        }`}
      >
        {item.visual}
      </div>
    </div>
  );
}

export default function WhyFreightFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 40 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Monitor desktop screen size for translate3d scroll tracking
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Update line indicator position dynamically relative to active step element
  useEffect(() => {
    const updateIndicator = () => {
      const currentEl = stepRefs.current[activeStep];
      if (currentEl) {
        setIndicatorStyle({
          top: currentEl.offsetTop,
          height: currentEl.offsetHeight,
        });
      }
    };

    updateIndicator();
    // Add small delay to ensure DOM layout / font rendering is ready
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeStep]);

  // Auto-update active step based on scroll proximity to middle of viewport on Desktop
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) return;
      let closestIdx = 0;
      let minDistance = Infinity;
      const targetY = window.innerHeight * 0.45;

      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - targetY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = index;
        }
      });

      setActiveStep(closestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-freightflow"
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden w-full"
    >
      <div className="max-w-7xl mx-auto relative z-10 w-full overflow-x-hidden">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-2">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full mb-4 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-400 border border-slate-200/80 bg-white shadow-2xs">
            <span className="opacity-40">|||||</span>
            <span>KEY ADVANTAGES</span>
            <span className="opacity-40">|||||</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
            Built for the way <span className="text-blue-600">Indian transport</span><br className="hidden sm:inline" />
            {' '}companies actually work.
          </h2>

          <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed">
            From booking to billing, FreightFlow helps transporters save time, prevent losses, and manage operations from one place.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. DESKTOP LAYOUT (1024px+) - UNTOUCHED & PRESERVED EXACTLY AS BEFORE */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-16 max-w-6xl mx-auto relative w-full overflow-x-hidden">
          {/* Desktop Left Column: Sticky Translate3d Visual Mock Card */}
          <div className="lg:col-span-6 relative h-full">
            <div
              className="w-full transition-transform duration-500 ease-out"
              style={{
                transform: isDesktop ? `translate3d(0, ${indicatorStyle.top}px, 0)` : 'none',
              }}
            >
              <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-lg p-5 relative overflow-hidden min-h-[290px] h-[290px] flex items-center justify-center">
                {ADVANTAGES.map((adv, i) => (
                  <div
                    key={adv.id}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                      activeStep === i
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-95 z-0 pointer-events-none'
                    }`}
                  >
                    {adv.visual}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Right Column: Vertical Step Timeline */}
          <div className="lg:col-span-6 flex gap-8 relative min-w-0">
            {/* Vertical Line with Active Blue Segment */}
            <div className="w-[2px] bg-slate-200/80 rounded-full relative self-stretch my-1 shrink-0">
              <div
                className="w-[2px] sm:w-[3px] bg-blue-600 rounded-full absolute -left-[0.5px] transition-all duration-300 ease-out"
                style={{
                  top: `${indicatorStyle.top}px`,
                  height: `${indicatorStyle.height}px`,
                }}
              />
            </div>

            {/* Step Items List */}
            <div className="space-y-20 pb-40 w-full min-w-0">
              {ADVANTAGES.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={item.id}
                    ref={(el) => { stepRefs.current[idx] = el; }}
                    onClick={() => setActiveStep(idx)}
                    className="cursor-pointer group transition-all duration-300 min-w-0"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Step Number Box */}
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-medium text-base shrink-0 transition-all duration-300 ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600'
                        }`}
                      >
                        {item.step}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Step Title */}
                        <h3
                          className={`text-3xl font-medium tracking-tight transition-colors duration-300 break-words ${
                            isActive
                              ? 'text-slate-900'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          {item.title}
                        </h3>

                        {/* Step Description */}
                        <p
                          className={`text-base font-normal leading-relaxed mt-2.5 transition-colors duration-300 break-words ${
                            isActive
                              ? 'text-slate-500 font-medium'
                              : 'text-slate-400/80 group-hover:text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TABLET LAYOUT (768px – 1023px) - SINGLE COLUMN, CENTERED (720px MAX-W) */}
        {/* ========================================================================= */}
        <div className="hidden md:block lg:hidden space-y-16 max-w-[720px] mx-auto px-6 w-full">
          {ADVANTAGES.map((item) => (
            <FeatureSectionItem key={item.id} item={item} variant="tablet" />
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 3. MOBILE LAYOUT (<768px) - PREMIUM SAAS STACKED LAYOUT (56px GAP) */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-[56px] w-full px-6">
          {ADVANTAGES.map((item) => (
            <FeatureSectionItem key={item.id} item={item} variant="mobile" />
          ))}
        </div>
      </div>
    </section>
  );
}
