'use client';

import { useEffect, useRef, useState } from 'react';
import { Lock, Building, BarChart3 } from 'lucide-react';

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
    lrs: 18,
    revenue: '₹95,200',
    vehicles: 5,
    status: 'Active',
    avatar: 'S',
    color: '#FFB300',
    dbSchema: 'tenant_shree_shivay_public',
    gstin: '24BBBBB2222B2Z2',
  },
  {
    name: 'Aarambh FX Events',
    role: 'Partner Entity',
    lrs: 9,
    revenue: '₹47,600',
    vehicles: 3,
    status: 'Suspended',
    avatar: 'A',
    color: '#E53935',
    dbSchema: 'tenant_aarambh_fx_public',
    gstin: '24CCCCC3333C3Z3',
  },
];

export default function MultiCompany() {
  const [activeCompany, setActiveCompany] = useState(COMPANIES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');

      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      if (demoRef.current) {
        gsap.fromTo(demoRef.current,
          { opacity: 0, scale: 0.95, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: demoRef.current, start: 'top 80%' } }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="multi-company"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#070F1E' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            MULTI-TENANT & BRANCH-READY
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
            One dashboard.
            <br /><span className="text-ff-amber-500">Multiple organizations.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Switch between entities instantly. Built on a strict multi-tenant schema with PostgreSQL RLS to isolate your sensitive data.
          </p>
        </div>

        {/* Live Interactive Demo Box */}
        <div 
          ref={demoRef}
          style={{ opacity: 0 }}
          className="bg-ff-navy-900/30 border border-white/5 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto backdrop-blur-xl"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Demo Side Left: Switcher */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold text-ff-teal-500 uppercase tracking-widest block mb-4">Click to Switch Tenants</span>
                <div className="space-y-3">
                  {COMPANIES.map((company) => {
                    const isActive = activeCompany.name === company.name;
                    return (
                      <button
                        key={company.name}
                        onClick={() => setActiveCompany(company)}
                        className="w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group"
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                          borderColor: isActive ? company.color : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0"
                          style={{ background: company.color }}
                        >
                          {company.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white text-xs sm:text-sm font-bold truncate">{company.name}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">{company.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-xs text-white/50 leading-relaxed">
                Clicking a tenant switches the database context via custom PostgreSQL connection attributes, isolating data completely.
              </div>
            </div>

            {/* Demo Side Right: Active Workspace Stats */}
            <div className="lg:col-span-8 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              
              {/* Fake Dashboard Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ background: activeCompany.color, boxShadow: `0 0 8px ${activeCompany.color}` }} 
                  />
                  <span className="text-white text-xs font-bold">{activeCompany.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono font-medium">{activeCompany.dbSchema}</span>
                </div>
              </div>

              {/* Fake Data Preview */}
              <div className="py-8 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Today LRs</div>
                  <div className="text-xl sm:text-2xl font-black text-white">{activeCompany.lrs}</div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Trip Revenue</div>
                  <div className="text-xl sm:text-2xl font-black text-ff-amber-500">{activeCompany.revenue}</div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-white/40 mb-1">Active Vehicles</div>
                  <div className="text-xl sm:text-2xl font-black text-white">{activeCompany.vehicles}</div>
                </div>
              </div>

              {/* RLS Query Demonstration */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-[10px] sm:text-xs text-white/70 overflow-x-auto space-y-2">
                <div className="text-white/40">// Auto-injected RLS constraints at execution:</div>
                <div>
                  <span className="text-ff-teal-400">SET LOCAL</span> app.current_tenant_id = <span className="text-ff-amber-500">&apos;{activeCompany.name.toLowerCase().replace(/ /g, '_')}&apos;</span>;
                </div>
                <div>
                  <span className="text-ff-teal-400">SELECT</span> * <span className="text-ff-teal-400">FROM</span> trips <span className="text-ff-teal-400">WHERE</span> gstin = <span className="text-ff-amber-500">&apos;{activeCompany.gstin}&apos;</span>;
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
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Lock, label: 'True Multi-Tenancy', sub: 'Complete data isolation via PostgreSQL Row-Level Security (RLS) policies.' },
            { icon: Building, label: 'Multi-Company Architecture', sub: 'Run independent sister firms, depots, or partner entities from a single unified login.' },
            { icon: BarChart3, label: 'Consolidated Financial Reporting', sub: 'Automatically aggregate tax, AR/AP, and fuel expenses across all child companies or view them individually.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center p-6 rounded-2xl border border-ff-navy-700/50 bg-ff-navy-900/40 hover:bg-ff-navy-900/60 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-ff-navy-700/30 border border-ff-navy-700/50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-ff-teal-400" />
                </div>
                <div className="text-white font-bold text-sm mb-1">{item.label}</div>
                <div className="text-white/40 text-xs leading-relaxed">{item.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
