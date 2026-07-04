'use client';

import { useEffect, useRef } from 'react';
import { ClipboardList, Receipt, Truck, Box, Calculator, CheckCircle2 } from 'lucide-react';

const FLOW_NODES = [
  {
    id: 'booking',
    step: '01',
    icon: ClipboardList,
    title: 'Dealer Books Shipment',
    desc: 'Consignee & dealer details captured digitally. Party reference, GST bill ref, E-Way Bill auto-linked.',
    tag: 'Step 1',
    tagColor: '#2563EB',
    detail: ['Party: Shree Shivay Roadlines', 'E-Way Bill: 411234567890', 'Issue Date: 10 Jun 2026'],
  },
  {
    id: 'lr-create',
    step: '02',
    icon: Receipt,
    title: 'LR Created in 30 Seconds',
    desc: 'Auto-generated LR# (LR/2026-27/1005). Rate calc, GST toggle, submission checklist — all done.',
    tag: 'Instant',
    tagColor: '#1E88E5',
    detail: ['LR#: LR/2026-27/1005', 'Route: SURAT → MUMBAI', 'Freight: ₹13,125 WITH GST'],
  },
  {
    id: 'vehicle',
    step: '03',
    icon: Truck,
    title: 'Vehicle Assigned + Route Mapped',
    desc: 'Fleet allocation from registry. Driver assigned. Live route dispatched to fleet map.',
    tag: 'Real-time',
    tagColor: '#42A5F5',
    detail: ['Vehicle: GJ 05 AX 1234', 'Driver: Ramesh K.', 'Route: 312 km · Est. 6h'],
  },
  {
    id: 'pallet',
    step: '04',
    icon: Box,
    title: 'Pallet Load Tracked',
    desc: 'Inventory payload: Boxes, Weight (KG), DCFI#. Batch PL/2026-27 reconciled per partner.',
    tag: '9 Batches',
    tagColor: '#FFB300',
    detail: ['Boxes: 125 pcs · 875 KG', 'Partner: Aarambh FX Events', 'Batch: PL/2026-27/5001'],
  },
  {
    id: 'gst',
    step: '05',
    icon: Calculator,
    title: 'GST Invoice Auto-Generated',
    desc: 'CGST/SGST/IGST calculated automatically. RCM applied. One toggle: WITH / WITHOUT GST.',
    tag: 'Compliant',
    tagColor: '#43A047',
    detail: ['GST: 18% IGST = ₹2,362', 'SAC Code: 9965', 'GSTR-1 Ready'],
  },
  {
    id: 'pod',
    step: '06',
    icon: CheckCircle2,
    title: 'POD Delivered — Payment Settled',
    desc: 'Collections, receivables & driver advance settled. Financial Pulse updated. Zero leakage.',
    tag: '₹0 Leakage',
    tagColor: '#FFB300',
    detail: ['Collected: ₹13,125', 'AR Cleared: 0 pending', 'Net Margin: ₹3,812 (29%)'],
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');

      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        gsap.fromTo(node,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 82%', toggleActions: 'play none none none' },
            delay: 0.05 * i,
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    init();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F2B5B 50%, #0A1628 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10" style={{ background: '#2563EB' }} />
        <svg className="absolute inset-0 w-full h-full opacity-5" style={{ strokeWidth: 0.5 }}>
          <defs>
            <pattern id="howitworks-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#42A5F5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#howitworks-grid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em]" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#42A5F5' }}>
            HOW IT WORKS
          </div>
          <h2 className="font-black text-white mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-2px' }}>
            From booking to settlement.
            <br /><span style={{ color: '#FFB300' }}>Automated.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            6 steps. One platform. Your entire freight lifecycle — digitized, tracked, and settled with zero leakage.
          </p>
        </div>

        {/* Step number display */}
        <div className="hidden lg:flex items-center justify-center gap-0 mb-16">
          {FLOW_NODES.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 font-black text-sm" style={{ borderColor: node.tagColor, color: node.tagColor, background: `${node.tagColor}15` }}>
                  {node.step}
                </div>
                <div className="text-[10px] mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{node.title.split(' ').slice(0, 2).join(' ')}</div>
              </div>
              {i < FLOW_NODES.length - 1 && (
                <div className="w-12 h-0.5 mx-1 mb-4" style={{ background: `linear-gradient(90deg, ${node.tagColor}60, ${FLOW_NODES[i+1].tagColor}60)` }} />
              )}
            </div>
          ))}
        </div>

        {/* Flow cards — alternating layout */}
        <div className="space-y-8">
          {FLOW_NODES.map((node, i) => {
            const isLeft = i % 2 === 0;
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                ref={el => { nodeRefs.current[i] = el; }}
                className="relative"
                style={{ opacity: 0 }}
              >
                <div className={`flex flex-col lg:flex-row ${isLeft ? '' : 'lg:flex-row-reverse'} gap-6 items-stretch`}>

                  {/* Main card */}
                  <div className="lg:flex-1 rounded-3xl p-7 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 will-change-transform"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>

                    {/* Step number watermark */}
                    <div className="absolute top-4 right-6 font-black text-7xl" style={{ color: 'rgba(255,255,255,0.03)', userSelect: 'none' }}>{node.step}</div>

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${node.tagColor}15`, border: `1px solid ${node.tagColor}30` }}>
                          <Icon className="w-6 h-6" style={{ color: node.tagColor }} />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${node.tagColor}20`, color: node.tagColor }}>{node.tag}</span>
                          <h3 className="text-white font-bold text-xl mt-1.5">{node.title}</h3>
                        </div>
                      </div>
                      <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{node.desc}</p>
                    </div>

                    {/* Bottom glow on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${node.tagColor}, transparent)` }} />
                  </div>

                  {/* Detail card */}
                  <div className="lg:w-72 rounded-3xl p-5"
                    style={{ background: `${node.tagColor}08`, border: `1px solid ${node.tagColor}20` }}>
                    <div className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: node.tagColor }}>Live Data Preview</div>
                    <div className="space-y-3">
                      {node.detail.map((d, di) => (
                        <div key={di} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: node.tagColor }} />
                          <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
