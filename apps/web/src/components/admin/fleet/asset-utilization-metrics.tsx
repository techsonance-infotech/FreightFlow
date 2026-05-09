'use client';

import React from 'react';
import { Truck, Zap, Activity, ShieldCheck, TrendingUp, Globe } from 'lucide-react';

export function AssetUtilizationMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <FleetStatCard 
        label="Total Managed Assets" 
        value={metrics.totalVehicles.toLocaleString()}
        sub="ACTIVE FLEET NODE"
        icon={<Truck className="h-6 w-6" />}
        color="blue"
      />
      <FleetStatCard 
        label="Active Dispatches" 
        value={metrics.activeTrips.toLocaleString()}
        sub="LIVE MOVEMENTS"
        icon={<Zap className="h-6 w-6" />}
        color="emerald"
      />
      <FleetStatCard 
        label="Platform Utilization" 
        value={`${metrics.utilizationRate}%`}
        sub="THROUGHPUT INDEX"
        icon={<Activity className="h-6 w-6" />}
        color="indigo"
      />
      <FleetStatCard 
        label="Fleet Compliance" 
        value={`${metrics.fleetHealth}%`}
        sub="DOCUMENT INTEGRITY"
        icon={<ShieldCheck className="h-6 w-6" />}
        color="amber"
      />
    </div>
  );
}

function FleetStatCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    indigo: 'bg-indigo-600 shadow-indigo-200',
    amber: 'bg-amber-500 shadow-amber-200'
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className={`h-14 w-14 ${colors[color]} rounded-2xl flex items-center justify-center text-white shadow-xl mb-8 relative z-10 rotate-3 group-hover:rotate-0 transition-transform`}>
        {icon}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub}</p>
        </div>
      </div>
    </div>
  );
}
