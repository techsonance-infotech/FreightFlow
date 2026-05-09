'use client';

import React from 'react';
import { Trophy, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ComplianceLeaderboard({ data }: { data: any[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Sovereignty Rankings</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Tenant Compliance & Integrity Leaderboard</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative z-10 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar overflow-x-hidden">
        {data.map((tenant, index) => (
          <div key={tenant.id} className="group p-8 bg-slate-50/50 hover:bg-white rounded-[2.5rem] border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-6 min-w-0">
                <div className="h-14 w-14 shrink-0 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate">{tenant.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{tenant.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-3xl font-black tracking-tighter leading-none",
                  tenant.score === 100 ? "text-emerald-600" : tenant.score > 50 ? "text-amber-500" : "text-rose-600"
                )}>{tenant.score}%</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Integrity</p>
              </div>
            </div>

            <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
               <div className={cn(
                 "h-full transition-all duration-1000 rounded-full",
                 tenant.score === 100 ? "bg-emerald-500" : tenant.score > 50 ? "bg-amber-500" : "bg-rose-500"
               )} style={{ width: `${tenant.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
         <Activity className="h-6 w-6 text-emerald-600" />
         <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-relaxed">
           Leaderboard rankings are dynamically recalculated based on document verification velocity and expiry mitigation protocols.
         </p>
      </div>
    </div>
  );
}
