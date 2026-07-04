'use client';

import { useEffect, useRef, useState } from 'react';

const FAQS = [
  {
    q: 'Can I manage multiple transport companies under a single login?',
    a: 'Yes. FreightFlow features native multi-company architecture. You can manage separate transport entities with individual GSTINs and isolated database schemas, switching between them instantly from your dashboard switcher.',
  },
  {
    q: 'How does FreightFlow handle GST calculations and GTA RCM rules?',
    a: 'We calculate CGST, SGST, and IGST automatically based on origin/destination pin codes. For GTA operations, our system has RCM rules built-in, letting you toggle between 5% RCM or 12% forward charge in a single click.',
  },
  {
    q: 'Can I validate e-Way Bills and generate e-Invoices?',
    a: 'Yes. FreightFlow integrates with official tax portal schemas. You can validate NIC registration numbers directly and generate e-invoice IRNs upon LR confirmation.',
  },
  {
    q: 'Is there a driver mobile app, and does it require high-speed internet?',
    a: 'No. The driver app is optimized to operate on low-bandwidth 2G/3G networks on highways. Drivers can easily log fuel slips, request advances, and upload photos of signed POD receipts.',
  },
  {
    q: 'How does the pallet tracking module work?',
    a: 'You can record pallet counts on every booking. The system monitors outstanding pallets per dealer/client, flags aging returns, and generates printable statements to eliminate lost inventory.',
  },
  {
    q: 'Can I export my operational data to Tally or Excel?',
    a: 'Yes. All client ledgers, trip expense sheets, driver advances, and GSTR-ready data sheets can be exported in one click to Tally-compatible Excel/CSV formats.',
  },
  {
    q: 'Is my company data kept safe and isolated?',
    a: 'Yes. We enforce PostgreSQL Row-Level Security (RLS) policies at the database tier. Your business records are mathematically isolated and completely inaccessible to other users.',
  },
  {
    q: 'How are vehicle document expiries tracked?',
    a: 'You can log vehicle registration, Fitness Certificates, National Permits, PUCs, and Insurance. The platform automatically triggers alert notifications 7, 15, and 30 days before document expiry dates.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('@/lib/gsap');

      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titleRef.current, start: 'top 85%' } }
        );
      }

      if (faqRef.current) {
        gsap.fromTo(faqRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: faqRef.current, start: 'top 80%' } }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      id="faq"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: '#0F1B2E' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" style={{ strokeWidth: 0.5 }}>
          <pattern id="faq-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2E4E7C" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#faq-grid)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div ref={titleRef} style={{ opacity: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" style={{ letterSpacing: '-2px' }}>
            Got questions?
            <br /><span className="text-ff-amber-500">We have answers.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to know about setting up and running your transport business on FreightFlow.
          </p>
        </div>

        {/* FAQ List */}
        <div ref={faqRef} style={{ opacity: 0 }} className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-ff-navy-700/50 bg-[#0B1220]/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-ff-navy-900/30 transition-colors focus:outline-none"
                >
                  <span className="text-white font-bold text-base pr-4">{faq.q}</span>
                  <span className={`text-ff-amber-500 font-black text-lg transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                    ＋
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-60 opacity-100 border-t border-ff-navy-700/30' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-6 text-white/60 text-sm leading-relaxed">
                    {faq.a}
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
