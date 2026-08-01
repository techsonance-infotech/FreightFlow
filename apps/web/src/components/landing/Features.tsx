'use client';

import React from 'react';
import {
  CheckCircle2,
  FileText,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
  Sparkles,
  Smartphone,
  Globe,
  Printer,
  Download,
  Share2,
  AlertTriangle,
  Check,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'lr',
    num: '01',
    title: 'Lorry Receipt & Order Management',
    headline: 'Create LRs in 30 seconds.',
    sub: 'Auto-numbered, route-mapped, and print-ready templates for consignee, driver, and HSN copies.',
    bullets: [
      'Auto-generated sequential LR# (e.g. #LR/2026-27/1005)',
      'Smart route-mapping: Surat → Mumbai auto-populated with distance',
      'Inventory attributes: Box quantity, Weight, DCFI#, and Material Type',
      'One-click download of PDF & print copies',
    ],
    badge: '30s LR Creation',
    color: '#2563EB',
    mockup: 'lr',
  },
  {
    id: 'trip',
    num: '02',
    title: 'Trip Management',
    headline: 'Your entire trip lifecycle, tracked.',
    sub: 'Dispatch vehicles, record driver advances, log fuel slips, and compute per-trip P&L automatically.',
    bullets: [
      'Trip Profitability (P&L) calculated automatically upon closing',
      'Driver ledger tracking advances, trip allowances, and wages',
      'Fuel yield monitoring (KMPL tracker) & theft detection alerts',
      'Tolls and trip allowance tracking linked to driver app',
    ],
    badge: 'Per-Trip P&L',
    color: '#0D9488',
    mockup: 'trip',
  },
  {
    id: 'accounting',
    num: '03',
    title: 'Core Accounting',
    headline: 'Double-entry ledger made simple.',
    sub: 'Complete ledger systems, real-time AR/AP tracking, bank statement reconciliation, and party balances.',
    bullets: [
      'Fully integrated general ledger with auto-posting from bookings',
      'Real-time AR/AP tracking per client and vendor',
      'Bank statement reconciliation matching cash receipts',
      'Consolidated outstanding statement of accounts',
    ],
    badge: 'Double-Entry Ledger',
    color: '#4F46E5',
    mockup: 'accounting',
  },
  {
    id: 'gst',
    num: '04',
    title: 'GST & Compliance',
    headline: 'Never miss a tax deadline.',
    sub: 'CGST/SGST/IGST auto-calculations, RCM for GTA compliance, e-Way Bill, and e-Invoice IRN.',
    bullets: [
      'Reverse Charge Mechanism (RCM) calculator built for GTA rules',
      'E-Way Bill integration (validate NIC numbers directly)',
      'e-Invoice IRN generation on booking confirmation',
      'Automated GSTR-1 and GSTR-3B data preparation tables',
    ],
    badge: '100% GST Native',
    color: '#059669',
    mockup: 'gst',
  },
  {
    id: 'hr',
    num: '05',
    title: 'HR & Payroll',
    headline: 'Manage drivers and staff.',
    sub: 'Driver master profiles, PF/ESI/PT calculations, dynamic payslips, and Form 16 compliance.',
    bullets: [
      'Driver and staff master registry with document tracking',
      'Automated PF, ESI, and Professional Tax calculations',
      'Dynamic payslip generation with WhatsApp sharing',
      'Form 16 compliance prep for employees',
    ],
    badge: 'PF/ESI Ready',
    color: '#7C3AED',
    mockup: 'hr',
  },
  {
    id: 'fleet',
    num: '06',
    title: 'Fleet & Maintenance',
    headline: 'Keep your fleet running.',
    sub: 'Document expiry notifications (PUC, Fitness, Insurance), job cards, fuel slips, and tyre lifecycles.',
    bullets: [
      'PUC, Fitness, and Insurance expiry alerts before they occur',
      'Vehicle maintenance job cards and spare part tracking',
      'Fuel yield (KMPL) and fuel card integration',
      'Tyre lifecycle tracking and tyre rotation schedules',
    ],
    badge: 'Maintenance Hub',
    color: '#D97706',
    mockup: 'fleet',
  },
  {
    id: 'ai',
    num: '07',
    title: 'AI & Automation',
    headline: 'Zero-touch document entry.',
    sub: 'Scan and process bills with OCR, auto-reconcile POD matches, and detect ledger anomalies.',
    bullets: [
      'OCR for transport invoice data extraction from PDFs/images',
      'Automated anomaly check on fuel receipts and distance matching',
      'Natural-language data queries for operational reporting',
      'Auto-reconcile scanned POD matches to bookings',
    ],
    badge: 'AI OCR Scan',
    color: '#0284C7',
    mockup: 'ai',
  },
  {
    id: 'driver',
    num: '08',
    title: 'Driver Mobile App',
    headline: 'Empower your drivers.',
    sub: 'Driver companion app for direct WhatsApp POD upload, advance requests, and route details.',
    bullets: [
      'React Native companion app built for low network usage',
      'Direct WhatsApp POD photo upload and status tracking',
      'Instant driver advance requests with digital proof',
      'Local language support for drivers',
    ],
    badge: 'Driver Companion',
    color: '#EA580C',
    mockup: 'driver',
  },
  {
    id: 'portal',
    num: '09',
    title: 'Customer Portal',
    headline: 'Self-serve tracking and billing.',
    sub: 'Provide clients live tracking, digital POD access, statements, and Razorpay payments.',
    bullets: [
      'Client login dashboard showing active shipment logs',
      'Digital POD access and historical statement downloads',
      'Razorpay payment gateway integration for outstanding balances',
      'Statement of Account exports in PDF/Excel formats',
    ],
    badge: 'Client Portal',
    color: '#16A34A',
    mockup: 'portal',
  },
];

function LRMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Lorry Receipt</div>
          <div className="text-amber-400 font-extrabold text-sm sm:text-base">#LR/2026-27/1005</div>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold tracking-wider border border-amber-400/20">
          IN TRANSIT
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Origin</div>
          <div className="text-white font-bold text-xs sm:text-sm mt-0.5">Surat Depot</div>
        </div>
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Destination</div>
          <div className="text-white font-bold text-xs sm:text-sm mt-0.5">Mumbai Hub</div>
        </div>
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Boxes</div>
          <div className="text-white font-extrabold text-xs sm:text-sm mt-0.5">125 Pcs</div>
        </div>
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Weight</div>
          <div className="text-white font-extrabold text-xs sm:text-sm mt-0.5">875 KG</div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
        <div>
          <div className="text-slate-400 text-[10px]">Net Freight</div>
          <div className="text-amber-400 font-extrabold text-base sm:text-lg">₹13,125</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-[10px]">GST Billing</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">WITH GST (18%)</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Print 3-Copy LR
        </button>
        <button className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
      </div>
    </div>
  );
}

function TripMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <span className="text-white font-bold text-sm">Trip Performance Monitor</span>
        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          GJ 05 AX 1234
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Driver Advance</div>
          <div className="text-white font-bold text-xs sm:text-sm mt-0.5">₹5,000</div>
        </div>
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Fuel Slips Logged</div>
          <div className="text-white font-bold text-xs sm:text-sm mt-0.5">₹8,500</div>
        </div>
      </div>

      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
        <span className="text-emerald-400 font-semibold">Net Profit Margin</span>
        <span className="text-emerald-400 font-extrabold text-sm">₹4,200 (31%)</span>
      </div>
    </div>
  );
}

function AccountingMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <span className="text-white font-bold text-sm">General Ledger Accounts</span>
        <span className="text-slate-400 text-[10px] uppercase font-semibold">Double-Entry</span>
      </div>

      <div className="space-y-2.5">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Outstanding AR (Receivables)</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Accounts Receivable</div>
          </div>
          <span className="text-amber-400 font-extrabold text-sm">₹3.4 Lakhs</span>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Bank Statement Sync</div>
            <div className="text-slate-400 text-[10px] mt-0.5">State Bank of India</div>
          </div>
          <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Matched (98%)
          </span>
        </div>
      </div>
    </div>
  );
}

function GstMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="text-white font-bold text-sm">GST Compliance Center</div>
        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          NIC Connected
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-300 font-medium">e-Way Bill #4112345678</span>
          <span className="text-emerald-400 font-bold text-[11px]">VALID (Active)</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-300 font-medium">GTA Tax RCM</span>
          <span className="text-emerald-400 font-bold text-[11px]">Auto-Calculated (5%)</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-300 font-medium">e-Invoice IRN Status</span>
          <span className="text-emerald-400 font-bold text-[11px]">Generated ✅</span>
        </div>
      </div>
    </div>
  );
}

function HrMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="text-white font-bold text-sm">Driver Payroll Master</div>
        <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          PF/ESI Compliant
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Ramesh Kumar (Driver GJ05)</div>
            <div className="text-slate-400 text-[10px]">Net Wages + Allowances</div>
          </div>
          <span className="text-white font-bold text-sm">₹22,450</span>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Provident Fund (PF)</div>
            <div className="text-slate-400 text-[10px]">Employer Share Auto-post</div>
          </div>
          <span className="text-slate-300 font-bold">₹1,800</span>
        </div>
      </div>
    </div>
  );
}

function FleetMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="text-white font-bold text-sm">Fleet Compliance Expiries</div>
        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          PUC / Fitness
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-white rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-xs">Fitness Certificate (GJ 05 AX 1234)</div>
            <div className="text-red-400 text-[10px] mt-0.5">Expires in 3 days</div>
          </div>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-white rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-xs">National Permit Renewal</div>
            <div className="text-amber-400 text-[10px] mt-0.5">Expires in 8 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="text-white font-bold text-sm">AI Engine Scanning</div>
        <span className="text-sky-400 text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          99.4% OCR Confidence
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="text-slate-400 text-[10px]">Uploaded Invoice File</div>
          <div className="text-white font-bold mt-0.5">Invoice-Surat-1002.pdf</div>
          <div className="text-sky-400 text-[10px] mt-1">Parsed: Date, GSTIN, and Total Amount correctly</div>
        </div>
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
          <span className="text-emerald-400 font-semibold">Anomalies Detected</span>
          <span className="text-emerald-400 font-extrabold">0 Errors</span>
        </div>
      </div>
    </div>
  );
}

function DriverAppMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs shadow-xl max-w-xs mx-auto">
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-800 p-3 text-center text-white font-bold text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-blue-400" /> Driver App</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="p-3.5 space-y-3">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[9px] uppercase font-semibold">Active Trip</div>
            <div className="text-white font-bold mt-0.5">Surat Depot → Mumbai Hub</div>
            <div className="text-orange-400 text-[10px] font-bold mt-0.5">GJ 05 AX 1234</div>
          </div>
          <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-lg text-center transition-colors text-xs flex items-center justify-center gap-1.5">
            📸 Upload POD Photo
          </button>
          <button className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-center transition-colors text-[11px]">
            Request Advance (Cash)
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerPortalMockup() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white text-xs space-y-3 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="text-white font-bold text-sm">Customer Self-Serve</div>
        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Razorpay Integrated
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Active Shipment Tracking</div>
            <div className="text-slate-400 text-[10px] mt-0.5">GJ05AX1234 · 12 km to destination</div>
          </div>
          <span className="text-emerald-400 font-bold text-xs">On Time</span>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Outstanding Dues</div>
            <div className="text-slate-400 text-[10px] mt-0.5">1 invoice pending</div>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs">
            Pay ₹13,125
          </button>
        </div>
      </div>
    </div>
  );
}

const MOCKUP_MAP: Record<string, React.ReactNode> = {
  lr: <LRMockup />,
  trip: <TripMockup />,
  accounting: <AccountingMockup />,
  gst: <GstMockup />,
  hr: <HrMockup />,
  fleet: <FleetMockup />,
  ai: <AiMockup />,
  driver: <DriverAppMockup />,
  portal: <CustomerPortalMockup />,
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] text-slate-900 relative w-full overflow-hidden"
    >
      {/* Background Soft Glow Radial */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24 relative z-10 px-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 text-xs font-mono font-bold tracking-widest text-blue-600 border border-blue-200 bg-blue-50/80 shadow-2xs">
          <span className="opacity-40">|||||</span>
          <span>ENTERPRISE-GRADE CAPABILITIES</span>
          <span className="opacity-40">|||||</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
          Everything your transport<br className="hidden sm:inline" />
          {' '}<span className="text-blue-600">business needs to grow.</span>
        </h2>

        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          No more complex spreadsheets. Manage bookings, dispatch, accounting, and client reporting under a single unified dashboard.
        </p>
      </div>

      {/* STICKY STACKING CARDS CONTAINER */}
      <div className="max-w-5xl mx-auto relative z-10 space-y-12 sm:space-y-16 pb-20">
        {FEATURES.map((feat, i) => (
          <div
            key={feat.id}
            className="sticky top-20 sm:top-24 transition-all duration-300"
            style={{
              zIndex: 10 + i,
            }}
          >
            {/* STACKED CARD ITEM */}
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl group hover:border-slate-300 transition-all duration-300">
              {/* Colored Top Accent Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
                style={{ background: feat.color }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Side: Number, Badge, Content & Bullets */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Top Bar: Number Badge + Tag */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-2xs"
                      style={{
                        background: `${feat.color}15`,
                        color: feat.color,
                        border: `1px solid ${feat.color}30`,
                      }}
                    >
                      {feat.num}
                    </div>

                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border"
                      style={{
                        background: `${feat.color}10`,
                        color: feat.color,
                        borderColor: `${feat.color}30`,
                      }}
                    >
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Headline */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-base sm:text-lg font-semibold text-blue-600 mb-1">
                      {feat.headline}
                    </p>
                    <p className="text-sm text-slate-500 font-normal leading-relaxed">
                      {feat.sub}
                    </p>
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {feat.bullets.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${feat.color}15`, color: feat.color }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Embedded Visual Mockup (Inside the Card) */}
                <div className="lg:col-span-6 w-full min-h-[260px] bg-[#0F172A] rounded-2xl border border-slate-800 p-4 sm:p-5 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="w-full">
                    {MOCKUP_MAP[feat.mockup]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
