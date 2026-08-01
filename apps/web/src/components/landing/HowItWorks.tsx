'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  Receipt,
  Truck,
  Box,
  Calculator,
  CheckCircle2,
  Share2,
  Download,
  BadgeCheck,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    id: 'booking',
    icon: ClipboardList,
    title: 'Dealer Books Shipment',
    subtitle: 'Digital booking & reference auto-linking',
    desc: 'Consignee & dealer details captured digitally. Party reference, GST bill ref, and E-Way Bill auto-linked in seconds with zero manual registry entry.',
    tag: 'STEP 01 · DIGITAL BOOKING',
    highlights: [
      'Instant party reference & GST validation',
      'Auto-linking with government E-Way portal',
      'Digital booking confirmation sent on WhatsApp',
    ],
    detail: ['Party: Shree Shivay Roadlines', 'E-Way Bill: 411234567890', 'Issue Date: 10 Jun 2026'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Shipment Booking</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">Ref #BK-2026-9901</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              CONFIRMED
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-500">Party Name</span>
              <span className="font-bold text-slate-800 truncate ml-2">Shree Shivay Roadlines</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-500">E-Way Bill</span>
              <span className="font-mono font-bold text-blue-600">411234567890</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0" /> Auto-linked to Consignee Portal
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '02',
    id: 'lr-create',
    icon: Receipt,
    title: 'LR Created in 30 Seconds',
    desc: 'Auto-generated LR# (LR/2026-27/1005). Automatic rate calculation, GST toggle, and instant submission checklist without touching paper registers.',
    tag: 'STEP 02 · INSTANT LR',
    highlights: [
      'Sequential auto-numbering & PDF creation',
      'One-click WhatsApp sharing with party & driver',
      'Full compliance checklist pre-validated',
    ],
    detail: ['LR#: LR/2026-27/1005', 'Route: SURAT → MUMBAI', 'Freight: ₹13,125 WITH GST'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Lorry Receipt #1005</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">SURAT ➔ MUMBAI</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              GENERATED
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Freight Rate</span>
              <span className="text-slate-900">₹13,125</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>GST Status (18% IGST)</span>
              <span className="text-blue-600 font-bold">AUTO-APPLIED</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs">
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button className="py-2 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs">
              <Download className="w-3.5 h-3.5" /> PDF Copy
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '03',
    id: 'vehicle',
    icon: Truck,
    title: 'Vehicle Assigned + Route Mapped',
    desc: 'Fleet allocation directly from driver registry. Driver assigned instantly and live route dispatched to GPS fleet tracking map.',
    tag: 'STEP 03 · FLEET DISPATCH',
    highlights: [
      'Driver advance & fuel limits enforced',
      'Real-time GPS tracking link auto-generated',
      'Live route ETA updates shared with customer',
    ],
    detail: ['Vehicle: GJ 05 AX 1234', 'Driver: Ramesh K.', 'Route: 312 km · Est. 6h'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Vehicle GJ 05 AX 1234</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">Driver: Ramesh K.</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
              DISPATCHED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-blue-600" /> Route Distance</span>
              <span>312 km (Est. 6h)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full w-[65%]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[10px] font-semibold text-slate-600">
            <span>Advance: ₹4,500</span>
            <span className="text-emerald-600 font-bold">Fuel Slip Issued</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '04',
    id: 'pallet',
    icon: Box,
    title: 'Pallet Load Tracked',
    desc: 'Inventory payload tracked by boxes, weight (KG), and DCFI reference. Batch PL/2026-27 reconciled per partner with zero cargo loss.',
    tag: 'STEP 04 · CARGO PAYLOAD',
    highlights: [
      'Box count & package weight reconciliation',
      'Barcode batch tracking for cargo safety',
      'Instant load confirmation receipt',
    ],
    detail: ['Boxes: 125 pcs · 875 KG', 'Partner: Aarambh FX Events', 'Batch: PL/2026-27/5001'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Box className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Pallet Load #PL-5001</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">125 pcs · 875 KG Payload</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              LOADED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[9px] text-slate-400 font-semibold">Partner Client</div>
              <div className="font-bold text-slate-800 truncate">Aarambh FX</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[9px] text-slate-400 font-semibold">Weight Status</div>
              <div className="font-bold text-emerald-600">875 KG Verified</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '05',
    id: 'gst',
    icon: Calculator,
    title: 'GST Invoice Auto-Generated',
    desc: 'CGST/SGST/IGST calculated automatically. GTA RCM rules applied correctly with one-click tax invoice generation.',
    tag: 'STEP 05 · GST & RCM TAX',
    highlights: [
      'GTA RCM status auto-calculated',
      'GSTR-1 return filing export ready',
      'Automated SAC 9965 tax classification',
    ],
    detail: ['GST: 18% IGST = ₹2,362', 'SAC Code: 9965', 'GSTR-1 Ready'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Tax Invoice #INV-9982</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">SAC 9965 · GTA Service</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              READY
            </span>
          </div>

          <div className="space-y-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Amount</span>
              <span className="font-bold">₹13,125</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IGST (18%)</span>
              <span className="font-bold text-emerald-600">₹2,362.50</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
              <span>Total Invoice</span>
              <span>₹15,487.50</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: '06',
    id: 'pod',
    icon: CheckCircle2,
    title: 'POD Delivered — Payment Settled',
    desc: 'Collections, receivables, and driver advances settled with digital proof of delivery. Financial Pulse updated instantly with zero leakage.',
    tag: 'STEP 06 · POD & SETTLEMENT',
    highlights: [
      'Digital POD image uploaded & verified',
      'Automated driver advance reconciliation',
      'Real-time trip margin & net profit calculated',
    ],
    detail: ['Collected: ₹13,125', 'AR Cleared: 0 pending', 'Net Margin: ₹3,812 (29%)'],
    visual: (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 relative min-w-0">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Payment & POD Settled</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">Zero Balance Remaining</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
              SETTLED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-100">
              <div className="text-[9px] text-slate-500 font-semibold">Collected Amount</div>
              <div className="font-extrabold text-emerald-700 text-xs">₹15,487.50</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-100">
              <div className="text-[9px] text-slate-500 font-semibold">Net Trip Margin</div>
              <div className="font-extrabold text-blue-700 text-xs">₹3,812 (29%)</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

// Tablet & Mobile Compact Responsive Item
function HowItWorksResponsiveItem({
  item,
  variant,
}: {
  item: (typeof STEPS)[0];
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
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
      className={isTablet ? 'max-w-[720px] mx-auto text-center min-w-0' : 'w-full min-w-0'}
    >
      {/* Compact Circular Number Badge */}
      <div
        className={`w-8 h-8 rounded-full border border-blue-400 bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center mb-3 ${
          isTablet ? 'mx-auto' : ''
        }`}
      >
        {item.step}
      </div>

      {/* Compact Heading */}
      <h3
        className={`${
          isTablet ? 'text-[28px]' : 'text-[22px] sm:text-[25px]'
        } font-bold text-slate-900 tracking-tight leading-tight mb-2 break-words`}
      >
        {item.title}
      </h3>

      {/* Compact Description */}
      <p
        className={`text-sm text-slate-500 font-normal leading-relaxed mb-4 break-words ${
          isTablet ? 'max-w-lg mx-auto' : ''
        }`}
      >
        {item.desc}
      </p>

      {/* Compact Visual Mockup Card (Placed BELOW content) */}
      <div
        className={`w-full rounded-xl bg-white border border-slate-200/90 shadow-md p-4 min-h-[200px] flex items-center justify-center overflow-hidden min-w-0 ${
          isTablet ? 'max-w-[580px] mx-auto' : ''
        }`}
      >
        {item.visual}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedContentRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Sticky Pinning Effect for Desktop
  useEffect(() => {
    let ctx: any;
    const initGSAP = async () => {
      if (window.innerWidth < 1024) return; // Desktop only

      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      if (!sectionRef.current || !pinnedContentRef.current) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: pinnedContentRef.current,
          start: 'top top+=75',
          end: '+=2000',
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const stepIdx = Math.min(
              STEPS.length - 1,
              Math.floor(p * STEPS.length)
            );
            setActiveStep(stepIdx);
          },
        });
      });
    };

    initGSAP();
    return () => ctx?.revert();
  }, []);

  const currentItem = STEPS[activeStep];
  const progressPercent = (activeStep / (STEPS.length - 1)) * 100;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="bg-[#F8FAFC] text-slate-900 relative w-full"
    >
      {/* 1. DESKTOP GSAP STICKY SCROLL PINNED LAYOUT (1024px+) */}
      <div className="hidden lg:block w-full relative min-h-[2600px] py-10">
        <div
          ref={pinnedContentRef}
          className="max-w-6xl mx-auto px-6 py-4"
        >
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 text-[11px] font-mono font-bold tracking-widest text-blue-600 border border-blue-200 bg-blue-50/80 shadow-2xs">
              <span className="opacity-40">|||||</span>
              <span>HOW IT WORKS</span>
              <span className="opacity-40">|||||</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-1.5">
              From booking to settlement.{' '}
              <span className="text-blue-600">Automated.</span>
            </h2>

            <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
              6 simple steps. One integrated platform. Your entire transport operation — digitized, tracked, and settled with zero leakage.
            </p>
          </div>

          {/* Top Horizontal Process Pipeline Track */}
          <div className="mb-6 overflow-x-auto pb-2 pt-1 no-scrollbar">
            <div className="flex items-center justify-between min-w-[760px] max-w-4xl mx-auto px-6 relative">
              {/* Line track container inset exactly to center of badge 01 (left-9 / 36px) and badge 06 (right-9 / 36px) */}
              <div className="absolute top-[18px] left-[36px] right-[36px] h-[3px] bg-slate-200/80 rounded-full -z-0">
                {/* Dynamic Active Progress Line extending 0% to 100% of line track */}
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>

              {STEPS.map((s, idx) => {
                const isActive = activeStep === idx;
                const isPassed = activeStep > idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(idx)}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer transition-all duration-300 focus:outline-none"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-110 ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-blue-50 text-blue-600 border border-blue-300'
                          : 'bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300 group-hover:text-slate-600'
                      }`}
                    >
                      {s.step}
                    </div>
                    <span
                      className={`text-[11px] font-bold transition-colors duration-300 whitespace-nowrap ${
                        isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Stage Showcase Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 relative overflow-hidden transition-all duration-500">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left Side Details */}
              <div className="col-span-6 space-y-3.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-200">
                  <Sparkles className="w-3 h-3" />
                  {currentItem.tag}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {currentItem.title}
                </h3>

                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                  {currentItem.desc}
                </p>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-1">
                  {currentItem.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Navigation Stepper Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={activeStep === STEPS.length - 1}
                      onClick={() => setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-slate-400">
                    STEP {activeStep + 1} OF {STEPS.length}
                  </div>
                </div>
              </div>

              {/* Right Side Visual Mockup Card */}
              <div className="col-span-6 min-h-[270px] bg-[#F8FAFC] rounded-xl border border-slate-200/90 p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="w-full transition-all duration-500 transform">
                  {currentItem.visual}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLET & MOBILE COMPACT RESPONSIVE LAYOUT (<1024px) */}
      <div className="block lg:hidden max-w-7xl mx-auto px-4 py-12 sm:py-16">
        {/* Compact Section Header */}
        <div className="text-center mb-10 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-blue-600 border border-blue-200 bg-blue-50/80 shadow-2xs">
            <span className="opacity-40">|||||</span>
            <span>HOW IT WORKS</span>
            <span className="opacity-40">|||||</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
            From booking to settlement.<br className="hidden sm:inline" />
            {' '}<span className="text-blue-600">Automated.</span>
          </h2>

          <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            6 simple steps. One integrated platform. Your entire transport operation — digitized, tracked, and settled with zero leakage.
          </p>
        </div>

        {/* Tablet Layout (768px - 1023px) */}
        <div className="hidden md:block lg:hidden space-y-12 max-w-[720px] mx-auto px-4 w-full">
          {STEPS.map((item) => (
            <HowItWorksResponsiveItem key={item.id} item={item} variant="tablet" />
          ))}
        </div>

        {/* Mobile Compact Layout (<768px) */}
        <div className="block md:hidden space-y-10 w-full px-2">
          {STEPS.map((item) => (
            <HowItWorksResponsiveItem key={item.id} item={item} variant="mobile" />
          ))}
        </div>
      </div>
    </section>
  );
}
