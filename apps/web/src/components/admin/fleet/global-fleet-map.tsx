'use client';

import React from 'react';
import { Globe, MapPin, Zap, ArrowUpRight, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalFleetMap({ nodes }: { nodes: any[] }) {
  return (
    <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 relative z-10">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border border-white/10">
            <Globe className="h-10 w-10 text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-4xl font-black tracking-tighter">Global Fleet Pulse</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mt-2">Real-time Cross-Tenant Geographic Oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-12 bg-white/5 p-6 rounded-[2rem] border border-white/5">
           <div className="text-center">
              <p className="text-2xl font-black tracking-tighter">{nodes.reduce((acc, n) => acc + n.assets, 0)}</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Assets</p>
           </div>
           <div className="h-10 w-px bg-white/10" />
           <div className="text-center">
              <p className="text-2xl font-black tracking-tighter">12ms</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Sync Latency</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {nodes.map((node) => (
          <div key={node.city} className="space-y-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{node.city} Hub</span>
              </div>
              <div className={cn(
                "h-2 w-2 rounded-full",
                node.activity === 'High' ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
              )} />
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]">
               <p className="text-3xl font-black tracking-tighter mb-2">{node.assets}</p>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Vehicles</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ACTIVITY: {node.activity}</span>
                  <Navigation className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 pt-10 border-t border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
               <Zap className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-xl">
              Platform assets are synchronized via high-frequency GPS telemetry. Global concurrency is currently <span className="text-white">OPTIMIZED</span> with zero reported data drops in the last 60 minutes.
            </p>
         </div>
         <button className="h-16 px-10 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-[0.98]">
            Initializing Path Optimization
            <ArrowUpRight className="h-5 w-5" />
         </button>
      </div>
    </div>
  );
}
