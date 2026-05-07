import React from 'react';
import { 
  LifeBuoy, ShieldCheck, Activity, 
  RefreshCw, Terminal, Layout
} from 'lucide-react';
import { 
  getGlobalSupportMetrics, 
  getGlobalTicketRegistry 
} from '@/app/actions/admin/support';
import { SupportMetrics } from '@/components/admin/support/support-metrics';
import { TicketRegistry } from '@/components/admin/support/ticket-registry';
import { cn } from '@/lib/utils';

export default async function AdminSupportPage() {
  const metrics = await getGlobalSupportMetrics();
  const tickets = await getGlobalTicketRegistry();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <LifeBuoy className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Assistance Deck</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">Global Platform Helpdesk & SLA Governance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support Sync Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Support Metrics */}
      <SupportMetrics metrics={metrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2">
          <TicketRegistry tickets={tickets} />
        </div>

        <div className="xl:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">SLA Priority Matrix</h3>
             <div className="space-y-8">
                <PriorityRow label="Critical Nodes" value={metrics.priorityMix.critical} color="rose" />
                <PriorityRow label="High Priority" value={metrics.priorityMix.high} color="amber" />
                <PriorityRow label="Standard Operations" value={metrics.priorityMix.medium} color="blue" />
             </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -mr-16 -mt-16" />
             <h3 className="text-xl font-black tracking-tight mb-8 relative z-10">Support Protocol</h3>
             <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8 relative z-10">
               Administrative sovereignty requires immediate resolution of critical platform breaches. SLA adherence is strictly monitored.
             </p>
             <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                <div>
                   <p className="text-2xl font-black">{metrics.slaAdherence}%</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Adherence Rating</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-400 opacity-60" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityRow({ label, value, color }: any) {
  const colorMap: any = {
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50'
  };
  return (
    <div className="flex items-center justify-between group">
       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</span>
       <div className={cn("h-8 w-12 rounded-lg flex items-center justify-center font-black text-sm", colorMap[color])}>
          {value}
       </div>
    </div>
  );
}
