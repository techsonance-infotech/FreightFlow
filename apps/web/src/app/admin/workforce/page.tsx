import React from 'react';
import { 
  Users, UserCheck, ShieldAlert, 
  Activity, RefreshCw, Trophy,
  MapPin, Star
} from 'lucide-react';
import { 
  getGlobalWorkforceMetrics, 
  getTenantWorkforceAnalytics 
} from '@/app/actions/admin/workforce';
import { WorkforceMetrics } from '@/components/admin/workforce/workforce-metrics';
import { PersonnelLeaderboard } from '@/components/admin/workforce/personnel-leaderboard';

export default async function AdminWorkforcePage() {
  const metrics = await getGlobalWorkforceMetrics();
  const analytics = await getTenantWorkforceAnalytics();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <Users className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Workforce Oversight</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-2">Global Platform Personnel Governance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Sync Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Workforce Metrics */}
      <WorkforceMetrics metrics={metrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2">
          <PersonnelLeaderboard data={analytics} />
        </div>

        <div className="xl:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Geographic staff Hubs</h3>
             <div className="space-y-8">
                {metrics.geographicDistribution.map((region: any) => (
                  <div key={region.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <MapPin className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{region.region} Hub</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{region.staff} Active Personnel</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{region.health}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16" />
             <h3 className="text-xl font-black tracking-tight mb-8 relative z-10">Platform Blacklist</h3>
             <div className="space-y-6 relative z-10">
                <p className="text-xs font-bold text-indigo-100 opacity-80 leading-relaxed">
                  The unified platform blacklist ensures that restricted entities are automatically flagged across all workspace nodes.
                </p>
                <div className="flex items-center justify-between p-6 bg-white/10 rounded-2xl border border-white/10">
                   <div>
                      <p className="text-2xl font-black">{metrics.blacklistCount}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Restricted Nodes</p>
                   </div>
                   <ShieldAlert className="h-8 w-8 text-white/40" />
                </div>
             </div>
             <button className="w-full mt-10 h-14 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                Manage Restrictions
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
