'use client';

import { useEffect, useRef } from 'react';

const CHALLENGES = [
  {
    id: 'paperwork',
    title: 'Manual Paperwork',
    challenge: 'Lorry Receipts and invoices typed on Excel or written by hand in printed books. High risk of human error, misplaced records, and hours wasted daily.',
    solution: 'Digitized LRs, auto-populated locations, and tax computations in under 30 seconds with immediate PDF sharing via WhatsApp.',
    cIcon: '📝',
    sIcon: '⚡',
  },
  {
    id: 'leakage',
    title: 'Financial Leakage',
    challenge: 'Untracked driver advances, unbilled hamali (loading) fees, and unrecorded toll expenses. Margins slip through the cracks on every single corridor.',
    solution: 'Granular expense ledger tracking advances, fuel slips, tolls, and helper wages. Automatic per-trip profitability metrics computed live.',
    cIcon: '💸',
    sIcon: '💰',
  },
  {
    id: 'compliance',
    title: 'Complex GST Rules',
    challenge: 'Manual CGST/SGST/IGST calculations, complex GTA RCM rules, and constant logging into government portals for e-Way bills and e-Invoices.',
    solution: 'One-click e-Way Bill check, automated GST/RCM calculator, and e-Invoice IRN registration directly inside the booking window.',
    cIcon: '🧾',
    sIcon: '🧮',
  },
  {
    id: 'expiry',
    title: 'Document Expiries',
    challenge: 'Missing Fitness Certificate, PUC, or Insurance deadlines resulting in heavy traffic fines, grounded trucks, and delayed deliveries.',
    solution: 'Automated expiry calendars and push notifications warning transport managers 7, 15, and 30 days before documents expire.',
    cIcon: '⚠️',
    sIcon: '🔔',
  },
  {
    id: 'profitability',
    title: 'Blind Profitability',
    challenge: 'Waiting until the end of the month or quarter to know if a route was profitable, relying on disconnected Tally accounts.',
    solution: 'Live corridor-wise profit analysis, revenue trends, and immediate customer ledger statements available at a single glance.',
    cIcon: '📉',
    sIcon: '📈',
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
      id="pain"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0B1220' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
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
            Hover or tap each challenge to see how FreightFlow transforms manual operational pain into digital efficiency.
          </p>
        </div>

        {/* 5 Cards Grid/Scroll */}
        <div 
          ref={cardsContainerRef}
          className="flex overflow-x-auto pb-8 lg:pb-0 lg:overflow-x-visible lg:grid lg:grid-cols-5 gap-6 scrollbar-thin scrollbar-thumb-ff-navy-700 snap-x"
        >
          {CHALLENGES.map((item) => (
            <div
              key={item.id}
              className="group relative flex-shrink-0 w-[290px] lg:w-auto h-[480px] rounded-2xl border bg-ff-navy-900/30 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-ff-teal-500/10 snap-center border-red-500/15"
            >
              {/* Inner card container that shows challenge/solution */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between transition-all duration-500 group-hover:opacity-0 group-hover:pointer-events-none">
                {/* Challenge State */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-red-400 tracking-wider uppercase bg-red-500/10 px-2.5 py-1 rounded">Challenge</span>
                    <span className="text-3xl filter saturate-50">{item.cIcon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-white/50">{item.challenge}</p>
                </div>
                <div className="pt-4 border-t border-red-500/10 text-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-ff-teal-500 transition-colors">
                    Hover to Morph →
                  </span>
                </div>
              </div>

              {/* Solution State (shown on hover) */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-500 bg-gradient-to-b from-ff-navy-950 to-ff-navy-900 border-ff-teal-500/40">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-ff-teal-500 tracking-wider uppercase bg-ff-teal-500/10 px-2.5 py-1 rounded">Solution</span>
                    <span className="text-3xl">{item.sIcon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-ff-teal-500">{item.solution}</p>
                </div>
                <div className="pt-4 border-t border-ff-teal-500/20 text-center">
                  <span className="text-[10px] font-bold text-ff-teal-500 uppercase tracking-widest">
                    ✓ Resolved with FreightFlow
                  </span>
                </div>
              </div>

              {/* Decorative top border color line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/30 group-hover:bg-ff-teal-500 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
