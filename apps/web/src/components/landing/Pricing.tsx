'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '₹1,999',
    period: '/month',
    tagline: 'Perfect for small fleets (up to 15 trucks)',
    color: '#0EA5A0',
    highlighted: false,
    features: [
      '1 Isolated Company Tenant',
      'Up to 5 User accounts',
      'Up to 15 Trucks maximum',
      '500 Lorry Receipts (LR) / month',
      'Instant 30s LR Creation & Printing',
      'Standard Pallet Tracking & return logs',
      'Basic Billing calculations',
      'Standard Email & Chat Support',
    ],
    missing: [
      'Trip Profit & Loss ledgers',
      'Automated HR & Driver Payroll',
      'Advanced BI Corridor Analytics',
      'NIC E-Way Bill auto-renewals',
    ],
    cta: 'Start 7-Day Free Trial',
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    price: '₹4,999',
    period: '/month',
    tagline: 'For expanding regional fleets (up to 75 trucks)',
    color: '#F59E0B',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      '3 Isolated Company Tenants',
      'Up to 25 User accounts',
      'Up to 75 Trucks maximum',
      '5,000 Lorry Receipts (LR) / month',
      'Everything in Starter included',
      'Trip P&L (Fuel, Tolls, Driver advances)',
      'Double-entry ledgers (AR/AP accounts)',
      'Automated HR & Driver Payroll',
      'Full GST & Compliance calendar',
      'Priority Phone Support (9 AM - 9 PM)',
    ],
    missing: [
      'Multi-branch permissions delegation',
      'Dedicated SLA Account Manager',
    ],
    cta: 'Book a Free Demo',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 'Custom',
    period: '',
    tagline: 'For national fleets & corporate carriers (75+ trucks)',
    color: '#F59E0B',
    highlighted: false,
    features: [
      'Unlimited Company Tenants',
      'Unlimited User accounts & roles',
      'Unlimited Trucks & active trips',
      'Unlimited Lorry Receipts (LR)',
      'Everything in Growth included',
      'Multi-branch delegation & permissions',
      'Custom API integrations',
      'Whitelabel branding & custom invoices',
      'Dedicated Account Success Manager',
      'Guaranteed 99.9% System SLA uptime',
    ],
    missing: [],
    cta: 'Contact Sales / Demo',
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const headRef = useRef<HTMLHeadingElement>(null);

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

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, ease: 'power3.out',
            delay: i * 0.12,
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach(t => t.kill());
    };
    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F1B2E 0%, #0B1220 100%)' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(13,148,136,0.03) 0%, transparent 60%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-bold uppercase tracking-[0.18em] border border-ff-navy-500/30 bg-ff-navy-900/50 text-ff-teal-500">
            FLEXIBLE LICENSING
          </div>
          <h2
            ref={headRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
            style={{ letterSpacing: '-2px', opacity: 0 }}
          >
            Simple, transparent{' '}
            <br /><span className="text-ff-amber-500">pricing modules.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Start a 7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              ref={el => { if (el) cardsRef.current[i] = el; }}
              className={`relative rounded-2xl p-8 transition-all duration-500 group hover:-translate-y-2 will-change-transform flex flex-col justify-between ${
                plan.highlighted
                  ? 'border border-ff-amber-500/30 bg-gradient-to-b from-[#111A2E] to-[#0B1220] shadow-2xl shadow-ff-amber-500/5'
                  : 'border border-ff-navy-700/50 bg-ff-navy-900/30 hover:border-ff-navy-700'
              }`}
              style={{ opacity: 0 }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-ff-amber-500 to-ff-amber-600 text-ff-navy-950 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan name */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
                    style={{ background: `${plan.color}15`, color: plan.color, border: `1px solid ${plan.color}30` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: plan.color }} />
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-4xl font-black text-white"
                    >
                      {plan.price}
                    </span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-white/50 text-xs">{plan.tagline}</p>
                </div>

                <div className="border-t border-ff-navy-700/50 my-6" />

                {/* Feature list */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: plan.color }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/80 text-xs font-medium">{feat}</span>
                    </div>
                  ))}
                  {plan.missing.length > 0 && (
                    <>
                      <div className="my-3 border-t border-ff-navy-700/30" />
                      {plan.missing.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 opacity-20">
                          <svg className="w-4 h-4 shrink-0 mt-0.5 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white/35 text-xs font-medium">{feat}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/login"
                id={`pricing-cta-${plan.id}`}
                className={`block w-full text-center py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-ff-amber-500 text-ff-navy-950 hover:bg-ff-amber-600 shadow-lg shadow-ff-amber-500/10 hover:shadow-ff-amber-500/20'
                    : 'border border-white/15 text-white/90 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 text-center border-t border-ff-navy-700/50 pt-10">
          <p className="text-white/40 text-xs">
            All subscriptions include: automatic cloud backups, AES-256 file attachments encryption, GSTR files export, and direct integration support.
          </p>
          <p className="text-white/30 text-[10px] mt-2">
            Pricing shown excludes applicable GST (18%). Annual commitments qualify for a 20% discount.
          </p>
        </div>
      </div>
    </section>
  );
}
