'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  MapPin,
  Calendar,
  CreditCard,
  Bell,
  Moon,
  ChevronDown,
  Download,
  ArrowUpRight,
  PieChart,
  Activity,
  Layers,
  Users,
  Compass,
  DollarSign,
  Play,
  Pause,
  ArrowDown
} from 'lucide-react';

export default function DashboardShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [activeNav, setActiveNav] = useState('Mission Control');
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<number>(1);
  const isPausingAtBoundaryRef = useRef<boolean>(false);

  // IntersectionObserver: Only start auto-scroll when user reaches/views the hero dashboard section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth Auto-Scroll Loop logic
  useEffect(() => {
    if (!isAutoScrolling || !isVisible) return;

    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.6;

    const timer = setInterval(() => {
      if (!el || isPausingAtBoundaryRef.current) return;

      const maxScroll = el.scrollHeight - el.clientHeight;

      // When reaching bottom boundary
      if (directionRef.current === 1 && el.scrollTop >= maxScroll - 4) {
        isPausingAtBoundaryRef.current = true;
        setTimeout(() => {
          directionRef.current = -1;
          isPausingAtBoundaryRef.current = false;
        }, 1200); // 1.2s pause at bottom
        return;
      }

      // When reaching top boundary
      if (directionRef.current === -1 && el.scrollTop <= 4) {
        isPausingAtBoundaryRef.current = true;
        setTimeout(() => {
          directionRef.current = 1;
          isPausingAtBoundaryRef.current = false;
        }, 1200); // 1.2s pause at top
        return;
      }

      el.scrollTop += speed * directionRef.current;
    }, 25);

    return () => clearInterval(timer);
  }, [isAutoScrolling, isVisible]);

  // Handle manual user scrolling (mouse wheel, touch, scroll bar drag)
  const handleManualScroll = () => {
    // Pause auto-scroll immediately on manual scroll
    setIsAutoScrolling(false);

    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }

    // Resume auto-scroll after 2.5 seconds of no manual scrolling
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2500);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-[#0B1220] text-slate-100">
      {/* Outer Window Header Bar */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#070D18] flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Mac Window Controls + Active Entity */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 sm:h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-[9px] sm:text-[10px]">
              FF
            </div>
            <span className="font-extrabold text-white text-xs tracking-tight">FreightFlow</span>
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">| Enterprise Suite v4.2</span>
          </div>
        </div>

        {/* Search bar & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              value="Search LR, Vehicle, Driver..."
              className="pl-8 pr-4 py-1.5 rounded-full text-xs bg-slate-900 border border-slate-700/60 text-slate-300 w-44 lg:w-56 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
              <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
              AR
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">ANKIT RAJPUT</span>
              <span className="text-[9px] text-blue-400 font-semibold leading-none mt-0.5">PRIMARY ADMIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Scrollable Content) */}
      <div className="flex h-[500px] sm:h-[580px] bg-slate-50 text-slate-900 overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 shrink-0 bg-[#0A1628] text-slate-300 border-r border-slate-800/60 flex flex-col justify-between p-3 hidden lg:flex">
          <div className="space-y-4">
            {/* Active Company Selector */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">ACTIVE ENTITY</span>
                  <span className="text-xs font-bold text-white tracking-tight">AARAMBH LOGISTICS</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Nav Groups */}
            <div className="space-y-1">
              {[
                { name: 'Mission Control', icon: Activity, active: true },
                { name: 'Lorry Receipts (LR)', icon: FileText },
                { name: 'Pallet Tracking', icon: Layers },
                { name: 'Trip Management', icon: Truck },
                { name: 'Core Accounting', icon: DollarSign },
                { name: 'GST & Compliance', icon: ShieldCheck },
                { name: 'HR & Payroll', icon: Users },
                { name: 'Fleet Management', icon: Compass },
                { name: 'Reports & BI', icon: TrendingUp },
                { name: 'Master Registry', icon: Building2 },
                { name: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = item.name === activeNav;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Entity Footprint */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">SYSTEM ONLINE</span>
          </div>
        </aside>

        {/* Scrollable Main Content Area */}
        <main
          ref={scrollRef}
          onScroll={handleManualScroll}
          onWheel={(e) => {
            e.stopPropagation();
            handleManualScroll();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            handleManualScroll();
          }}
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => {
            if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
            userScrollTimeoutRef.current = setTimeout(() => {
              setIsAutoScrolling(true);
            }, 2000);
          }}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scroll-smooth overscroll-contain"
        >
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mission Control</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                FREIGHTFLOW OPERATIONAL ANALYTICS · 08 JULY 2026
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM READY
              </span>
              <button className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] sm:text-xs font-bold shadow-xs transition-all">
                EXPORT REPORTS
              </button>
              <button className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                + GENERATE NEW LR
              </button>
            </div>
          </div>

          {/* Quick Action Shortcut Cards (4 Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
            {[
              { title: 'Fleet Map', subtitle: 'LIVE REGION CONTROL', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Pallet Audit', subtitle: 'RECOVERY MATRIX', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Create LR', subtitle: 'NEW LORRY RECEIPT', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Start Trip', subtitle: 'DISPATCH VEHICLE', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-[11px] sm:text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {card.title}
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 truncate">
                      {card.subtitle}
                    </div>
                  </div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: "TODAY'S LRS", value: '3', change: '+12.5% VS LAST 7 DAYS', positive: true },
              { label: 'DAILY REVENUE', value: '₹2,455.14', change: '+3.8% PREV 24 HRS', positive: true },
              { label: 'RECEIVABLES', value: '₹335,205.96', change: '-2.1% OUTSTANDING', positive: false },
              { label: 'REG ALERTS', value: '0', change: 'NEXT 7 DAYS', neutral: true },
            ].map((metric) => (
              <div key={metric.label} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase truncate block">{metric.label}</span>
                <div className="text-base sm:text-2xl font-black text-slate-900 mt-1 truncate">{metric.value}</div>
                <div className="mt-1.5 sm:mt-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold tracking-tight bg-slate-100 text-slate-700 max-w-full truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1 shrink-0 ${
                      metric.neutral ? 'bg-slate-400' : metric.positive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="truncate">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Two-Column Analytics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column (2 Cols wide on Desktop) */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Today's Lorry Receipts Table */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Today's Lorry Receipts</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">OPERATIONAL OVERVIEW</p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">12 RECORDS</span>
                </div>
                <div className="mt-3 overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[340px] sm:min-w-[440px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2">LR NO</th>
                        <th className="py-2">PARTY / ROUTE</th>
                        <th className="py-2">DATE</th>
                        <th className="py-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
                      {[
                        { lr: 'NLR/2026-27/112', party: 'SHARMA ROADLINES', date: '20 Jul' },
                        { lr: 'NLR/2026-27/111', party: 'AARAMBH LOGISTICS', date: '20 Jul' },
                        { lr: 'NLR/2026-27/110', party: 'SHREE RAMDEV', date: '20 Jul' },
                        { lr: 'NLR/2026-27/109', party: 'KALANI TRANSPORTS', date: '19 Jul' },
                      ].map((row) => (
                        <tr key={row.lr} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-bold text-blue-600">{row.lr}</td>
                          <td className="py-2.5 font-semibold text-slate-800">{row.party}</td>
                          <td className="py-2.5 text-slate-500 font-medium">{row.date}</td>
                          <td className="py-2.5 text-right">
                            <div className="inline-flex items-center gap-1.5 text-slate-400">
                              <Download className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
                              <Printer className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Today's Pallet Load Table */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Today's Pallet Load</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">INVENTORY MOVEMENT LOG</p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">18 BATCHES</span>
                </div>
                <div className="mt-3 overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[340px] sm:min-w-[440px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2">SR NO</th>
                        <th className="py-2">LR NO</th>
                        <th className="py-2">DATE</th>
                        <th className="py-2">RECEIVER</th>
                        <th className="py-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
                      {[
                        { sr: '01', lr: 'LR/PL/2026-27/048', date: '20 Jul', party: 'RELIANCE INFRA LTD', status: 'CONFIRMED' },
                        { sr: '02', lr: 'LR/PL/2026-27/045', date: '20 Jul', party: 'TATA STEEL HAZIRA', status: 'CONFIRMED' },
                        { sr: '03', lr: 'LR/PL/2026-27/042', date: '20 Jul', party: 'ADANI LOGISTICS', status: 'IN TRANSIT' },
                        { sr: '04', lr: 'LR/PL/2026-27/038', date: '19 Jul', party: 'JINDAL POLY LTD', status: 'CONFIRMED' },
                      ].map((row) => (
                        <tr key={row.sr} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 text-slate-400 font-bold">{row.sr}</td>
                          <td className="py-2.5 font-bold text-blue-600">{row.lr}</td>
                          <td className="py-2.5 text-slate-500 font-medium">{row.date}</td>
                          <td className="py-2.5 font-semibold text-slate-800">{row.party}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Route Performance Card */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Route Performance</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">TOP SPEED DESTINATIONS</p>
                  </div>
                  <Compass className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-3 space-y-2 sm:space-y-2.5">
                  {[
                    { rank: '01', dest: 'SACHIN', rev: '₹109,922.86', routes: '12 ROUTES' },
                    { rank: '02', dest: 'LASKANA', rev: '₹101,43.28', routes: '8 ROUTES' },
                    { rank: '03', dest: 'LASKANA', rev: '₹90,24.28', routes: '6 ROUTES' },
                    { rank: '04', dest: 'KIM', rev: '₹82,03.36', routes: '4 ROUTES' },
                    { rank: '05', dest: 'KIM', rev: '₹43,23.28', routes: '2 ROUTES' },
                  ].map((item) => (
                    <div key={item.rank + item.dest} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                          {item.rank}
                        </span>
                        <div>
                          <div className="text-[11px] sm:text-xs font-black text-slate-900">{item.dest}</div>
                          <div className="text-[8px] sm:text-[10px] text-slate-500 font-semibold">ACTIVE CORRIDOR</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] sm:text-xs font-black text-slate-900">{item.rev}</div>
                        <span className="text-[8px] sm:text-[9px] font-bold text-blue-600 bg-blue-50 px-1 sm:px-1.5 py-0.5 rounded">
                          {item.routes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs transition-colors shadow-xs">
                  OPTIMIZE ROUTE MARGINS
                </button>
              </div>

              {/* Revenue Performance Chart */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Revenue Performance</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">OPERATIONAL VELOCITY LAST 6 MONTHS</p>
                  </div>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200">
                    LIVE TREND
                  </span>
                </div>
                <div className="mt-3 sm:mt-4 h-28 sm:h-36 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,100 Q 80,85 160,70 T 320,35 L 400,20 L 400,120 L 0,120 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M 0,100 Q 80,85 160,70 T 320,35 L 400,20"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="400" cy="20" r="4" fill="#2563EB" />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-400 mt-2 px-1">
                  <span>FEB</span>
                  <span>MAR</span>
                  <span>APR</span>
                  <span>MAY</span>
                  <span>JUN</span>
                  <span>JUL</span>
                </div>
              </div>

              {/* Bottom 3 Donut Charts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Total Revenue Share */}
                <div className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">TOTAL REVENUE SHARE</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">OVERALL MARKET PRESENCE</p>
                  </div>
                  <div className="my-3 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-6 sm:border-8 border-blue-600 border-t-emerald-500 border-r-amber-500 border-b-purple-500 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-700">
                      100%
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px] font-bold text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> SHARMA ROADLINES</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> AARAMBH LOGISTICS</span>
                    </div>
                  </div>
                </div>

                {/* Box LR Analytics */}
                <div className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">BOX LR ANALYTICS</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">UTILIZATION RATIO</p>
                  </div>
                  <div className="my-3 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-6 sm:border-8 border-emerald-500 border-t-emerald-400 border-r-slate-200 border-b-emerald-600 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-700">
                      68.4%
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px] font-bold text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 68.4% FTL DISPATCH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> 31.6% PARTIAL LOAD</span>
                    </div>
                  </div>
                </div>

                {/* Pallet Operations */}
                <div className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">PALLET OPERATIONS</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">INVENTORY DISTRIBUTION</p>
                  </div>
                  <div className="my-3 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-6 sm:border-8 border-amber-500 border-t-blue-500 border-r-indigo-500 border-b-slate-200 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-700">
                      4,290
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px] font-bold text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> ACTIVE WAREHOUSE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> IN TRANSIT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Financial Pulse */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Financial Pulse</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">CASH FLOW HEALTH</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">COLLECTIONS</span>
                    <span className="font-black text-slate-900">₹2,455.14</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[45%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">RECEIVABLES</span>
                    <span className="font-black text-slate-900">₹335,205.96</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full w-[85%]" />
                  </div>
                </div>

                <button className="w-full py-1.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-[11px] sm:text-xs font-bold shadow-xs transition-colors">
                  OPEN LEDGER
                </button>
              </div>

              {/* Recent Activity */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Recent Activity</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">LIVE OPERATIONS LOG</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {[
                    { action: 'switch_company', user: 'ANKIT RAJPUT', time: 'ABOUT 2 HOURS AGO' },
                    { action: 'switch_company', user: 'ANKIT RAJPUT', time: '1 DAY AGO' },
                    { action: 'switch_company', user: 'ANKIT RAJPUT', time: '1 DAY AGO' },
                    { action: 'switch_company', user: 'ANKIT RAJPUT', time: '2 DAYS AGO' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{act.action}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{act.user} · {act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Compliance</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">RED FLAG READINESS</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 text-center text-[11px] sm:text-xs font-bold text-slate-500">
                  NO UPCOMING DEADLINES
                </div>
              </div>

              {/* Settlement Monitor */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Settlement Monitor</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">DRIVER BALANCES</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-900">PENDING MISSIONS</span>
                  <span className="text-xs sm:text-sm font-black text-amber-700">0 Missions</span>
                </div>
                <button className="w-full py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold shadow-xs transition-colors">
                  START SETTLEMENT
                </button>
              </div>

              {/* Fleet Status Donut */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">Fleet Status</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">UTILIZATION</p>
                </div>
                <div className="flex justify-center my-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[8px] sm:border-[10px] border-emerald-500 border-t-emerald-400 border-r-slate-200 flex items-center justify-center text-xs font-black text-slate-800">
                    84%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ON TRIP</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> IDLE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-4 sm:pt-6 border-t border-slate-200/80 text-center space-y-1">
            <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
              FREIGHTFLOW © 2026 · LOGISTICS & SUPPLY CHAIN INTELLIGENCE
            </p>
            <p className="text-[8px] sm:text-[9px] font-bold text-blue-600 tracking-wider uppercase">
              PRODUCT BUILT & POWERED BY TECHSONANCE INFOTECH LLP
            </p>
          </div>
        </main>
      </div>

      {/* Floating Auto-Scroll Toggle & Indicator Bar */}
      <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#070D18] border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-300 hidden sm:inline">Live Dashboard Stream</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">Scroll inside frame to explore</span>
        </div>

        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] sm:text-[11px] transition-colors cursor-pointer shrink-0"
        >
          {isAutoScrolling ? (
            <>
              <Pause className="w-3 h-3 text-amber-400" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-emerald-400" /> Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}
