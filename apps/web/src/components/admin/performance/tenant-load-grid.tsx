'use client';

import React from 'react';
import { Users, Zap, ArrowUpRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TenantLoadGrid({ data }: { data: any[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 rotate-3">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Tenant Load Matrix</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Cross-Tenant Resource Consumption Analytics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-slate-900 tracking-tighter">TOP 5</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Consumers</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((tenant, index) => (
          <div key={tenant.id} className="group flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                {index + 1}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                  {tenant.name}
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                    tenant.plan === 'enterprise' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {tenant.plan}
                  </span>
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Mutations: <span className="text-slate-900">{tenant.mutations}</span> &bull; Security: VERIFIED
                </p>
              </div>
            </div>

            <div className="flex items-center gap-12">
               <div className="text-right">
                  <p className={cn(
                    "text-xl font-black tracking-tight",
                    tenant.loadIndex > 80 ? "text-rose-600" : "text-indigo-600"
                  )}>{tenant.loadIndex}%</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Index</p>
               </div>
               <div className="h-12 w-px bg-slate-100" />
               <button className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all active:scale-[0.95]">
                  <ArrowUpRight className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
         <Shield className="h-5 w-5 text-amber-500" />
         <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-relaxed">
           Load indices are calculated based on mutation frequency, data ingress, and API overhead over the last 60 minutes.
         </p>
      </div>
    </div>
  );
}
