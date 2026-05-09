'use client';

import React from 'react';
import { 
  Zap, Shield, Globe, 
  TrendingUp, Activity,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityHeatmap({ stats }: { stats: any }) {
  const platformWeight = (stats.platformCount / stats.dailyTotal) * 100 || 0;
  const tenantWeight = (stats.tenantCount / stats.dailyTotal) * 100 || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-700">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-blue-100/50 transition-colors duration-700" />
        <div className="flex items-center gap-8 mb-12">
          <div className="h-16 w-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3 group-hover:rotate-12 transition-transform duration-500">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.dailyTotal}</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">Total Operations</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-inner border border-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${platformWeight}%` }} />
            <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${tenantWeight}%` }} />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
            <span>Governance: {platformWeight.toFixed(0)}%</span>
            <span>Tenants: {tenantWeight.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-700">
        <div className="flex items-center gap-8 mb-12">
          <div className="h-16 w-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.platformCount}</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">Admin Interventions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cross-Tenant Stream Active</span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-700">
        <div className="flex items-center gap-8 mb-12">
          <div className="h-16 w-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-6 group-hover:rotate-0 transition-transform duration-500">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.tenantCount}</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">Tenant Mutations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fleet Operations Synced</span>
        </div>
      </div>
    </div>
  );
}
