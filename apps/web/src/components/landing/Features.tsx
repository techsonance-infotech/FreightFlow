'use client';

import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    id: 'lr',
    num: '01',
    title: 'Lorry Receipts',
    headline: 'Create an LR in 30 seconds.',
    sub: 'Auto-numbered, route-mapped, dynamic inventory payloads. Print-ready templates for consignee, driver, and HSN copies.',
    bullets: [
      'Auto-generated sequential LR# (e.g. #LR/2026-27/1005)',
      'Smart route-mapping: Surat → Mumbai auto-populated with distance',
      'Inventory attributes: Box quantity, Weight, DCFI#, and Material Type',
      'One-click download of PDF & print copies',
    ],
    badge: '⚡ 30s LR Creation',
    color: '#2563EB',
    mockup: 'lr',
  },
  {
    id: 'billing',
    num: '02',
    title: 'Smart Billing',
    headline: 'GST or Non-GST. One toggle.',
    sub: 'Base freight + Hamali auto-calculation. Grand Settlement live updates. Margin estimation ensures profit tracking.',
    bullets: [
      'Flexible Rate basis: Per KG, Per Box, or Fixed Rate contract',
      'Single toggle for with / without GST (CGST/SGST/IGST automatically calculated)',
      'Add accessory charges like Hamali, Tolls, and Loading fees',
      'Live Profit Margin estimation on every booking',
    ],
    badge: '100% GST Compliant',
    color: '#1E88E5',
    mockup: 'billing',
  },
  {
    id: 'pallets',
    num: '03',
    title: 'Pallet Tracking',
    headline: 'Every batch. Every box. Accounted for.',
    sub: 'Batch-wise load tracking. Partner-wise pallet distribution. Automated reconciliation eliminates inventory leakage.',
    bullets: [
      'Create LR-linked pallet batches (e.g. PL/2026-27/5001)',
      'Monitor pallet returns and outstanding stock per partner',
      'Automatic warnings for aging pallets at client depots',
      'Consolidated pallet statements printable in one click',
    ],
    badge: 'Pallet Tracking Hub',
    color: '#42A5F5',
    mockup: 'pallets',
  },
  {
    id: 'fleet',
    num: '04',
    title: 'Fleet & Trip Management',
    headline: 'Your fleet. Live.',
    sub: 'Dispatch vehicles. Track active trips, driver advances, fuel slips, and toll expenses in real time.',
    bullets: [
      'Live fleet map showing GPS coordinates & vehicle status',
      'Driver ledger tracking advances, trip allowances, and wages',
      'Fuel yield monitoring (KMPL tracker) & theft detection alerts',
      'Trip Profitability (P&L) calculated automatically upon closing',
    ],
    badge: 'Live Fleet Map',
    color: '#FFB300',
    mockup: 'fleet',
  },
  {
    id: 'compliance',
    num: '05',
    title: 'GST & Compliance',
    headline: 'Never miss a deadline.',
    sub: 'Filing calendars, automatic RCM alerts, and E-Way Bill integration keep your transport business fully audit-ready.',
    bullets: [
      'Reverse Charge Mechanism (RCM) calculator for GTA taxes',
      'E-Way Bill integration (validate NIC numbers directly)',
      'Compliance timeline for PUC, Fitness, and Insurance expiry',
      'Downloadable audit logs showing every ledger mutation',
    ],
    badge: 'Auto-Compliance',
    color: '#43A047',
    mockup: 'compliance',
  },
  {
    id: 'reports',
    num: '06',
    title: 'Reports & BI',
    headline: 'Know where your money moves.',
    sub: 'Interactive revenue charts, route profitability analytics, and exportable MIS sheets for data-driven decisions.',
    bullets: [
      'Dynamic 6-month revenue & collection trends',
      'Corridor analytics: Identify high-yield and low-performing routes',
      'Customer-wise revenue share visualizations',
      'Export financial logs to Excel/CSV in a single click',
    ],
    badge: 'AI-Powered BI',
    color: '#2563EB',
    mockup: 'reports',
  },
];

function LRMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 font-sans text-xs">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Lorry Receipt</div>
          <div className="text-[#FFB300] font-black text-base">#LR/26-27/1005</div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#2563EB]/20 text-[#42A5F5] text-[10px] font-black tracking-wider">IN TRANSIT</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-white/5 rounded-2xl">
          <div className="text-white/40 text-[10px] uppercase">Origin</div>
          <div className="text-white font-bold text-sm mt-0.5">Surat Depot</div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl">
          <div className="text-white/40 text-[10px] uppercase">Destination</div>
          <div className="text-white font-bold text-sm mt-0.5">Mumbai Hub</div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl">
          <div className="text-white/40 text-[10px] uppercase">Boxes</div>
          <div className="text-white font-black text-sm mt-0.5">125 Pcs</div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl">
          <div className="text-white/40 text-[10px] uppercase">Weight</div>
          <div className="text-white font-black text-sm mt-0.5">875 KG</div>
        </div>
      </div>
      <div className="border-t border-white/5 pt-4 flex justify-between items-center mb-4">
        <div>
          <div className="text-white/40 text-[10px]">Net Freight</div>
          <div className="text-[#2563EB] font-black text-lg">₹13,125</div>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-[10px]">GST Billing</div>
          <div className="text-[#43A047] font-bold text-xs mt-0.5">WITH GST (18%)</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#2563EB]/25 hover:bg-[#1E4D8C] transition-colors">🖨 Print 3-Copy LR</button>
        <button className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors">📥 PDF</button>
      </div>
    </div>
  );
}

function BillingMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
        <span className="text-white font-bold text-sm">Smart Calculator</span>
        <span className="text-white/40 text-[10px] uppercase tracking-wider">Live Estimate</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
          <span className="text-white/60">Freight Rate Basis</span>
          <span className="text-white font-bold">₹14 / KG</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
          <span className="text-white/60">Base Freight (875 KG)</span>
          <span className="text-white font-bold">₹12,250</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
          <span className="text-white/60">Hamali / Loading Charges</span>
          <span className="text-white font-bold">₹875</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-[#2563EB]/10 rounded-xl border border-[#2563EB]/20">
          <span className="text-white font-semibold">Subtotal</span>
          <span className="text-[#42A5F5] font-black text-sm">₹13,125</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-[#43A047]/10 rounded-xl border border-[#43A047]/20">
          <span className="text-[#43A047] font-bold">GST 18% (RCM Auto-applied)</span>
          <span className="text-[#43A047] font-black">₹2,362.50</span>
        </div>
      </div>
    </div>
  );
}

function PalletsMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
        <div className="text-white font-bold text-sm">Active Pallet Inventories</div>
        <span className="text-[#FFB300] text-[10px] font-bold uppercase tracking-wider">9 Batches Live</span>
      </div>
      <div className="space-y-3">
        {[
          { id: 'PL/26-27/5001', client: 'Shree Shivay Roadlines', count: 48, status: 'In Transit', color: '#2563EB' },
          { id: 'PL/26-27/5002', client: 'Aarambh FX Events', count: 32, status: 'At Depot', color: '#FFB300' },
          { id: 'PL/26-27/5003', client: 'Kiran Logistics', count: 15, status: 'Returned', color: '#43A047' },
        ].map((item) => (
          <div key={item.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[#42A5F5] font-bold text-xs">{item.id}</div>
              <div className="text-white/50 text-[10px] mt-0.5">{item.client}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-sm">{item.count} Pallets</div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: item.color }}>{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FleetMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
        <div className="text-white font-bold text-sm">Fleet Status Overview</div>
        <span className="text-[#43A047] text-[10px] font-bold uppercase tracking-wider">GPS Connected</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl text-center">
          <div className="text-[#42A5F5] font-black text-lg">12</div>
          <div className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Active</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-white font-black text-lg">8</div>
          <div className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Idle</div>
        </div>
        <div className="p-3 bg-[#43A047]/10 border border-[#43A047]/20 rounded-xl text-center">
          <div className="text-[#43A047] font-black text-lg">20</div>
          <div className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Total</div>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { vehicle: 'MH 43 AX 9912', route: 'Surat Depot → Mumbai Hub', driver: 'Ramesh K.', stat: 'ON TRIP' },
          { vehicle: 'GJ 05 YY 7731', route: 'Ahmedabad → Pune Corridor', driver: 'Vikram S.', stat: 'ON TRIP' },
        ].map((v) => (
          <div key={v.vehicle} className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-white font-bold">{v.vehicle}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{v.route}</div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black px-2 py-0.5 bg-[#2563EB]/25 text-[#42A5F5] rounded-full">{v.stat}</span>
              <div className="text-white/50 text-[10px] mt-1">{v.driver}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
        <div className="text-white font-bold text-sm">Regulatory & Compliance</div>
        <span className="text-[#FFB300] text-[10px] font-bold uppercase tracking-wider">Alerts Live</span>
      </div>
      <div className="space-y-3">
        {[
          { label: 'GSTR-1 Filing Window', desc: 'Deadline June 11', type: 'error', icon: '🚨' },
          { label: 'E-Way Bill #4112345678', desc: 'Expires in 4 hours', type: 'warning', icon: '⚠️' },
          { label: 'Fitness Certificate (MH43AX9912)', desc: 'Expires June 28', type: 'info', icon: '📋' },
        ].map((c) => (
          <div key={c.label} className={`p-3 rounded-xl border flex items-center gap-3 ${
            c.type === 'error' ? 'bg-[#E53935]/10 border-[#E53935]/25 text-white' :
            c.type === 'warning' ? 'bg-[#FFB300]/10 border-[#FFB300]/25 text-white' :
            'bg-white/5 border-white/5 text-white'
          }`}>
            <span className="text-lg">{c.icon}</span>
            <div>
              <div className="font-bold text-xs">{c.label}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsMockup() {
  return (
    <div className="bg-[#0A1628] rounded-3xl border border-white/10 p-6 text-xs">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
        <div className="text-white font-bold text-sm">Revenue Corridor Yield</div>
        <span className="text-[#43A047] text-[10px] font-bold uppercase tracking-wider">+27.4% MoM</span>
      </div>
      <div className="flex items-end gap-2.5 h-24 mb-4">
        {[30, 48, 40, 72, 60, 92].map((val, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="w-full rounded-t-md transition-all duration-500" style={{
              height: `${val}%`,
              background: idx === 5 ? 'linear-gradient(to top, #2563EB, #42A5F5)' : 'rgba(37,99,235,0.2)',
              boxShadow: idx === 5 ? '0 0 12px rgba(37,99,235,0.4)' : 'none',
            }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-white/40 mb-4 px-1">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
        <div>
          <div className="text-white/40 text-[10px]">Top Route (Surat-Mumbai)</div>
          <div className="text-white font-black text-sm mt-0.5">₹2,64,500</div>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-[10px]">Net Margin Yield</div>
          <div className="text-[#43A047] font-bold text-sm mt-0.5">29.2%</div>
        </div>
      </div>
    </div>
  );
}

const MOCKUP_MAP: Record<string, React.ReactNode> = {
  lr: <LRMockup />,
  billing: <BillingMockup />,
  pallets: <PalletsMockup />,
  fleet: <FleetMockup />,
  compliance: <ComplianceMockup />,
  reports: <ReportsMockup />,
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
      style={{ background: '#0A1628' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em]" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#42A5F5' }}>
          ENTERPRISE-GRADE CAPABILITIES
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
          Everything your transport
          <br /><span style={{ color: '#FFB300' }}>business needs to grow.</span>
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
                className={`group cursor-pointer p-6 rounded-3xl border transition-all duration-400 will-change-transform ${
                  activeFeature === i
                    ? 'border-[#2563EB]/50 bg-gradient-to-r from-[#1A3A6B] to-[#0A1628] shadow-2xl shadow-[#2563EB]/15'
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
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-white font-bold text-lg">{feat.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${feat.color}20`, color: feat.color }}>
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm font-semibold mb-2">{feat.headline}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{feat.sub}</p>

                    {/* Bullets — shown when active */}
                    {activeFeature === i && (
                      <div className="mt-5 pt-4 border-t border-white/5 space-y-2.5">
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
              <div className="mb-5 flex items-center gap-3 bg-[#0A1628]/80 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
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
