'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, Activity, FileText, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ComplianceMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <MetricCard 
        label="Platform Compliance" 
        value={`${metrics.complianceRate}%`}
        sub="IMMUTABLE INTEGRITY"
        icon={<ShieldCheck className="h-6 w-6" />}
        color="blue"
      />
      <MetricCard 
        label="Expiring Nodes" 
        value={metrics.expiringCount.toString()}
        sub="REACTION REQUIRED"
        icon={<AlertTriangle className="h-6 w-6" />}
        color="rose"
      />
      <MetricCard 
        label="Pending KYC" 
        value={metrics.pendingKyc.toString()}
        sub="WORKSPACES ONBOARDING"
        icon={<Clock className="h-6 w-6" />}
        color="amber"
      />
      <MetricCard 
        label="Sovereign Integrity" 
        value="STABLE"
        sub="PROTOCOL STATUS"
        icon={<Activity className="h-6 w-6" />}
        color="emerald"
      />
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-200',
    rose: 'bg-rose-500 shadow-rose-200',
    amber: 'bg-amber-500 shadow-amber-200',
    emerald: 'bg-emerald-500 shadow-emerald-200'
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className={`h-14 w-14 ${colors[color]} rounded-2xl flex items-center justify-center text-white shadow-xl mb-8 relative z-10 rotate-3 group-hover:rotate-0 transition-transform`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}
