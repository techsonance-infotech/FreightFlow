'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const SECURITY_ITEMS = [
  { title: 'PostgreSQL Row-Level Security (RLS)', desc: 'Guarantees complete database schema separation between independent tenant accounts.' },
  { title: 'AES-256 Encryption at Rest', desc: 'All client information, driver records, and transaction logs are fully encrypted.' },
  { title: 'TLS 1.3 Transmission Security', desc: 'Secure communication pathways encrypt data travelling between the server and user apps.' },
  { title: 'Granular Role-Based Access (RBAC)', desc: 'Gated interface access ensuring staff can only view relevant, authorized data modules.' },
];

const COMPLIANCE_ITEMS = [
  { title: 'MoRTH Transport Guidelines', desc: 'Fully aligned with Carriage by Road Act guidelines issued by the Ministry of Road Transport.' },
  { title: 'GST & GTA Reverse Charge (RCM)', desc: 'Automatic CGST/SGST/IGST computation with GTA RCM calculations integrated directly.' },
  { title: 'E-Way Bill & e-Invoice Portals', desc: 'Built-in validation checks matching state transport registries and official NIC systems.' },
  { title: 'Immutable Financial Audit Trails', desc: 'Complete mutation histories log every invoice edit, payment transaction, and LR adjustment.' },
];

export default function SecuritySection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');

      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: contentRef.current, start: 'top 80%' } }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      id="security-section"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0B1220' }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ff-teal-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            SECURITY & COMPLIANCE
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
            Enterprise security.
            <br /><span className="text-ff-amber-500">Indian compliance-native.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            FreightFlow combines financial-grade security architectures with deep compliance modules built specifically for Indian transport operations.
          </p>
        </div>

        {/* Two Column Layout */}
        <div ref={contentRef} style={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-16">
          {/* Security Column */}
          <div className="p-8 rounded-2xl border border-ff-navy-700/50 bg-ff-navy-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🛡️</span>
                <h3 className="text-xl font-bold text-white">Data Security & Isolation</h3>
              </div>
              <div className="space-y-6">
                {SECURITY_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-ff-teal-500 font-bold text-sm shrink-0">✓</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Column */}
          <div className="p-8 rounded-2xl border border-ff-navy-700/50 bg-ff-navy-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📋</span>
                <h3 className="text-xl font-bold text-white">Regulatory Tax Compliance</h3>
              </div>
              <div className="space-y-6">
                {COMPLIANCE_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-ff-amber-500 font-bold text-sm shrink-0">✓</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Page Link */}
        <div className="text-center">
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ff-teal-500 hover:text-ff-teal-600 transition-colors group"
          >
            Read Our Enterprise Security Architecture Document
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
