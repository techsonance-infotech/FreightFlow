'use client';

import React from 'react';
import { Users, Star, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PersonnelLeaderboard({ data }: { data: any[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Efficiency Matrix</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Cross-Tenant Personnel Performance Benchmarking</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            {data.length} Nodes Ranked
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {data.map((tenant, index) => (
          <div key={tenant.id} className="group flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                {index + 1}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{tenant.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Users className="h-3 w-3 text-blue-500" /> {tenant.staffCount} Personnel
                   </p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Star className="h-3 w-3 text-amber-500" /> {tenant.safetyRating} Safety Rating
                   </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
               <div className="text-right">
                  <p className="text-xl font-black text-indigo-600 tracking-tight">
                    {tenant.efficiencyScore}%
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
               </div>
               <div className="h-12 w-px bg-slate-100" />
               <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                  <ArrowUpRight className="h-5 w-5" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem]">
         <Activity className="h-6 w-6 text-indigo-600" />
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-relaxed">
           Personnel efficiency is calculated based on dispatch success rates, safety violations, and operational throughput across all tenant entities.
         </p>
      </div>
    </div>
  );
}
