import React from 'react';
import { 
  Settings, Zap, ShieldCheck
} from 'lucide-react';
import { getPlatformConfig } from '@/app/actions/admin/platform-config';
import { ConfigSidebar } from '@/components/admin/settings/config-sidebar';
import { BrandingSector } from '@/components/admin/settings/branding-sector';
import { BillingSector } from '@/components/admin/settings/billing-sector';
import { SecuritySector } from '@/components/admin/settings/security-sector';
import { InfraSector } from '@/components/admin/settings/infra-sector';
import { ConfigHubClient } from '@/components/admin/settings/config-hub-client';

export default async function AdminSettingsPage() {
  const config = await getPlatformConfig();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <Settings className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Configuration Hub</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">Global Platform Governance Matrix</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Client Hub Layout */}
      <ConfigHubClient config={config} />

      {/* Global Advisory Footer */}
      <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-6">Governance Accountability</h4>
            <p className="text-slate-400 font-bold leading-relaxed opacity-80 max-w-xl">
              Platform-level configurations are mission-critical nodes. Every commit made within this hub is cryptographically tracked and attributed to the authorizing administrator in the platform audit registry.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Protocol Version</p>
              <p className="text-2xl font-black tracking-tight text-white">v4.2.0-STABLE</p>
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Sync Status</p>
              <p className="text-2xl font-black tracking-tight text-emerald-400">ENCRYPTED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
