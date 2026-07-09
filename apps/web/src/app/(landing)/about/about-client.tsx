'use client';

import { useEffect, useRef } from 'react';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { Truck, Zap, ShieldCheck, Briefcase } from 'lucide-react';

export default function AboutClient() {
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tl: any;
    let bobTween: any;

    const init = async () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        const elements = [
          eyebrowRef.current,
          titleRef.current,
          subtitleRef.current,
          statsCardRef.current,
          contentSectionRef.current,
        ];
        elements.forEach((el) => {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      const { gsap } = await import('@/lib/gsap');
      tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        .fromTo(titleRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
        .fromTo(statsCardRef.current, { opacity: 0, x: 30, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .fromTo(contentSectionRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');

      if (statsCardRef.current) {
        bobTween = gsap.to(statsCardRef.current, {
          y: -8,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    };
    init();

    return () => {
      if (tl) tl.kill();
      if (bobTween) bobTween.kill();
    };
  }, []);

  const values = [
    {
      title: 'Transporter Empowerment',
      description: 'We believe logistics is the lifeblood of the economy. Our platform is designed to make transporter operations frictionless, efficient, and profitable.',
      icon: <Truck className="w-8 h-8 text-ff-teal-400" />,
    },
    {
      title: 'Statutory Automation',
      description: 'From e-Way Bills to e-Invoicing and Section 194C TDS, we automate statutory compliance directly inside your daily workflows to eliminate errors and fines.',
      icon: <Zap className="w-8 h-8 text-ff-teal-400" />,
    },
    {
      title: 'Bank-Grade Security',
      description: 'Logistics data is highly sensitive. We protect tenant records using advanced database row-level security and strict data verification standards.',
      icon: <ShieldCheck className="w-8 h-8 text-ff-teal-400" />,
    },
  ];

  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col bg-[#050D1E]">
      <Nav />

      {/* Hero Section */}
      <section 
        className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/5 bg-[#050D1E]"
      >
        {/* Glowing blur blobs matching landing hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-[40vw] h-[40vw] rounded-full filter blur-[150px] opacity-[0.08]" style={{ background: '#2563EB' }} />
          <div className="absolute bottom-20 right-1/4 w-[35vw] h-[35vw] rounded-full filter blur-[120px] opacity-[0.05]" style={{ background: '#FFB300' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="md:col-span-7 space-y-6 text-left">
            <span 
              ref={eyebrowRef}
              style={{ opacity: 0 }}
              className="inline-flex items-center text-ff-teal-300 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest bg-ff-teal-500/10 px-3.5 py-1.5 rounded-full border border-ff-teal-500/30 shadow-lg shadow-ff-teal-500/10"
            >
              About Us
            </span>
            
            <h1 
              ref={titleRef}
              style={{ opacity: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
            >
              Logistics & Supply Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-ff-teal-400 to-ff-teal-300 drop-shadow-sm">Intelligence</span>
            </h1>
            
            <p 
              ref={subtitleRef}
              style={{ opacity: 0 }}
              className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed font-sans font-medium"
            >
              FreightFlow is a unified multi-tenant software built to streamline transport operations, accounting, and compliance for Indian logistics fleets.
            </p>
          </div>

          {/* Hero Right Column: Interactive Card */}
          <div className="md:col-span-5 flex justify-center">
            <div 
              ref={statsCardRef}
              style={{ opacity: 0 }}
              className="w-full max-w-sm bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
            >
              {/* Card glowing badge */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-ff-teal-500/20 rounded-full blur-2xl group-hover:bg-ff-teal-500/30 transition-all" />
              
              <h3 className="text-white font-bold text-xl mb-4 tracking-tight">FreightFlow at a Glance</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-ff-teal-500/10 border border-ff-teal-500/20 flex items-center justify-center text-ff-teal-400">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-white text-xs font-bold">NIC Gateway Integrated</h4>
                    <p className="text-[10px] text-white/50">Instant e-Way Bills and e-Invoices</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-ff-teal-500/10 border border-ff-teal-500/20 flex items-center justify-center text-ff-teal-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-white text-xs font-bold">Data Isolation via RLS</h4>
                    <p className="text-[10px] text-white/50">Strict multi-tenant security architecture</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-ff-teal-500/10 border border-ff-teal-500/20 flex items-center justify-center text-ff-teal-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-white text-xs font-bold">Sec. 194C Accounting</h4>
                    <p className="text-[10px] text-white/50">Automated TDS and driver ledger audit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Story Content */}
      <section 
        ref={contentSectionRef}
        style={{ opacity: 0 }}
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 relative z-10"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tight">Our Mission</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Logistics networks in India face high operational friction—complex paperwork, manually generated Lorry Receipts, disjointed accounting, and strict compliance regulations. 
            </p>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              FreightFlow was designed by <strong>Techsonance InfoTech LLP</strong> to bring enterprise-level intelligence and automation to transporters, fleet managers, and dispatchers. We unite dispatches, billing, tracking, and compliance under one secure platform.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ff-teal-500/10 rounded-full blur-2xl" />
            <h3 className="text-lg font-bold text-white mb-2">Designed by Techsonance</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Proudly engineered to address real challenges faced in transport offices.
            </p>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-white/40">
              <span>Agency HQ: Surat, India</span>
              <a href="https://techsonance.co.in" target="_blank" rel="noopener noreferrer" className="text-ff-teal-400 hover:underline">
                Visit Agency &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Values / Pillars */}
        <div className="pt-16 border-t border-white/5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight mb-12">Core Design Principles</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white/[0.01] border border-white/5 rounded-xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:border-white/10">
                <span className="block mb-4">{v.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
