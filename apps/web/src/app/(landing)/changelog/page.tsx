'use client';

import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export default function ChangelogPage() {
  const changelogData = [
    {
      version: 'v1.2.0',
      date: 'July 2, 2026',
      title: 'Statutory GST & E-Invoice Integrations',
      description: 'Major update introducing direct government gateway integrations for automated e-Way bills and compliant e-Invoicing.',
      categories: [
        {
          name: 'New',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          items: [
            'Direct e-Way Bill generation integrated with the NIC gateway.',
            'Automated IRN e-Invoice generation during transport booking compilation.',
            'TDS calculation automation under Section 194C for transporter payments.',
          ],
        },
        {
          name: 'Improved',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          items: [
            'Optimized loading speed for multi-tenant invoice dashboard by 40%.',
            'Added responsive filters to the transport registry search.',
          ],
        },
      ],
    },
    {
      version: 'v1.1.0',
      date: 'June 18, 2026',
      title: 'Transporter Registries & Driver SMS Alerts',
      description: 'Streamline operations with offline-ready registries and SMS dispatch notifications directly to drivers.',
      categories: [
        {
          name: 'New',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          items: [
            'Integrated SMS alerts sending LR coordinates and route details to drivers.',
            'Global search system for driver verification and license checks.',
          ],
        },
        {
          name: 'Security',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          items: [
            'Implemented strict PostgreSQL Row-Level Security (RLS) policies for secure tenant isolation.',
            'Enhanced auth session encryption matching international standards.',
          ],
        },
      ],
    },
    {
      version: 'v1.0.0',
      date: 'June 1, 2026',
      title: 'The Launch of FreightFlow',
      description: 'Initial public launch of FreightFlow — the Logistics & Supply Chain Intelligence platform built specifically for Indian transport businesses.',
      categories: [
        {
          name: 'New',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          items: [
            'Interactive dashboard for monitoring active dispatches, bookings, and billing.',
            'Beautiful PDF generation module for clean, professional Lorry Receipts (LR).',
            'Full database model support for multi-company logistics registries.',
            'Secure account onboarding and role-based access management.',
          ],
        },
      ],
    },
  ];

  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col bg-[#050D1E]">
      <Nav />

      {/* Content Area */}
      <div 
        className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050D1E]"
      >
        {/* Glowing blur blobs matching landing & about hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-[40vw] h-[40vw] rounded-full filter blur-[150px] opacity-[0.08]" style={{ background: '#2563EB' }} />
          <div className="absolute bottom-20 right-1/4 w-[35vw] h-[35vw] rounded-full filter blur-[120px] opacity-[0.05]" style={{ background: '#FFB300' }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-12 space-y-4">
            <span className="inline-flex items-center text-ff-teal-300 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest bg-ff-teal-500/10 px-3.5 py-1.5 rounded-full border border-ff-teal-500/30 shadow-lg shadow-ff-teal-500/10">
              Platform Releases
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-4">
              Changelog
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              Stay up to date with the latest features, security updates, and performance improvements shipped to FreightFlow.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative border-l border-white/10 pl-6 ml-4 sm:ml-6 space-y-12">
            {changelogData.map((release) => (
              <div key={release.version} className="relative">
                {/* Bullet node */}
                <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ff-teal-500 ring-4 ring-[#050D1E] shadow-[0_0_8px_rgba(20,184,166,0.5)]" />

                {/* Release Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
                  <span className="text-ff-teal-400 font-mono font-bold text-lg tracking-wider">
                    {release.version}
                  </span>
                  <span className="text-white/40 text-xs font-semibold sm:ml-2">
                    {release.date}
                  </span>
                </div>

                {/* Card Container */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 hover:border-white/10 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                    {release.title}
                  </h2>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    {release.description}
                  </p>

                  {/* Categories */}
                  <div className="space-y-6">
                    {release.categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${category.color}`}>
                          {category.name}
                        </span>
                        <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
