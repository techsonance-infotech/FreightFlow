import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { CompanySetupWizard } from '@/components/dashboard/company-setup-wizard';
import { Building2, ShieldCheck, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

import { NewOrganizationForm } from './new-organization-form';

export default async function NewOrganizationPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string, mode?: string }> 
}) {
  const session = await getSession();
  const { id, mode } = await searchParams;
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const { role } = session.user;
  
  // Strict RBAC: Only Owners/Admins can establish new organizations
  const allowedRoles = ['tenant_owner', 'fleet_owner', 'business_owner', 'super_admin'];
  if (!allowedRoles.includes(role)) {
    redirect('/dashboard/settings/organizations');
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/settings/organizations"
              className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {mode === 'view' ? 'Review Organization' : id ? 'Modify Organization' : 'Onboard New Entity'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Corporate Establishment & Compliance Hub</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Ready</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted Session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
        {/* Main Onboarding Form - Full Width */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-blue-600 px-10 py-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {mode === 'view' ? 'Entity Dossier' : 'Organization Setup'}
              </h2>
              <p className="text-blue-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">
                {mode === 'view' ? 'Locked for auditing and verification' : 'Follow the wizard to register your legal business entity'}
              </p>
            </div>
            <Building className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 rotate-12" />
          </div>
          
          <div className="p-2">
            <NewOrganizationForm id={id} mode={mode} />
          </div>
        </div>

        {/* Guidance Sections Moved Downward */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {/* Why Multi-Tenant Section - Brand Matched */}
          <div className="bg-[#0A1628] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <Sparkles className="h-8 w-8 text-blue-400 mb-6" />
            <h3 className="text-lg font-black tracking-tight uppercase mb-4">Why Multi-Tenant?</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              FreightFlow allows you to manage multiple companies (e.g., Roadlines, Logistics, Trading) under a single unified dashboard. 
            </p>
            <ul className="mt-6 space-y-4">
              {[
                'Independent Accounting per Entity',
                'Shared Fleet Resources',
                'Centralized Workforce Tracking',
                'Unified Compliance Vault'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Building2 className="absolute -right-12 -bottom-12 h-40 w-40 text-white/5 -rotate-12" />
          </div>

          {/* Compliance Checklist Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Compliance Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {[
                { label: 'Legal PAN', sub: 'Required for tax filing' },
                { label: 'GST Certificate', sub: 'Optional but recommended' },
                { label: 'Reg. Address', sub: 'Proof of office location' },
                { label: 'Bank Details', sub: 'For settlements' }
              ].map((check, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-5 w-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{check.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-tight mt-0.5">{check.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={4}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-7.714L1 12l7.714-2.143L11 3z" />
    </svg>
  );
}
