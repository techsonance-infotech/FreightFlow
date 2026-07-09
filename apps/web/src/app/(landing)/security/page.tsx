import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { ShieldCheck, Lock, Building, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bank-Grade Security Architecture — FreightFlow',
  description: 'FreightFlow employs enterprise isolation, audited gateway connections, automated database backups, and encrypted transport layers to secure your supply chain data.',
};

export default function SecurityPage() {
  const points = [
    {
      title: 'Tenant Isolation via PostgreSQL RLS',
      description: 'Your business data belongs only to you. Every table is guarded by strict Row-Level Security (RLS) policies that isolate database operations down to individual transporter workspace IDs.',
      icon: <Lock className="w-8 h-8 text-ff-teal-400" />,
    },
    {
      title: 'SSL/TLS Encryption in Transit & At Rest',
      description: 'All dispatch records, client lists, e-Way bills, and financial ledger data are encrypted using TLS 1.3 in transit and AES-256 at rest, safeguarding your company against eavesdropping.',
      icon: <ShieldCheck className="w-8 h-8 text-ff-teal-400" />,
    },
    {
      title: 'Audited API Access to Gov Gateways',
      description: 'We connect directly to statutory portals (NIC e-Way bill/e-Invoice systems) using encrypted tokens, preventing password leakage and keeping authorization histories fully auditable.',
      icon: <Building className="w-8 h-8 text-ff-teal-400" />,
    },
    {
      title: 'Automated Infrastructure Backups',
      description: 'Database status snapshots are captured hourly and distributed across multiple cloud zones in highly-secured facilities, guaranteeing business continuity and robust disaster recovery.',
      icon: <Database className="w-8 h-8 text-ff-teal-400" />,
    },
  ];

  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col bg-[#050D1E]">
      <Nav />

      {/* Hero Section */}
      <section 
        className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden bg-[#050D1E]"
      >
        {/* Glowing blur blobs matching landing hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-[40vw] h-[40vw] rounded-full filter blur-[150px] opacity-[0.08]" style={{ background: '#2563EB' }} />
          <div className="absolute bottom-20 right-1/4 w-[35vw] h-[35vw] rounded-full filter blur-[120px] opacity-[0.05]" style={{ background: '#FFB300' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center text-ff-teal-300 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest bg-ff-teal-500/10 px-3.5 py-1.5 rounded-full border border-ff-teal-500/30 shadow-lg shadow-ff-teal-500/10">
            Trust & Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-6 mb-6 leading-tight">
            Bank-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-ff-teal-400 to-ff-teal-300 drop-shadow-sm">Security</span> Architecture
          </h1>
          <p className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            FreightFlow employs enterprise isolation, audited gateway connections, and encrypted transport layers to secure your supply chain data.
          </p>
        </div>
      </section>

      {/* Security Details */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-grow space-y-12 relative z-10">
        <div className="grid sm:grid-cols-2 gap-8">
          {points.map((p) => (
            <div key={p.title} className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 sm:p-8 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300">
              <span className="block mb-4">{p.icon}</span>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 tracking-tight">
                {p.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        {/* Certificate / Standards Box */}
        <div className="bg-gradient-to-r from-ff-teal-500/5 to-blue-500/5 border border-ff-teal-500/10 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-white font-bold text-lg">Continuous Security Audits</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Our codebase is continually scanned for package vulnerabilities, dependency exploits, and secrets leakage to ensure your production dashboard remains resilient against attacks.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
