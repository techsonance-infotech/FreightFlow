import React from 'react';
import { 
  Truck, Zap, Activity, ShieldCheck, 
  Globe, RefreshCw, Layout
} from 'lucide-react';
import { 
  getGlobalFleetMetrics, 
  getCrossTenantFleetDistribution 
} from '@/app/actions/admin/fleet';
import { AssetUtilizationMetrics } from '@/components/admin/fleet/asset-utilization-metrics';
import { GlobalFleetMap } from '@/components/admin/fleet/global-fleet-map';
import { TenantFleetMatrix } from '@/components/admin/fleet/tenant-fleet-matrix';

export default async function AdminFleetPage() {
  const metrics = await getGlobalFleetMetrics();
  const distribution = await getCrossTenantFleetDistribution();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <Truck className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Fleet Control Tower</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">Cross-Tenant Asset & Dispatch Oversight</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fleet Telemetry Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* High-Level Metrics */}
      <AssetUtilizationMetrics metrics={metrics} />

      {/* Global Pulse Section */}
      <GlobalFleetMap nodes={metrics.geographicNodes} />

      {/* Fleet Distribution Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2">
          <TenantFleetMatrix data={distribution} />
        </div>

        <div className="xl:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Asset Compliance Nodes</h3>
            <div className="space-y-8">
              <ComplianceItem label="RC Integrity" value={98.2} color="emerald" />
              <ComplianceItem label="Insurance Sync" value={94.5} color="blue" />
              <ComplianceItem label="National Permits" value={82.1} color="amber" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -mr-16 -mt-16" />
             <h3 className="text-xl font-black tracking-tight mb-8 relative z-10">Operational Warnings</h3>
             <div className="space-y-6 relative z-10">
                <WarningRow label="High Latency (Virginia)" time="2m ago" />
                <WarningRow label="Permit Breach (Tenant: FF-12)" time="14m ago" />
                <WarningRow label="Idle Fleet Threshold" time="1h ago" />
             </div>
             <button className="w-full mt-10 h-14 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                View Operational Logs
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceItem({ label, value, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500'
  };
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-black text-slate-900">{value}%</span>
       </div>
       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", colorMap[color])} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
}

function WarningRow({ label, time }: any) {
  return (
    <div className="flex items-center justify-between group cursor-help">
       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
       <span className="text-[10px] font-black text-slate-600">{time}</span>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
