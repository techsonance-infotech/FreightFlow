'use client';

import React from 'react';
import { Zap, Activity, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

export function ActivityMetrics({ telemetry }: { telemetry: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <MetricCard 
        label="Global Req Volume" 
        value={`${(telemetry.requestsPerHour / 1000000).toFixed(1)}M`}
        sub="REQS / HOUR"
        icon={<Activity className="h-6 w-6" />}
        trend="+12%"
        color="blue"
      />
      <MetricCard 
        label="Edge Latency" 
        value={telemetry.edgeLatency}
        sub="P99 LATENCY"
        icon={<Zap className="h-6 w-6" />}
        trend="-4ms"
        color="emerald"
      />
      <MetricCard 
        label="Global Throughput" 
        value={telemetry.throughput}
        sub="DATA / SEC"
        icon={<TrendingUp className="h-6 w-6" />}
        trend="OPTIMIZED"
        color="indigo"
      />
      <MetricCard 
        label="System Integrity" 
        value={telemetry.errorRate}
        sub="ERROR RATE"
        icon={<ShieldCheck className="h-6 w-6" />}
        trend="SECURE"
        color="amber"
      />
    </div>
  );
}

function MetricCard({ label, value, sub, icon, trend, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-600 shadow-blue-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    indigo: 'bg-indigo-600 shadow-indigo-200',
    amber: 'bg-amber-500 shadow-amber-200'
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-slate-100 transition-colors" />
      
      <div className="flex items-center justify-between mb-8">
        <div className={`h-14 w-14 ${colorMap[color]} rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{trend}</span>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub}</p>
        </div>
      </div>
    </div>
  );
}
