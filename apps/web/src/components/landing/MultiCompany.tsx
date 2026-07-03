'use client';

import { useEffect, useRef, useState } from 'react';

const COMPANIES = [
  {
    name: 'TechSonance InfoTech LLP',
    role: 'Tenant Owner',
    lrs: 47,
    revenue: '₹2,64,500',
    vehicles: 12,
    status: 'Active',
    avatar: 'T',
    color: '#2563EB',
    dbSchema: 'tenant_techsonance_public',
    gstin: '24AAAAA1111A1Z1',
  },
  {
    name: 'Shree Shivay Roadlines',
    role: 'Branch Manager',
    lrs: 89,
    revenue: '₹5,12,000',
    vehicles: 28,
    status: 'Active',
    avatar: 'S',
    color: '#43A047',
    dbSchema: 'tenant_shree_shivay_public',
    gstin: '24BBBBB2222B2Z2',
  },
  {
    name: 'Aarambh FX Events',
    role: 'Freight Partner',
    lrs: 23,
    revenue: '₹98,500',
    vehicles: 6,
    status: 'Active',
    avatar: 'A',
    color: '#FFB300',
    dbSchema: 'tenant_aarambh_fx_public',
    gstin: '24CCCCC3333C3Z3',
  },
];

export default function MultiCompany() {
  const [activeCompany, setActiveCompany] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap, ScrollTrigger } = await import('@/lib/gsap');
      if (headRef.current) {
        gsap.fromTo(headRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: headRef.current, start: 'top 80%' }
          }
        );
      }
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: cardRef.current, start: 'top 80%' }
          }
        );
      }
      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    loadGSAP();
  }, []);

  const company = COMPANIES[activeCompany];

  const handleSwitch = (idx: number) => {
    setIsOpen(false);
    setActiveCompany(idx);
  };

  return (
    <section
      ref={sectionRef}
      id="multi-company"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #081120 100%)' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(37,99,235,0.05) 0%, transparent 60%)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em]" style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.3)', color: '#FFB300' }}>
            ORGANIZATIONAL STRUCTURE
          </div>
          <h2
            ref={headRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
            style={{ letterSpacing: '-2px', opacity: 0 }}
          >
            One login.{' '}
            <span className="text-[#FFB300]">All your companies.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Manage multiple logistics branches, partner firms, or independent transport companies from a single credentials login.
          </p>
        </div>

        {/* Company switcher mockup */}
        <div
          ref={cardRef}
          className="relative max-w-2xl mx-auto"
          style={{ opacity: 0 }}
        >
          {/* Glow */}
          <div className="absolute -inset-8 bg-[#2563EB]/10 rounded-3xl blur-3xl pointer-events-none" />

          <div className="relative bg-[#0A1628] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#091120]">
              <div className="w-3 h-3 rounded-full bg-[#E53935]" />
              <div className="w-3 h-3 rounded-full bg-[#FFB300]" />
              <div className="w-3 h-3 rounded-full bg-[#43A047]" />
              <div className="flex-1 mx-4 bg-white/5 rounded-md h-6 text-white/30 text-[10px] flex items-center px-3 font-mono">
                https://app.freightflow.com/org/switcher
              </div>
            </div>

            {/* App header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A1628]/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E4D8C] flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-sm">F</span>
                </div>
                <span className="text-white font-bold text-sm tracking-tight">FreightFlow Dashboard</span>
              </div>

              {/* Company switcher dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 shadow-inner"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md"
                    style={{ background: company.color }}
                  >
                    {company.avatar}
                  </div>
                  <span className="text-white text-xs font-semibold max-w-[140px] truncate">{company.name}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F223C] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 backdrop-blur-md">
                    <div className="px-3 py-2 text-white/40 text-[9px] uppercase font-bold tracking-wider border-b border-white/5 bg-black/20">
                      Switch Company Tenant
                    </div>
                    {COMPANIES.map((c, idx) => (
                      <button
                        key={c.name}
                        onClick={() => handleSwitch(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${activeCompany === idx ? 'bg-[#2563EB]/10 border-l-2 border-[#2563EB]' : ''}`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ background: c.color }}>
                          {c.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-xs truncate">{c.name}</div>
                          <div className="text-white/40 text-[10px] mt-0.5">{c.role}</div>
                        </div>
                        {activeCompany === idx && (
                          <svg className="w-4 h-4 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard data */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 text-center">
                  <div className="text-2xl font-black" style={{ color: company.color }}>{company.lrs}</div>
                  <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mt-1.5">Today&apos;s LRs</div>
                </div>
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 text-center">
                  <div className="text-2xl font-black text-[#FFB300]">{company.revenue}</div>
                  <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mt-1.5">Daily Revenue</div>
                </div>
                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 text-center">
                  <div className="text-2xl font-black text-white">{company.vehicles}</div>
                  <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mt-1.5">Vehicles</div>
                </div>
              </div>

              {/* RLS schema info */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5 font-mono text-[10px]">
                <div className="flex justify-between items-center text-white/50">
                  <span>Isolated database schema</span>
                  <span className="text-white font-bold" style={{ color: company.color }}>{company.dbSchema}</span>
                </div>
                <div className="flex justify-between items-center text-white/50">
                  <span>Registered GSTIN</span>
                  <span className="text-white font-bold">{company.gstin}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#43A047] animate-pulse" />
                  <span className="text-white/40">PostgreSQL Row-Level Security fully active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: '🔒', label: 'Row-Level Security', sub: 'PostgreSQL RLS ensures tenant isolation' },
            { icon: '🏢', label: 'Branch Isolation', sub: 'Independent accounts per location' },
            { icon: '👤', label: 'Granular Permissions', sub: 'Assign Owner, Manager, or Staff roles' },
          ].map((item) => (
            <div key={item.label} className="text-center p-5 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 transition-colors">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-white font-bold text-sm mb-1">{item.label}</div>
              <div className="text-white/40 text-xs leading-relaxed">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
