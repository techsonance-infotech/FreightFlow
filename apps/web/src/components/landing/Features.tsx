'use client';

import { useEffect, useRef, useState } from 'react';

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
    badge: '⚡ 30s LR Creation',
    color: '#F59E0B',
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
    color: '#0EA5A0',
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
    color: '#0EA5A0',
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
    color: '#0EA5A0',
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
    color: '#2E4E7C',
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
    color: '#F59E0B',
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
    color: '#0EA5A0',
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
    color: '#F59E0B',
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
    color: '#0EA5A0',
    mockup: 'portal',
  },
];

function LRMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 font-sans text-xs">
      <div className="flex items-center justify-between mb-5 border-b border-ff-navy-700/30 pb-4">
        <div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Lorry Receipt</div>
          <div className="text-ff-amber-500 font-black text-base">#LR/2026-27/1005</div>
        </div>
        <span className="px-3 py-1 rounded-md bg-ff-amber-500/10 text-ff-amber-500 text-[10px] font-black tracking-wider border border-ff-amber-500/20">IN TRANSIT</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px] uppercase">Origin</div>
          <div className="text-white font-bold text-sm mt-0.5">Surat Depot</div>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px] uppercase">Destination</div>
          <div className="text-white font-bold text-sm mt-0.5">Mumbai Hub</div>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px] uppercase">Boxes</div>
          <div className="text-white font-black text-sm mt-0.5">125 Pcs</div>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px] uppercase">Weight</div>
          <div className="text-white font-black text-sm mt-0.5">875 KG</div>
        </div>
      </div>
      <div className="border-t border-ff-navy-700/30 pt-4 flex justify-between items-center mb-4">
        <div>
          <div className="text-white/40 text-[10px]">Net Freight</div>
          <div className="text-ff-amber-500 font-black text-lg">₹13,125</div>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-[10px]">GST Billing</div>
          <div className="text-ff-teal-500 font-bold text-xs mt-0.5">WITH GST (18%)</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-3 bg-ff-navy-700 hover:bg-ff-navy-500 text-white rounded-lg text-xs font-bold transition-colors">🖨 Print 3-Copy LR</button>
        <button className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors">📥 PDF</button>
      </div>
    </div>
  );
}

function TripMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <span className="text-white font-bold text-sm">Trip Performance Monitor</span>
        <span className="text-ff-teal-500 text-[10px] font-bold uppercase tracking-wider">GJ 05 AX 1234</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px]">Driver Advance</div>
          <div className="text-white font-bold text-sm mt-0.5">₹5,000</div>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[10px]">Fuel Slips Logged</div>
          <div className="text-white font-bold text-sm mt-0.5">₹8,500</div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="p-3 bg-ff-teal-500/10 rounded-lg border border-ff-teal-500/20 flex justify-between items-center">
          <span className="text-ff-teal-500 font-semibold">Net Profit Margin</span>
          <span className="text-ff-teal-500 font-black text-sm">₹4,200 (31%)</span>
        </div>
      </div>
    </div>
  );
}

function AccountingMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <span className="text-white font-bold text-sm">General Ledger Accounts</span>
        <span className="text-white/40 text-[10px] uppercase">Double-Entry</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Outstanding AR (Receivables)</div>
            <div className="text-white/50 text-[10px] mt-0.5">Accounts Receivable</div>
          </div>
          <span className="text-ff-amber-500 font-black text-sm">₹3.4 Lakhs</span>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Bank Statement Sync</div>
            <div className="text-white/50 text-[10px] mt-0.5">State Bank of India</div>
          </div>
          <span className="text-ff-teal-500 font-bold">Matched (98%)</span>
        </div>
      </div>
    </div>
  );
}

function GstMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <div className="text-white font-bold text-sm">GST Compliance Center</div>
        <span className="text-ff-teal-500 text-[10px] font-bold uppercase tracking-wider">NIC Connected</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <span className="text-white/60">e-Way Bill #4112345678</span>
          <span className="text-ff-teal-500 font-bold">VALID (Active)</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <span className="text-white/60">GTA Tax RCM</span>
          <span className="text-ff-teal-500 font-bold">Auto-Calculated (5%)</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <span className="text-white/60">e-Invoice IRN Status</span>
          <span className="text-ff-teal-500 font-bold">Generated ✅</span>
        </div>
      </div>
    </div>
  );
}

function HrMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <div className="text-white font-bold text-sm">Driver Payroll Master</div>
        <span className="text-ff-teal-500 text-[10px] font-bold uppercase tracking-wider">PF/ESI Compliant</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Ramesh Kumar (Driver GJ05)</div>
            <div className="text-white/40 text-[10px]">Net Wages + Allowances</div>
          </div>
          <span className="text-white font-bold">₹22,450</span>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Provident Fund (PF)</div>
            <div className="text-white/40 text-[10px]">Employer Share Auto-post</div>
          </div>
          <span className="text-white/60">₹1,800</span>
        </div>
      </div>
    </div>
  );
}

function FleetMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <div className="text-white font-bold text-sm">Fleet Compliance Expiries</div>
        <span className="text-ff-amber-500 text-[10px] font-bold uppercase tracking-wider">PUC / Fitness</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-white rounded-lg flex items-center gap-3">
          <span className="text-lg">🚨</span>
          <div>
            <div className="font-bold text-xs">Fitness Certificate (GJ 05 AX 1234)</div>
            <div className="text-red-400 text-[10px] mt-0.5">Expires in 3 days</div>
          </div>
        </div>
        <div className="p-3 bg-ff-amber-500/10 border border-ff-amber-500/20 text-white rounded-lg flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-bold text-xs">National Permit Renewal</div>
            <div className="text-ff-amber-500 text-[10px] mt-0.5">Expires in 8 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <div className="text-white font-bold text-sm">AI Engine Scanning</div>
        <span className="text-ff-teal-500 text-[10px] font-bold uppercase tracking-wider">99.4% OCR Confidence</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25">
          <div className="text-white/40 text-[9px]">Uploaded Invoice File</div>
          <div className="text-white font-bold mt-1">Invoice-Surat-1002.pdf</div>
          <div className="text-ff-teal-500 text-[10px] mt-1">Parsed: Date, GSTIN, and Total Amount correctly</div>
        </div>
        <div className="p-3 bg-ff-teal-500/10 rounded-lg border border-ff-teal-500/20 flex justify-between items-center">
          <span className="text-ff-teal-500 font-semibold">Anomalies Detected</span>
          <span className="text-ff-teal-500 font-black">0 Errors</span>
        </div>
      </div>
    </div>
  );
}

function DriverAppMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs max-w-[280px] mx-auto">
      <div className="bg-[#0F1B2E] rounded-xl border border-ff-navy-700/50 overflow-hidden shadow-2xl">
        <div className="bg-[#1C3252] p-4 text-center text-white font-bold text-sm flex items-center justify-between">
          <span>Driver App</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-ff-navy-900/50 p-3 rounded-lg border border-ff-navy-700/25">
            <div className="text-white/40 text-[9px] uppercase">Active Trip</div>
            <div className="text-white font-bold mt-0.5">Surat Depot → Mumbai Hub</div>
            <div className="text-ff-amber-500 text-[10px] mt-1">GJ 05 AX 1234</div>
          </div>
          <button className="w-full py-3 bg-ff-amber-500 hover:bg-ff-amber-600 text-ff-navy-950 font-bold rounded-lg text-center transition-colors">
            📸 Upload POD Photo
          </button>
          <button className="w-full py-2.5 bg-ff-navy-700 hover:bg-ff-navy-500 text-white font-semibold rounded-lg text-center transition-colors">
            Request Advance (Cash)
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerPortalMockup() {
  return (
    <div className="bg-[#0B1220] rounded-2xl border border-ff-navy-700/50 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-ff-navy-700/30 pb-4">
        <div className="text-white font-bold text-sm">Customer Self-Serve</div>
        <span className="text-[#FFB300] text-[10px] font-bold uppercase tracking-wider">Razorpay Integrated</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Active Shipment Tracking</div>
            <div className="text-white/40 text-[10px] mt-0.5">GJ05AX1234 · 12 km to destination</div>
          </div>
          <span className="text-ff-teal-500 font-bold">On Time</span>
        </div>
        <div className="p-3 bg-ff-navy-900/50 rounded-lg border border-ff-navy-700/25 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Outstanding Dues</div>
            <div className="text-white/40 text-[10px] mt-0.5">1 invoice pending</div>
          </div>
          <button className="px-3 py-1.5 bg-ff-amber-500 hover:bg-ff-amber-600 text-ff-navy-950 font-bold rounded-md transition-colors">
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
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  // Animate mockup swap
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('@/lib/gsap');
      if (mockupRef.current) {
        gsap.fromTo(mockupRef.current,
          { opacity: 0, scale: 0.95, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }
    };
    loadGSAP();
  }, [activeFeature]);

  return (
    <section
      ref={containerRef}
      id="features"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0B1220' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ff-navy-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
          ENTERPRISE-GRADE CAPABILITIES
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
          Everything your transport
          <br /><span className="text-ff-amber-500">business needs to grow.</span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          No more complex spreadsheets. Manage bookings, dispatch, accounting, and client reporting under a single unified dashboard.
        </p>
      </div>

      {/* Feature grid */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Left: Feature list */}
          <div className="lg:w-1/2 space-y-4">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.id}
                onClick={() => setActiveFeature(i)}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-400 will-change-transform ${
                  activeFeature === i
                    ? 'border-ff-navy-500/50 bg-gradient-to-r from-ff-navy-900 to-ff-navy-950 shadow-2xl shadow-ff-navy-500/10'
                    : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-5">
                  {/* Number */}
                  <span
                    className="text-4xl font-black leading-none shrink-0 transition-colors duration-300"
                    style={{ color: activeFeature === i ? feat.color : 'rgba(255,255,255,0.1)' }}
                  >
                    {feat.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span className="text-white font-bold text-lg">{feat.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${feat.color}20`, color: feat.color }}>
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm font-semibold mb-2">{feat.headline}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{feat.sub}</p>

                    {/* Bullets — shown when active */}
                    {activeFeature === i && (
                      <div className="mt-5 pt-4 border-t border-ff-navy-700/30 space-y-2.5">
                        {feat.bullets.map((b, bi) => (
                          <div key={bi} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: feat.color }} />
                            <span className="text-white/80 text-xs font-medium">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Sticky mockup preview */}
          <div className="lg:w-1/2 lg:sticky lg:top-24 w-full">
            <div ref={mockupRef} key={activeFeature} className="will-change-transform">
              {/* Feature label */}
              <div className="mb-5 flex items-center gap-3 bg-ff-navy-950/80 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: FEATURES[activeFeature].color }} />
                <div>
                  <div className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Active Module</div>
                  <div className="text-white font-bold text-xs">{FEATURES[activeFeature].title} Preview</div>
                </div>
              </div>

              {/* Mockup wrapper */}
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-15 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${FEATURES[activeFeature].color}, transparent 70%)` }} />
                <div className="relative">
                  {MOCKUP_MAP[FEATURES[activeFeature].mockup]}
                </div>
              </div>

              {/* Quick Dots indicators */}
              <div className="flex gap-2.5 mt-8 justify-center">
                {FEATURES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: activeFeature === i ? 24 : 8,
                      height: 8,
                      background: activeFeature === i ? FEATURES[i].color : 'rgba(255,255,255,0.15)',
                    }}
                    aria-label={`Show feature ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
