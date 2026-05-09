'use client';

import React from 'react';
import { Globe, MapPin, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IngressPulse() {
  const regions = [
    { name: 'Mumbai (Asia)', reqs: '420K', latency: '12ms', status: 'Optimal' },
    { name: 'Singapore (Asia)', reqs: '210K', latency: '28ms', status: 'Optimal' },
    { name: 'London (EU)', reqs: '580K', latency: '42ms', status: 'Peak' },
    { name: 'Virginia (US)', reqs: '120K', latency: '98ms', status: 'Latency Alert' },
  ];

  return (
    <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 relative z-10">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/10">
            <Globe className="h-10 w-10 text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-4xl font-black tracking-tighter">Global Ingress Pulse</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mt-2">Geographic Traffic Distribution Protocols</p>
          </div>
        </div>

        <div className="flex items-center gap-12 bg-white/5 p-6 rounded-[2rem] border border-white/5">
           <div className="text-center">
              <p className="text-2xl font-black tracking-tighter">14</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Edge Nodes</p>
           </div>
           <div className="h-10 w-px bg-white/10" />
           <div className="text-center">
              <p className="text-2xl font-black tracking-tighter">12ms</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Avg Latency</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {regions.map((region) => (
          <div key={region.name} className="space-y-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{region.name}</span>
              </div>
              <div className={cn(
                "h-2 w-2 rounded-full",
                region.status === 'Optimal' ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              )} />
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-all duration-500">
               <p className="text-3xl font-black tracking-tighter mb-2">{region.reqs}</p>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Requests / Hr</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{region.latency}</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{region.status}</span>
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
              Platform traffic is intelligently routed via the global edge network. Concurrency peaks in <span className="text-white">London</span> and <span className="text-white">Mumbai</span> are currently within operational tolerances.
            </p>
         </div>
         <button className="h-16 px-10 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all active:scale-[0.95]">
            Optimizing Routing Protocols
            <ArrowRight className="h-5 w-5" />
         </button>
      </div>
    </div>
  );
}
