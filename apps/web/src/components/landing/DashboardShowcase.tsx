'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Truck,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function DashboardShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto cycle slides every 3.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slides = [
    { id: 0, title: 'LR & Order Management', icon: FileText, label: 'Lorry Receipt & Pallet Dispatch' },
    { id: 1, title: 'Trip P&L & Settlement', icon: Truck, label: 'Live Trip Profit & Driver Expense' },
    { id: 2, title: 'GST & Compliance Engine', icon: ShieldCheck, label: 'GSTR-1, RCM & Vehicle Alerts' },
  ];

  // Helper for main slide container transform and opacity
  const getSlideStyles = (slideId: number) => {
    const isActive = activeSlide === slideId;
    const isPrevious = (activeSlide === 0 && slideId === 2) || (activeSlide === slideId + 1);

    if (isActive) {
      return {
        transform: 'translate3d(0, 0px, 0)',
        opacity: 1,
        zIndex: 10,
        pointerEvents: 'auto' as const,
        transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform, opacity',
      };
    }

    if (isPrevious) {
      // Outgoing slide moves downward (28px) & fades out
      return {
        transform: 'translate3d(0, 28px, 0)',
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
        transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform, opacity',
      };
    }

    // Incoming slide enters from top (-28px) & fades in
    return {
      transform: 'translate3d(0, -28px, 0)',
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none' as const,
      transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
      willChange: 'transform, opacity',
    };
  };

  // Helper for internal element staggered cascading entrance
  const getStaggerStyles = (slideId: number, itemIndex: number) => {
    const isActive = activeSlide === slideId;
    const delay = itemIndex * 50; // 50ms stagger per element
    return {
      transform: isActive ? 'translate3d(0, 0px, 0)' : 'translate3d(0, -16px, 0)',
      opacity: isActive ? 1 : 0,
      transition: `transform 550ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 550ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      willChange: 'transform, opacity',
    };
  };

  return (
    <div
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white"
      style={{
        boxShadow: '0 25px 70px -15px rgba(15, 23, 42, 0.15), 0 0 1px rgba(15, 23, 42, 0.1)',
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onFocus={() => setIsAutoPlaying(false)}
      onBlur={() => setIsAutoPlaying(true)}
    >
      {/* ================= HEADER BAR ================= */}
      <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        {/* Left branding & date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              FF
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">FreightFlow</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Monday, Sept 19</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-900 font-semibold">Welcome, Rajesh Patel</span>
          </div>
        </div>

        {/* Search bar & user controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              value="Search LR #, Vehicle GJ-05, Consignee..."
              className="pl-8 pr-4 py-1.5 rounded-full text-xs bg-white border border-slate-200 text-slate-600 w-56 sm:w-64 focus:outline-none shadow-xs"
            />
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
              RP
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTROLS & MODULE SELECTOR ================= */}
      <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
        {/* Module Slide Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {slides.map((slide) => {
            const Icon = slide.icon;
            const isActive = activeSlide === slide.id;
            return (
              <button
                key={slide.id}
                onClick={() => {
                  setActiveSlide(slide.id);
                  setIsAutoPlaying(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Company & Location Badges */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Surat HQ, Gujarat</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Shree Shivay Roadlines</span>
          </div>
        </div>
      </div>

      {/* ================= SLIDE CONTENT CONTAINER (FIXED HEIGHT GRID) ================= */}
      <div className="p-6 bg-slate-50/50 flex flex-col justify-between overflow-hidden">
        <div className="grid grid-cols-1 grid-rows-1 min-h-[440px] w-full">
          {/* ================= SLIDE 0: LR & PALLET DISPATCH ================= */}
          <div
            style={getSlideStyles(0)}
            className="col-start-1 row-start-1 flex flex-col justify-between space-y-5"
          >
            {/* Top Stat Ribbon with Stagger */}
            <div
              style={getStaggerStyles(0, 0)}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Today LRs', val: '47 Created', sub: '₹4.82 Lakh Total Freight', color: 'text-blue-600' },
                { label: 'Pallets Dispatched', val: '184 Pallets', sub: 'Linked with 12 LRs', color: 'text-emerald-600' },
                { label: 'Active Trucks', val: '18 / 20 Fleet', sub: 'On Surat-Mumbai Route', color: 'text-purple-600' },
                { label: 'e-Way Bill Generated', val: '100% Active', sub: 'Direct NIC Portal Sync', color: 'text-amber-600' },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                  <div className={`text-lg font-black mt-0.5 ${kpi.color}`}>{kpi.val}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Main LR Detail Card with Stagger */}
            <div
              style={getStaggerStyles(0, 1)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex-1 flex flex-col justify-between"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black border border-blue-200">
                    #LR/2026-27/0842
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> DISPATCHED
                  </span>
                  <span className="text-xs text-slate-400">· Date: 19 Sep 2026</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">
                    <Printer className="w-3.5 h-3.5" /> Consignee Copy
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">
                    <Printer className="w-3.5 h-3.5" /> Driver Copy
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    Print Pallet Slip →
                  </button>
                </div>
              </div>

              {/* LR Party & Freight Details Grid */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* Consignor & Consignee */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CONSIGNOR (SENDER)</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">TATA Steel Ltd</div>
                    <div className="text-xs text-slate-500">Hazira Industrial Zone, Surat, Gujarat</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CONSIGNEE (RECEIVER)</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">Reliance Infra Project Site</div>
                    <div className="text-xs text-slate-500">Navi Mumbai Special Economic Zone</div>
                  </div>
                </div>

                {/* Truck & Pallet Quantities */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ASSIGNED VEHICLE</span>
                    <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>GJ-05-BX-4921</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 rounded text-slate-700">16 Wheeler</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PALLET MANAGEMENT</span>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center justify-between">
                      <span>24 Industrial Pallets</span>
                      <span className="text-blue-600 font-bold">@ ₹450 / Pallet</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Pallet Slip #PS-8841 Attached</div>
                  </div>
                </div>

                {/* Freight Amount & GST */}
                <div className="space-y-2.5 p-3.5 rounded-xl bg-blue-50/40 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">FREIGHT BILLING & GST</span>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Base Freight Charge:</span>
                    <span className="font-bold text-slate-900">₹28,500</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Pallet Retention Charge:</span>
                    <span className="font-bold text-slate-900">₹2,400</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                    <span>Driver Advance Paid:</span>
                    <span>- ₹10,000</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200/60 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Net Payable</div>
                      <div className="text-base font-black text-blue-700">₹20,900</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded">GTA RCM 5% GST</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">e-Way Bill: #3810-9482</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SLIDE 1: TRIP P&L & SETTLEMENT ================= */}
          <div
            style={getSlideStyles(1)}
            className="col-start-1 row-start-1 flex flex-col justify-between space-y-5"
          >
            {/* Top Summary Banner with Stagger */}
            <div
              style={getStaggerStyles(1, 0)}
              className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Trip #TR-9924 · Surat HQ to JNPT Mumbai</div>
                  <div className="text-xs text-slate-400">Driver: Ramesh Kumar (Tata 16-Wheeler) · POD Status: Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Trip Revenue</div>
                  <div className="text-lg font-black text-white">₹42,000</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Expenses</div>
                  <div className="text-lg font-black text-rose-400">₹21,240</div>
                </div>
                <div className="pl-4 border-l border-slate-800">
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">Net Trip Profit</div>
                  <div className="text-xl font-black text-emerald-400">₹20,760 <span className="text-xs text-emerald-300 font-semibold">(49.4%)</span></div>
                </div>
              </div>
            </div>

            {/* Expense Breakdown & POD Audit with Stagger */}
            <div
              style={getStaggerStyles(1, 1)}
              className="grid md:grid-cols-2 gap-5 flex-1"
            >
              {/* Expense Ledger */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">TRIP EXPENSE BREAKDOWN</span>
                  <span className="text-[11px] font-semibold text-blue-600">Auto-Audited via FASTag & Petrol Pump API</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Diesel Fuel Drop (180 Liters @ Surat)', cost: '₹16,740', note: 'KMPL: 3.8 (Normal Range)', status: 'Approved' },
                    { title: 'FASTag Toll Plazas (8 Plazas on NH-48)', cost: '₹2,450', note: 'Auto-debited from Paytm Bank', status: 'Verified' },
                    { title: 'Driver Incentive & Meal Allowance', cost: '₹1,200', note: 'Per-trip incentive included', status: 'Paid' },
                    { title: 'Emergency Maintenance (Tyre Patch)', cost: '₹850', note: 'Receipt photo uploaded by driver', status: 'Approved' },
                  ].map((exp, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{exp.title}</div>
                        <div className="text-[10px] text-slate-500">{exp.note}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">{exp.cost}</div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{exp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Advance & POD Verification */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">PROOF OF DELIVERY (POD)</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-20" />
                      POD STAMP
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">Digital POD Uploaded by Driver App</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Location: JNPT Gate #3 (GPS: 18.95, 72.94)</div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-1">Signed by Stores Manager: V. Sharma</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-500">Driver Advance Balance: <span className="font-bold text-slate-900">₹0 Settled</span></div>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                    Settle Driver Account →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SLIDE 2: GST & COMPLIANCE ENGINE ================= */}
          <div
            style={getSlideStyles(2)}
            className="col-start-1 row-start-1 flex flex-col justify-between space-y-5"
          >
            <div className="grid md:grid-cols-3 gap-5 flex-1">
              {/* GSTR-1 & GSTR-3B Card with Stagger */}
              <div
                style={getStaggerStyles(2, 0)}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">GST COMPLIANCE HUB</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-2.5 flex-1 flex flex-col justify-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Monthly Taxable Turnover</div>
                    <div className="text-lg font-black text-slate-900">₹14,85,000</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">47 LRs Processed under GTA RCM</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="text-[10px] text-blue-600 font-bold uppercase">GTA RCM Tax Ledger Credit</div>
                    <div className="text-lg font-black text-blue-700">₹74,250</div>
                    <div className="text-[10px] text-blue-600 font-medium">Ready for GSTR-1 Auto-Filing</div>
                  </div>
                </div>
              </div>

              {/* TDS & Document Expiry Card with Stagger */}
              <div
                style={getStaggerStyles(2, 1)}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">VEHICLE EXPIRY ALERTS</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="space-y-2.5 flex-1 flex flex-col justify-center">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">GJ-05-BX-4921 Insurance Expiry</div>
                      <div className="text-[10px] text-amber-700 font-medium">Expiring in 5 Days (4 Oct 2026)</div>
                      <span className="inline-block mt-1 text-[9px] font-bold text-amber-800 underline cursor-pointer">Renew Policy Online →</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">GJ-27-TT-1092 Fitness & Permit</div>
                      <div className="text-[10px] text-slate-500">Valid till Nov 2026 (Compliant)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Ledger & MSME Compliance with Stagger */}
              <div
                style={getStaggerStyles(2, 2)}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">MSME & TDS (SEC 194C)</span>
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">TDS Deduction Reg:</span>
                      <span className="font-bold text-slate-900">₹29,700</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Form 26Q Export:</span>
                      <span className="font-bold text-emerald-600">Ready</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">MSME 45-Day Alert:</span>
                      <span className="font-bold text-slate-900">0 Overdue Invoices</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors mt-3">
                  Export GST & Compliance Pack (.ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM PAGINATION NAV ================= */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSlide(s.id);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === s.id ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${s.id + 1}`}
              />
            ))}
          </div>

          <div className="text-xs text-slate-400 font-semibold flex items-center gap-3">
            <span>Slide {activeSlide + 1} of 3</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1));
                  setIsAutoPlaying(false);
                }}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveSlide((prev) => (prev + 1) % 3);
                  setIsAutoPlaying(false);
                }}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
