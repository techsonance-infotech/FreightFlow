import React from 'react';
import { 
  History, ShieldCheck, 
  Database, Zap, 
  Download
} from 'lucide-react';
import { AuditRegistry } from '@/components/admin/audit/audit-registry';
import { ActivityHeatmap } from '@/components/admin/audit/activity-heatmap';
import { getAuditStats } from '@/app/actions/admin/audit';
import { Button } from '@/components/ui/button';

export default async function AuditHubPage() {
  const stats = await getAuditStats();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <History className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Omniscience Hub</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">Unified Audit & Governance Registry</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            className="h-16 px-10 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Export Governance Data
          </Button>
        </div>
      </div>

      {/* Heatmap Section */}
      <ActivityHeatmap stats={stats} />

      {/* Main Registry */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Real-time Activity Stream</h3>
          </div>
          <div className="flex items-center gap-3">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Observation Active</p>
          </div>
        </div>
        
        <AuditRegistry />
      </div>

      {/* Footer Advisory */}
      <div className="bg-blue-600 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <Zap className="h-8 w-8 text-white fill-white" />
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-6">Governance Accountability</h4>
            <p className="text-blue-100 font-bold leading-relaxed opacity-80 max-w-xl">
              The Omniscience Hub maintains an immutable record of every action taken within the FreightFlow platform. This stream is cryptographically synchronized with the core database to ensure total transparency for both platform admins and tenant business owners.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <AdvisoryStat label="Uptime Monitoring" value="100%" />
            <AdvisoryStat label="Data Integrity" value="VERIFIED" />
            <AdvisoryStat label="Sync Latency" value="< 50ms" />
            <AdvisoryStat label="Audit Coverage" value="FULL" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvisoryStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group-hover:bg-white/20 transition-all duration-500">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}
