'use client';

import { useEffect, useRef } from 'react';
import { FileText, Zap, TrendingDown, IndianRupee, Receipt, Calculator, AlertTriangle, Bell, TrendingUp } from 'lucide-react';

const CHALLENGES = [
  {
    id: 'paperwork',
    title: 'Manual Paperwork',
    challenge: 'Lorry Receipts and invoices typed on Excel or written by hand in printed books. High risk of human error, misplaced records, and hours wasted daily.',
    solution: 'Digitized LRs, auto-populated locations, and tax computations in under 30 seconds with immediate PDF sharing via WhatsApp.',
    cIcon: FileText,
    sIcon: Zap,
    cColor: 'text-red-400',
    sColor: 'text-ff-teal-400',
  },
  {
    id: 'leakage',
    title: 'Financial Leakage',
    challenge: 'Untracked driver advances, unbilled hamali (loading) fees, and unrecorded toll expenses. Margins slip through the cracks on every single corridor.',
    solution: 'Granular expense ledger tracking advances, fuel slips, tolls, and helper wages. Automatic per-trip profitability metrics computed live.',
    cIcon: TrendingDown,
    sIcon: IndianRupee,
    cColor: 'text-red-400',
    sColor: 'text-ff-amber-500',
  },
  {
    id: 'compliance',
    title: 'Complex GST Rules',
    challenge: 'Manual CGST/SGST/IGST calculations, complex GTA RCM rules, and constant logging into government portals for e-Way bills and e-Invoices.',
    solution: 'One-click e-Way Bill check, automated GST/RCM calculator, and e-Invoice IRN registration directly inside the booking window.',
    cIcon: Receipt,
    sIcon: Calculator,
    cColor: 'text-red-400',
    sColor: 'text-ff-teal-400',
  },
  {
    id: 'expiry',
    title: 'Document Expiries',
    challenge: 'Missing Fitness Certificate, PUC, or Insurance deadlines resulting in heavy traffic fines, grounded trucks, and delayed deliveries.',
    solution: 'Automated expiry calendars and push notifications warning transport managers 7, 15, and 30 days before documents expire.',
    cIcon: AlertTriangle,
    sIcon: Bell,
    cColor: 'text-red-400',
    sColor: 'text-ff-teal-400',
  },
  {
    id: 'profitability',
    title: 'Blind Profitability',
    challenge: 'Waiting until the end of the month or quarter to know if a route was profitable, relying on disconnected Tally accounts.',
    solution: 'Live corridor-wise profit analysis, revenue trends, and immediate customer ledger statements available at a single glance.',
    cIcon: TrendingDown,
    sIcon: TrendingUp,
    cColor: 'text-red-400',
    sColor: 'text-ff-amber-500',
  },
];

export default function PainSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');
      
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: cardsContainerRef.current, start: 'top 80%' },
            stagger: 0.1,
          }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pain-points"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0B1220' }}
    >
      {/* Red light leak behind pain section */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(239,68,68,0.03),transparent_70%)] pointer-events-none" style={{
        mixBlendMode: 'screen',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(239,68,68,0.03)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-red-500/20 bg-red-950/20 text-red-400">
            THE REALITY OF INDIAN LOGISTICS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
            Old habits cost profit.
            <br /><span className="text-ff-amber-500">FreightFlow recovers it.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            See how FreightFlow transforms manual operational pain into digital efficiency.
          </p>
        </div>

        {/* 5 Cards Grid/Scroll */}
        <div 
          ref={cardsContainerRef}
          className="flex overflow-x-auto pb-8 lg:pb-0 lg:overflow-x-visible lg:grid lg:grid-cols-5 gap-6 scrollbar-thin scrollbar-thumb-ff-navy-700 snap-x"
        >
          {CHALLENGES.map((item) => {
            const CIcon = item.cIcon;
            const SIcon = item.sIcon;
            return (
              <div
                key={item.id}
                className="group relative flex-shrink-0 w-[290px] lg:w-auto h-[480px] rounded-3xl border bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-ff-teal-500/15 snap-center border-white/10 hover:border-ff-teal-500/30"
              >
                {/* Inner card container that shows challenge (Idle state) */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between transition-all duration-500 group-hover:opacity-0 group-hover:pointer-events-none">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-extrabold text-red-400 tracking-widest uppercase bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-md">
                        Challenge
                      </span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 shadow-inner">
                        <CIcon className={`w-5 h-5 ${item.cColor}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug mb-4">{item.title}</h3>
                    <p className="text-[13px] leading-relaxed text-white/50 font-medium font-sans">{item.challenge}</p>
                  </div>
                </div>

                {/* Solution State (shown on hover) */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-500 bg-gradient-to-b from-[#0F1B2E] to-[#070F1E]">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-extrabold text-ff-teal-400 tracking-widest uppercase bg-ff-teal-500/10 border border-ff-teal-500/25 px-2.5 py-1 rounded-md">
                        Solution
                      </span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-ff-teal-500/10 border border-ff-teal-500/20 shadow-inner">
                        <SIcon className={`w-5 h-5 ${item.sColor}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug mb-4">{item.title}</h3>
                    <p className="text-[13px] leading-relaxed text-white/85 font-medium font-sans">{item.solution}</p>
                  </div>
                  <div className="pt-5 border-t border-white/5 text-center">
                    <span className="text-[10px] font-extrabold text-ff-teal-400 uppercase tracking-widest">
                      Zero Friction Achieved
                    </span>
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
