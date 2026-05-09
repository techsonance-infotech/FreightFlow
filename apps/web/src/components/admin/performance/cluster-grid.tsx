'use client';

import React from 'react';
import { Server, Database, Zap, HardDrive, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClusterGrid({ clusters }: { clusters: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {clusters.map((cluster) => (
        <div key={cluster.id} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
           <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <div className={cn(
                "h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500",
                cluster.type === 'web' ? "bg-blue-600 shadow-blue-200" :
                cluster.type === 'db' ? "bg-indigo-600 shadow-indigo-200" :
                cluster.type === 'cache' ? "bg-amber-500 shadow-amber-200" :
                "bg-slate-900 shadow-slate-200"
              )}>
                {cluster.type === 'web' ? <Server className="h-7 w-7" /> :
                 cluster.type === 'db' ? <Database className="h-7 w-7" /> :
                 cluster.type === 'cache' ? <Zap className="h-7 w-7" /> :
                 <HardDrive className="h-7 w-7" />}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{cluster.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    cluster.status === 'Healthy' ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"
                  )} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol: {cluster.status}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{cluster.load}%</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Load</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compute Stress Node</p>
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Limit: 90%</p>
             </div>
             <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    cluster.load > 80 ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : 
                    cluster.load > 50 ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : 
                    "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  )} 
                  style={{ width: `${cluster.load}%` }} 
                />
             </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Firewall: ACTIVE</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Sync: 12ms ago</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
