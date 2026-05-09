import React from 'react';
import { 
  Zap, ToggleRight, ShieldCheck, 
  RefreshCw, Layout, Terminal
} from 'lucide-react';
import { getFeatureFlags } from '@/app/actions/admin/feature-flags';
import { FlagMatrix } from '@/components/admin/features/flag-matrix';
import { cn } from '@/lib/utils';

export default async function AdminFeaturesPage() {
  const flags = await getFeatureFlags();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <Zap className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Feature Engine</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-2">Global Module & Flag Governance Matrix</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Sync Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Feature Flag Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2">
          <FlagMatrix flags={flags} />
        </div>

        <div className="xl:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Governance Summary</h3>
             <div className="space-y-8">
                <SummaryRow label="Active Beta Nodes" value={flags.reduce((acc, f) => acc + f.tenantIds.length, 0).toString()} color="blue" />
                <SummaryRow label="GA Enforcement" value={flags.filter(f => f.status === 'ga').length.toString()} color="emerald" />
                <SummaryRow 
                  label="Protocol Stability" 
                  value={flags.length > 0 ? (flags.filter(f => f.status === 'ga').length / flags.length > 0.7 ? "Optimal" : "Active") : "Stable"} 
                  color="indigo" 
                />
             </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -mr-16 -mt-16" />
             <h3 className="text-xl font-black tracking-tight mb-8 relative z-10">Rollout Protocols</h3>
             <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8 relative z-10">
               Feature flags enable safe, multi-tenant experimentation. Beta flags are only visible to targeted tenant UUIDs.
             </p>
             <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol V4</span>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">ENCRYPTED</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 w-2/3 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: any) {
  const colorMap: any = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600'
  };
  return (
    <div className="flex items-center justify-between group cursor-help">
       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</span>
       <span className={cn("text-sm font-black tracking-tight", colorMap[color])}>{value}</span>
    </div>
  );
}
