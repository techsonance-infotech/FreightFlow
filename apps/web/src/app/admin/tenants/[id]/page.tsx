import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  Building2, Users, Truck, 
  TrendingUp, AlertCircle, ShieldCheck,
  ArrowLeft, ExternalLink, Zap,
  Activity, DollarSign, Clock,
  MoreVertical, CheckCircle2, Layout
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { ShadowModeButton } from '@/components/admin/shadow-mode-button';
import { KycGovernance } from '@/components/admin/tenants/kyc-governance';
import { BillingGovernance } from '@/components/admin/tenants/billing-governance';
import { ApiKeyManager } from '@/components/admin/integrations/api-key-manager';
import { WebhookManager } from '@/components/admin/integrations/webhook-manager';
import { SandboxOperations } from '@/components/admin/tenants/sandbox-operations';

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  // ... (existing logic)
  const { id } = params;

  // Deep fetch of tenant ecosystem
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      companies: {
        include: {
          _count: {
            select: { 
              users: true, 
              vehicles: true, 
              trips: true,
              employees: true
            }
          }
        }
      },
      _count: {
        select: {
          users: true,
          vehicles: true,
          licenseRequests: true
        }
      },
      kycDocuments: true,
      invoices: true,
      apiKeys: true,
      webhooks: true
    }
  });

  if (!tenant) notFound();

  // Aggregate metrics across all businesses
  const totalVehicles = tenant.companies.reduce((acc, c) => acc + c._count.vehicles, 0);
  const totalTrips = tenant.companies.reduce((acc, c) => acc + c._count.trips, 0);
  const totalEmployees = tenant.companies.reduce((acc, c) => acc + c._count.employees, 0);

  // Estimate active load (Mock logic based on trip count)
  const operationalScore = Math.min(100, Math.round((totalTrips / (Math.max(1, tenant.companies.length) * 50)) * 100));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/tenants" className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{tenant.name}</h1>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">
                {tenant.plan} Enterprise
              </span>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-1 ml-1">
              Workspace Intelligence & Operational Oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ShadowModeButton tenantId={tenant.id} />
        </div>
      </div>

      {/* Cross-Business KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          label="Enterprise Fleet" 
          value={totalVehicles.toString()} 
          sub="Across all businesses"
          icon={<Truck className="h-6 w-6" />} 
          color="blue"
        />
        <MetricCard 
          label="Active Talent" 
          value={totalEmployees.toString()} 
          sub="Staff & Drivers"
          icon={<Users className="h-6 w-6" />} 
          color="indigo"
        />
        <MetricCard 
          label="Platform Velocity" 
          value={`${totalTrips} Trips`} 
          sub="Total Dispatches"
          icon={<TrendingUp className="h-6 w-6" />} 
          color="emerald"
        />
        <MetricCard 
          label="Operational Score" 
          value={`${operationalScore}%`} 
          sub="Utilization Index"
          icon={<Activity className="h-6 w-6" />} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Business Structure Breakdown */}
        <div className="lg:col-span-2 space-y-12">
          {/* KYC Governance Sector */}
          <KycGovernance tenantId={tenant.id} documents={tenant.kycDocuments} />

          {/* Integration & API Hub */}
          <div className="grid grid-cols-1 gap-12">
            <ApiKeyManager tenantId={tenant.id} apiKeys={tenant.apiKeys} />
            <WebhookManager tenantId={tenant.id} webhooks={tenant.webhooks} />
          </div>

          {/* Advanced Multi-Tenancy & Sandboxing */}
          <SandboxOperations tenant={tenant} />

          {/* Billing & Fiscal Hub */}
          <BillingGovernance tenantId={tenant.id} invoices={tenant.invoices} />

          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Business Hierarchy</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-Business Entity Breakdown</p>
              </div>
            </div>

            <div className="space-y-6">
              {tenant.companies.map((company) => (
                <BusinessRow key={company.id} company={company} />
              ))}
            </div>
          </div>

          {/* Module Governance */}
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            <h3 className="text-2xl font-black tracking-tight mb-10">Module Governance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ModuleToggle label="Fleet & Maintenance" active icon={<Truck className="h-4 w-4" />} />
              <ModuleToggle label="Core Accounting" active icon={<DollarSign className="h-4 w-4" />} />
              <ModuleToggle label="HR & Payroll" active icon={<Users className="h-4 w-4" />} />
              <ModuleToggle label="Advanced Analytics" icon={<Activity className="h-4 w-4" />} />
              <ModuleToggle label="Client Portal" icon={<Layout className="h-4 w-4" />} />
              <ModuleToggle label="Automation Hub" icon={<Zap className="h-4 w-4" />} />
            </div>
          </div>
        </div>

        {/* Workspace Health & Governance */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Governance Summary</h3>
            <div className="space-y-8">
              <HealthItem label="License Validity" value="Healthy" sub={`Expires ${tenant.licenseExpiresAt ? format(new Date(tenant.licenseExpiresAt), 'MMM dd, yyyy') : 'Never'}`} color="emerald" />
              <HealthItem label="Risk Factor" value="Low" sub="No Compliance Breach" color="blue" />
              <HealthItem label="Shadow Frequency" value="0.2/mo" sub="Admin Oversight Low" color="slate" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">System Audit</h3>
            <div className="space-y-6">
              <AuditMiniRow label="License Issued" date="2h ago" />
              <AuditMiniRow label="Plan Upgraded" date="3d ago" />
              <AuditMiniRow label="Shadow Launch" date="1w ago" />
            </div>
            <button className="w-full mt-10 h-14 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all">
              View Detailed Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50',
  };

  return (
    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] hover:shadow-2xl transition-all group shadow-sm">
      <div className={`h-16 w-16 ${colors[color]} rounded-3xl flex items-center justify-center mb-8 shadow-inner border group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{label}</p>
      <div className="space-y-1">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}

function BusinessRow({ company }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-[2.5rem] transition-all group border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 text-lg uppercase group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
          {company.name.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-black text-slate-900 tracking-tight">{company.name}</p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Truck className="h-3 w-3 text-blue-500" /> {company._count.vehicles} Fleet
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Zap className="h-3 w-3 text-amber-500" /> {company._count.trips} Trips
            </div>
          </div>
        </div>
      </div>
      <button className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95">
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModuleToggle({ label, active, icon }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${
      active ? 'bg-white/10 border-white/20' : 'bg-slate-800/30 border-slate-800 opacity-50 grayscale'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-700'}`}>
          {icon}
        </div>
        {active && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{label}</p>
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        {active && <div className="h-full bg-blue-600 w-full" />}
      </div>
    </div>
  );
}

function HealthItem({ label, value, sub, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    slate: 'text-slate-500',
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className={`text-xs font-black uppercase tracking-widest ${colors[color]}`}>{value}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-300">{sub}</p>
    </div>
  );
}

function AuditMiniRow({ label, date }: any) {
  return (
    <div className="flex items-center justify-between group cursor-help">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</span>
      <span className="text-[10px] font-black text-slate-300 font-mono">{date}</span>
    </div>
  );
}
